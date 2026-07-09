import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ErrorAlert from "@/components/ErrorAlert";
import PageHeader from "@/components/PageHeader";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";

interface EditingUser {
  id: string;
  name: string;
  email: string;
}

interface DeletingUser {
  id: string;
  name: string;
}

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; user: EditingUser }
  | null;

export default function UsersPage() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingUser, setDeletingUser] = useState<DeletingUser | null>(null);
  const queryClient = useQueryClient();

  const close = () => setDialog(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
    },
  });

  return (
    <div className="space-y-6 animate-in-page">
      <PageHeader
        eyebrow="Team access"
        title="Users"
        description="Manage staff accounts, permissions, and lifecycle without leaving the admin console."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })} size="lg">
            <Plus className="h-4 w-4" />
            New User
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background to-background/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Directory</CardTitle>
              <CardDescription>
                Review account status, role, and creation date in one place.
              </CardDescription>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Staff roster
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <UsersTable
            onEdit={(user) => setDialog({ mode: "edit", user })}
            onDelete={(user) => setDeletingUser(user)}
          />
        </CardContent>
      </Card>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            key={dialog?.mode === "edit" ? dialog.user.id : "create"}
            user={dialog?.mode === "edit" ? dialog.user : undefined}
            onSuccess={close}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUser(null);
            deleteMutation.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteMutation.isError && (
            <ErrorAlert message="Failed to delete user" />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingUser && deleteMutation.mutate(deletingUser.id)
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
