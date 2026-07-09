import { useState } from "react";
import { type TicketStatus } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import { Role } from "core/constants/role.ts";
import { Plus, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import PageHeader from "@/components/PageHeader";
import TicketsTable from "./TicketsTable";
import TicketsFilters from "./TicketsFilters";
import CreateTicketDialog from "./CreateTicketDialog";

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
}

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const { data: session } = useSession();
  const canCreateTicket = session?.user?.role === Role.agent;

  return (
    <div className="space-y-6 animate-in-page">
      <PageHeader
        eyebrow="Ticket queue"
        title="Tickets"
        description="Search, sort, and resolve the live support queue with a calmer, more focused workspace."
        actions={
          canCreateTicket ? (
            <Button onClick={() => setCreateOpen(true)} size="lg">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground">
              <SearchCheck className="h-4 w-4" />
              Queue available in read-only mode
            </div>
          )
        }
      />

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TicketsFilters filters={filters} onChange={setFilters} />
      <TicketsTable filters={filters} />
    </div>
  );
}
