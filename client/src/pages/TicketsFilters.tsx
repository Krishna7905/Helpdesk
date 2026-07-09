import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ticketStatuses, statusLabel } from "core/constants/ticket-status.ts";
import type { TicketFilters } from "./TicketsPage";

const ALL = "__all__";

interface TicketsFiltersProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
}

export default function TicketsFilters({
  filters,
  onChange,
}: TicketsFiltersProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background to-background/60">
        <CardTitle className="text-xl">Refine queue</CardTitle>
        <CardDescription>
          Use search and filters to narrow the queue without losing context.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_0.7fr_0.8fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={filters.search ?? ""}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value || undefined })
              }
              className="pl-9"
            />
          </div>

          <Select
            value={filters.status ?? ALL}
            onValueChange={(value) =>
              onChange({
                ...filters,
                status: value === ALL ? undefined : (value as TicketFilters["status"]),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {ticketStatuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category ?? ALL}
            onValueChange={(value) =>
              onChange({
                ...filters,
                category:
                  value === ALL ? undefined : (value as TicketFilters["category"]),
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              <SelectItem value="general_question">General question</SelectItem>
              <SelectItem value="technical_question">Technical question</SelectItem>
              <SelectItem value="refund_request">Refund request</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
