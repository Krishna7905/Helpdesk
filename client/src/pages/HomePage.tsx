import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BadgeCheck,
  Clock3,
  Sparkles,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";

interface Stats {
  totalTickets: number;
  openTickets: number;
  resolvedByAI: number;
  aiResolutionRate: number;
  avgResolutionTime: number;
}

interface DailyVolume {
  data: { date: string; tickets: number }[];
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "N/A";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatCount(value: number | undefined): string {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const chartConfig = {
  tickets: {
    label: "Tickets",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function HomePage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<Stats>({
    queryKey: ["ticket-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats");
      return res.data;
    },
  });

  const {
    data: volume,
    isLoading: volumeLoading,
    error: volumeError,
  } = useQuery<DailyVolume>({
    queryKey: ["ticket-daily-volume"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats/daily-volume");
      return res.data;
    },
  });

  const volumeData = volume?.data ?? [];
  const totalWindowTickets = volumeData.reduce((sum, day) => sum + day.tickets, 0);
  const peakDay = volumeData.reduce(
    (best, day) => (day.tickets > best.tickets ? day : best),
    volumeData[0] ?? { date: "", tickets: 0 }
  );
  const activeDays = volumeData.filter((day) => day.tickets > 0).length;
  const avgDaily = volumeData.length > 0 ? Math.round(totalWindowTickets / volumeData.length) : 0;
  const recentWindow = volumeData.slice(-7).reduce((sum, day) => sum + day.tickets, 0);
  const previousWindow = volumeData.slice(-14, -7).reduce((sum, day) => sum + day.tickets, 0);
  const growthRate =
    previousWindow > 0 ? Math.round(((recentWindow - previousWindow) / previousWindow) * 100) : null;

  const cards = [
    {
      title: "Total Tickets",
      value: formatCount(stats?.totalTickets),
      icon: Ticket,
      tone: "from-cyan-500/20 to-sky-500/5",
      accent: "text-cyan-600",
    },
    {
      title: "Open Tickets",
      value: formatCount(stats?.openTickets),
      icon: BarChart3,
      tone: "from-amber-500/20 to-orange-500/5",
      accent: "text-amber-600",
    },
    {
      title: "Resolved by AI",
      value: formatCount(stats?.resolvedByAI),
      icon: Sparkles,
      tone: "from-violet-500/20 to-fuchsia-500/5",
      accent: "text-violet-600",
    },
    {
      title: "AI Resolution Rate",
      value: stats ? `${stats.aiResolutionRate}%` : "N/A",
      icon: TrendingUp,
      tone: "from-emerald-500/20 to-teal-500/5",
      accent: "text-emerald-600",
    },
    {
      title: "Avg Resolution Time",
      value: stats ? formatDuration(stats.avgResolutionTime) : "N/A",
      icon: Clock3,
      tone: "from-slate-500/20 to-slate-500/5",
      accent: "text-slate-600",
    },
  ];

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]">
        <div className="absolute left-[-8rem] top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-6rem] top-12 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--card)_94%,white)_0%,color-mix(in_oklab,var(--background)_95%,var(--primary)_5%)_45%,color-mix(in_oklab,var(--card)_92%,black)_100%)] p-6 shadow-[0_28px_100px_-60px_rgba(15,23,42,0.6)] backdrop-blur-xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_center,black_52%,transparent_100%)] opacity-35" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1.5 border border-border/50 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em]">
                <Sparkles className="h-3.5 w-3.5" />
                AI command center
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-[11px] uppercase tracking-[0.2em]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Live metrics
              </Badge>
            </div>

