import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  chips?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  chips,
}: PageHeaderProps) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_94%,white)_0%,color-mix(in_oklab,var(--background)_92%,var(--primary)_8%)_42%,color-mix(in_oklab,var(--card)_92%,black)_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.13),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_28%)]" />
      <div className="relative flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-8">
        <div className="max-w-3xl space-y-3">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
          {chips && <div className="flex flex-wrap gap-2 pt-1">{chips}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </Card>
  );
}
