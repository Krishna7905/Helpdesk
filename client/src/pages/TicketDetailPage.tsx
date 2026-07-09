import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import ErrorAlert from "@/components/ErrorAlert";
import BackLink from "@/components/BackLink";
import TicketDetailSkeleton from "@/components/TicketDetailSkeleton";
import TicketDetail from "@/components/TicketDetail";
import UpdateTicket from "@/components/UpdateTicket";
import ReplyThread from "@/components/ReplyThread";
import ReplyForm from "@/components/ReplyForm";
import TicketSummary from "@/components/TicketSummary";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await axios.get<Ticket>(`/api/tickets/${id}`);
      return data;
    },
  });

  return (
    <div className="space-y-6 animate-in-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink to="/tickets">Back to tickets</BackLink>
        <div className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Ticket workspace
        </div>
      </div>

      {isLoading && <TicketDetailSkeleton />}

      {error && (
        <ErrorAlert
          message={
            axios.isAxiosError(error) && error.response?.status === 404
              ? "Ticket not found"
              : "Failed to load ticket"
          }
        />
      )}

      {ticket && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <TicketDetail ticket={ticket} />

            <TicketSummary ticket={ticket} />

            <section className="section-shell p-6 sm:p-8">
              <div className="mb-4">
                <p className="page-eyebrow">Conversation</p>
                <h2 className="mt-1 text-2xl">Replies</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Follow the thread in order and keep the response history easy
                  to scan.
                </p>
              </div>
              <ReplyThread ticket={ticket} />
            </section>

            <section className="section-shell p-6 sm:p-8 pb-8">
              <div className="mb-4">
                <p className="page-eyebrow">Compose</p>
                <h2 className="mt-1 text-2xl">Add a reply</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Draft a response, polish it, and send it back to the customer.
                </p>
              </div>
              <ReplyForm ticket={ticket} />
            </section>
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <UpdateTicket ticket={ticket} />
          </div>
        </div>
      )}
    </div>
  );
}
