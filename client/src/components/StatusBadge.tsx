import { type TicketStatus, statusLabel } from "core/constants/ticket-status.ts";

const statusStyles: Record<TicketStatus, string> = {
  new: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  processing:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  open: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  resolved:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  closed: "border-border/70 bg-muted/80 text-muted-foreground",
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] shadow-sm ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      {statusLabel[status]}
    </span>
  );
}
