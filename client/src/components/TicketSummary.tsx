import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { type Ticket } from "core/constants/ticket.ts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ErrorAlert from "@/components/ErrorAlert";

interface TicketSummaryProps {
  ticket: Ticket;
}

export default function TicketSummary({ ticket }: TicketSummaryProps) {
  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `/api/tickets/${ticket.id}/replies/summarize`
      );
      return data.summary as string;
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background to-background/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <Sparkles className="h-4 w-4 text-primary" />
              AI summary
            </CardTitle>
            <CardDescription>
              Generate a concise recap of the conversation thread.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => summarizeMutation.mutate()}
            disabled={summarizeMutation.isPending}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            {summarizeMutation.isPending ? "Summarizing..." : "Summarize"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {summarizeMutation.error && (
          <ErrorAlert
            error={summarizeMutation.error}
            fallback="Failed to generate summary"
          />
        )}

        {summarizeMutation.data ? (
          <div className="rounded-2xl border border-chart-3/25 bg-chart-3/5 p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-chart-3/15">
                <Sparkles className="h-3.5 w-3.5 text-chart-3" />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {summarizeMutation.data}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No summary yet. Use the button above to produce a quick overview of
            the ticket conversation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
