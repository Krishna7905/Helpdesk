import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { validate } from "../lib/validate";
import { parseId } from "../lib/parse-id";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createReplySchema, polishReplySchema } from "core/schemas/replies.ts";
import prisma from "../db";
import { sendEmailJob } from "../lib/send-email";
import { canAccessTicket } from "../lib/ticket-access";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ replies });
});

router.post("/", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);
  if (!ticketId) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(createReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const reply = await prisma.reply.create({
    data: {
      body: data.body,
      senderType: "agent",
      ticketId,
      userId: req.user.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  await sendEmailJob({
    to: ticket.senderEmail,
    subject: `Re: ${ticket.subject}`,
    body: data.body,
  });

  res.status(201).json(reply);
});

router.post("/summarize", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);

  if (!ticketId) {
    return res.status(400).json({
      error: "Invalid ticket ID",
    });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  const replies = await prisma.reply.findMany({
    where: { ticketId },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const conversation = replies
    .map((reply) => {
      const sender =
        reply.senderType === "agent"
          ? reply.user?.name ?? "Agent"
          : ticket.senderName;

      return `${sender}: ${reply.body}`;
    })
    .join("\n\n");

  console.log("Gemini Key:", process.env.GEMINI_API_KEY);

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),

      system:
        "You summarize customer support conversations. Return ONLY a concise summary in 2-4 sentences.",

      prompt: `
Ticket Subject:
${ticket.subject}

Customer Message:
${ticket.body}

Conversation:
${conversation || "No replies yet."}
`,
    });

    return res.json({
      summary: text,
    });
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    return res.status(500).json({
      error: "Gemini failed",
    });
  }
});

router.post("/polish", requireAuth, async (req, res) => {
  const ticketId = parseId(req.params.ticketId);

  if (!ticketId) {
    return res.status(400).json({
      error: "Invalid ticket ID",
    });
  }

  const data = validate(polishReplySchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  if (!canAccessTicket(req.user, ticket as any)) {
    return res.status(404).json({
      error: "Ticket not found",
    });
  }

  const customerName = ticket.senderName.split(" ")[0];
  const agentName = "Krishna";

  console.log("Gemini Key:", process.env.GEMINI_API_KEY);

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),

      system: `
You are a professional customer support agent.

Rewrite the reply professionally.

Rules:
- Fix grammar.
- Improve clarity.
- Keep the same meaning.
- Be polite.
- Address customer as ${customerName}.
- End with:

Regards,
${agentName}

Return ONLY the rewritten reply.
      `,

      prompt: data.body,
    });

    return res.json({
      body: text,
    });
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    return res.status(500).json({
      error: "Gemini failed",
    });
  }
});

export default router;
