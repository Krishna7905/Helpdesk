import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import { ticketCategories, categoryLabel } from "core/constants/ticket-category.ts";
import { createTicketSchema, type CreateTicketInput } from "core/schemas/tickets.ts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

const defaultValues: CreateTicketInput = {
  senderName: "",
  senderEmail: "",
  subject: "",
  body: "",
  category: "general_question",
};

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateTicketDialog({
  open,
  onOpenChange,
}: CreateTicketDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateTicketInput) => {
      const { data } = await axios.post("/api/tickets", payload);
      return data.ticket as { id: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-daily-volume"] });
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      mutation.reset();
    }
  }, [form.reset, mutation.reset, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Agent Ticket</DialogTitle>
          <DialogDescription>
            Your agent account is captured automatically. Enter the customer details and the issue they reported.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="senderName">Customer Name</Label>
              <Input
                id="senderName"
                placeholder="Enter customer name"
                aria-invalid={!!form.formState.errors.senderName}
                {...form.register("senderName")}
              />
              {form.formState.errors.senderName && (
                <ErrorMessage message={form.formState.errors.senderName.message} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderEmail">Customer Email</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="customer@example.com"
                aria-invalid={!!form.formState.errors.senderEmail}
                {...form.register("senderEmail")}
              />
              {form.formState.errors.senderEmail && (
                <ErrorMessage message={form.formState.errors.senderEmail.message} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Short issue summary"
              aria-invalid={!!form.formState.errors.subject}
              {...form.register("subject")}
            />
            {form.formState.errors.subject && (
              <ErrorMessage message={form.formState.errors.subject.message} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryLabel[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Issue Details</Label>
            <Textarea
              id="body"
              placeholder="Describe the customer's issue in detail"
              rows={6}
              aria-invalid={!!form.formState.errors.body}
              {...form.register("body")}
            />
            {form.formState.errors.body && (
              <ErrorMessage message={form.formState.errors.body.message} />
            )}
          </div>

          {mutation.error && (
            <ErrorAlert error={mutation.error} fallback="Failed to create ticket" />
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
