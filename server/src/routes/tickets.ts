import { Router } from "express";
import { Role } from "core/constants/role.ts";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import { canAccessTicket } from "../lib/ticket-access";
import {
  createTicketSchema,
  ticketListQuerySchema,
  updateTicketSchema,
} from "core/schemas/tickets.ts";
import prisma from "../db";
import type { Prisma } from "../generated/prisma/client";
import { AI_AGENT_ID } from "core/constants/ai-agent.ts";

interface TicketStatsRow {
  totalTickets: bigint;
  openTickets: bigint;
  resolvedByAI: bigint;
  aiResolutionRate: number;
  avgResolutionTime: number;
}

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== Role.agent) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const data = validate(createTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.create({
    data: {
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      subject: data.subject,
      body: data.body,
      status: "new",
      category: data.category ?? null,
      assignedToId: null,
      createdById: req.user.id,
    } as any,
  } as any);

  res.status(201).json({ ticket });
});

router.get("/stats", requireAuth, async (req, res) => {
  const visibleWhere =
    req.user.role === Role.admin
      ? {}
      : {
          OR: [
            { createdById: req.user.id },
            {
              AND: [
                { createdById: null },
                { status: { in: ["open", "resolved", "closed"] } },
              ],
            },
          ],
        };

  const visibleTickets = await prisma.ticket.findMany({
    where: visibleWhere as any,
    select: {
      status: true,
      assignedToId: true,
      createdAt: true,
      updatedAt: true,
    },
  } as any);

  const totalTickets = visibleTickets.length;
  const openTickets = visibleTickets.filter((ticket) => ticket.status === "open").length;
  const resolvedTickets = visibleTickets.filter((ticket) => ticket.status === "resolved");
  const resolvedByAI = resolvedTickets.filter((ticket) => ticket.assignedToId === AI_AGENT_ID).length;
  const avgResolutionTime =
    resolvedTickets.length > 0
      ? Math.round(
          resolvedTickets.reduce(
            (sum, ticket) =>
              sum + (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / 1000,
            0
          ) / resolvedTickets.length
        )
      : 0;
  const aiResolutionRate =
    resolvedTickets.length > 0
      ? Math.round((resolvedByAI / resolvedTickets.length) * 1000) / 10
      : 0;

  res.json({
    totalTickets,
    openTickets,
    resolvedByAI,
    aiResolutionRate,
    avgResolutionTime,
  });
});

router.get("/stats/daily-volume", requireAuth, async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const tickets = await prisma.ticket.findMany({
    where:
      req.user.role === Role.admin
        ? { createdAt: { gte: thirtyDaysAgo } }
        : ({
            createdAt: { gte: thirtyDaysAgo },
            OR: [
              { createdById: req.user.id },
              {
                AND: [
                  { createdById: null },
                  { status: { in: ["open", "resolved", "closed"] } },
                ],
              },
            ],
          } as any),
    select: { createdAt: true },
  } as any);

  // Build a map of date -> count
  const countsByDate = new Map<string, number>();
  for (const t of tickets) {
    const dateKey = t.createdAt.toISOString().slice(0, 10);
    countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
  }

  // Fill in all 30 days (including zeros)
  const data: { date: string; tickets: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    data.push({ date: dateKey, tickets: countsByDate.get(dateKey) ?? 0 });
  }

  res.json({ data });
});

router.get("/", requireAuth, async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.TicketWhereInput = {};
  const andConditions: Prisma.TicketWhereInput[] = [];

  if (req.user.role !== Role.admin) {
    andConditions.push({
      OR: [
        { createdById: req.user.id },
        {
          AND: [
            { createdById: null },
            { status: { in: ["open", "resolved", "closed"] } },
          ],
        },
      ],
    } as any);
  }

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  if (query.category) {
    andConditions.push({ category: query.category });
  }

  if (query.search) {
    andConditions.push({
      OR: [
        { subject: { contains: query.search, mode: "insensitive" } },
        { senderName: { contains: query.search, mode: "insensitive" } },
        { senderEmail: { contains: query.search, mode: "insensitive" } },
      ],
    } as any);
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        senderName: true,
        senderEmail: true,
        createdAt: true,
      },
      where: where as any,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    } as any),
    prisma.ticket.count({ where: where as any } as any),
  ]);

  res.json({ tickets, total, page: query.page, pageSize: query.pageSize });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  } as any);

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  if (data.assignedToId) {
    const user = await prisma.user.findUnique({
      where: { id: data.assignedToId, deletedAt: null },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid agent" });
      return;
    }
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...("assignedToId" in data && { assignedToId: data.assignedToId }),
      ...("status" in data && { status: data.status }),
      ...("category" in data && { category: data.category }),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  res.json(updated);
});

export default router;
