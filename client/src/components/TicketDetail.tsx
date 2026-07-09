import DOMPurify from "dompurify";
import { type Ticket } from "core/constants/ticket.ts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";

interface TicketDetailProps {
  ticket: Ticket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-r from-background to-background/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {ticket.subject}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {ticket.senderName} · {ticket.senderEmail}
            </CardDescription>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="px-3 py-1">
            Created {new Date(ticket.createdAt).toLocaleString()}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Updated {new Date(ticket.updatedAt).toLocaleString()}
          </Badge>
          {ticket.createdBy && (
            <Badge variant="outline" className="px-3 py-1">
              Added by {ticket.createdBy.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="prose prose-slate max-w-none pt-6 dark:prose-invert">
        {ticket.bodyHtml ? (
          <div
            className="[&_*]:leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(ticket.bodyHtml),
            }}
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
            {ticket.body}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
