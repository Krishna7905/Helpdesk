import { Role } from "core/constants/role.ts";

export interface TicketAccessUser {
  id: string;
  role: string;
}

export interface TicketAccessRecord {
  createdById: string | null;
  status: string;
}

export function canAccessTicket(
  user: TicketAccessUser,
  ticket: TicketAccessRecord
): boolean {
  if (user.role === Role.admin) {
    return true;
  }

  if (ticket.createdById === user.id) {
    return true;
  }

  return (
    ticket.createdById === null &&
    ["open", "resolved", "closed"].includes(ticket.status)
  );
}