            <div className="max-w-3xl space-y-4">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                A futuristic helpdesk command center built for fast operations.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Monitor ticket volume, AI resolution, and response health from one polished surface.
                The layout is tuned for clarity, speed, and a premium enterprise feel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/tickets">
                  Open tickets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tickets?status=open">
                  Review queue
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Active days</p>
                <p className="mt-2 text-2xl font-semibold">{volumeLoading ? "..." : activeDays}</p>
                <p className="mt-1 text-xs text-muted-foreground">Days with ticket activity in the last 30 days</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">30-day total</p>
                <p className="mt-2 text-2xl font-semibold">{volumeLoading ? "..." : totalWindowTickets}</p>
                <p className="mt-1 text-xs text-muted-foreground">Tickets created across the rolling window</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Peak day</p>
                <p className="mt-2 text-lg font-semibold">
                  {volumeLoading || !peakDay.date ? "N/A" : formatDateLabel(peakDay.date)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {volumeLoading || !peakDay.date ? "No trend data yet" : `${peakDay.tickets} tickets`}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Weekly trend</p>
                <p className="mt-2 text-2xl font-semibold">
                  {volumeLoading || growthRate === null ? "N/A" : `${growthRate > 0 ? "+" : ""}${growthRate}%`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Compared with the previous 7 days</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_32%)]" />
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">System status</p>
                  <h2 className="mt-1 text-xl font-semibold">Operational pulse</h2>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                  Stable
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resolution quality</p>
                  <p className="mt-3 text-3xl font-semibold">{stats ? `${stats.aiResolutionRate}%` : "N/A"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">AI-assisted closures in visible scope</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/90 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Queue pressure</p>
                  <p className="mt-3 text-3xl font-semibold">{formatCount(stats?.openTickets)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Tickets currently waiting for attention</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border/70 bg-card/80 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Average resolution time</span>
                  <span className="font-medium">{stats ? formatDuration(stats.avgResolutionTime) : "N/A"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
                    style={{
                      width: stats ? `${Math.min(100, Math.max(20, stats.aiResolutionRate || 0))}%` : "0%",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>AI confidence signal</span>
                    <span>{stats ? `${Math.min(100, Math.max(20, stats.aiResolutionRate || 0))}%` : "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Daily average</p>
                  <p className="mt-2 text-2xl font-semibold">{volumeLoading ? "..." : avgDaily}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI resolved</p>
                  <p className="mt-2 text-2xl font-semibold">{formatCount(stats?.resolvedByAI)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {statsError && (
        <ErrorAlert
          error={statsError}
          fallback="Failed to load dashboard stats"
        />
      )}
      {volumeError && (
        <ErrorAlert
          error={volumeError}
          fallback="Failed to load chart data"
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, index) => (
          <Card
            key={card.title}
            className={`relative overflow-hidden border-border/70 bg-gradient-to-br ${card.tone} animate-in-page`}
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_36%)]" />
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-[11px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background/75 ${card.accent}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative pt-0">
              {statsLoading ? (
                <Skeleton className="h-10 w-28 rounded-xl" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background to-background/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle className="text-xl">Tickets Per Day</CardTitle>
                <CardDescription>Rolling 30-day volume with a live operational view.</CardDescription>
              </div>
              <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1">
                <BarChart3 className="h-3.5 w-3.5" />
                30 day telemetry
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {volumeError ? (
              <ErrorAlert
                error={volumeError}
                fallback="Failed to load chart data"
              />
            ) : volumeLoading ? (
              <Skeleton className="h-[340px] w-full rounded-2xl" />
            ) : volumeData.length === 0 ? (
              <div className="flex h-[340px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20">
                <div className="text-center">
                  <p className="text-sm font-medium">No ticket activity yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Once tickets are created, this chart will populate automatically.
                  </p>
                </div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[340px] w-full">
                <BarChart accessibilityLayer data={volumeData}>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={formatDateLabel}
                    interval="preserveStartEnd"
                    minTickGap={34}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value: string) => formatFullDate(value)}
                      />
                    }
                  />
                  <Bar
                    dataKey="tickets"
                    fill="var(--color-tickets)"
                    radius={[12, 12, 4, 4]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Insights</CardTitle>
              <CardDescription>Quick operational context from the current window.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Trend window</p>
                    <p className="mt-1 text-lg font-semibold">
                      {growthRate === null ? "Stable baseline" : `${growthRate > 0 ? "Up" : "Down"} ${Math.abs(growthRate)}%`}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Based on the last 7 days versus the previous 7 days.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Average daily</p>
                  <p className="mt-2 text-2xl font-semibold">{volumeLoading ? "..." : avgDaily}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Tickets per day in the last 30 days</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Peak day</p>
                  <p className="mt-2 text-lg font-semibold">
                    {volumeLoading || !peakDay.date ? "N/A" : formatDateLabel(peakDay.date)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {volumeLoading || !peakDay.date ? "No volume available" : `${peakDay.tickets} tickets on the busiest day`}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active days</span>
                  <span className="text-sm font-medium">{volumeLoading ? "..." : `${activeDays}/30`}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500"
                    style={{
                      width: `${Math.min(100, (activeDays / 30) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-background to-background/60">
              <CardTitle className="text-xl">Fast Actions</CardTitle>
              <CardDescription>Jump into the most common admin workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/tickets">
                  Manage tickets
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/tickets?status=open">
                  Review open queue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/users">
                  Team directory
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
