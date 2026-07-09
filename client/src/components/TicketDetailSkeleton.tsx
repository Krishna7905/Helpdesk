import { Skeleton } from "@/components/ui/skeleton";

export default function TicketDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-border/70 bg-card/80 p-6 shadow-[0_20px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-10 w-full max-w-2xl rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-[1.75rem]" />
          <Skeleton className="h-40 rounded-[1.75rem]" />
        </div>
        <Skeleton className="h-[28rem] rounded-[1.75rem]" />
      </div>
    </div>
  );
}
