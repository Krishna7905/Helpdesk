import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "../lib/auth-client";
import { useTheme } from "../lib/theme";
import {
  LayoutDashboard,
  Ticket,
  Users,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const initial = session?.user?.name?.trim().slice(0, 1).toUpperCase() ?? "H";

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--primary)_70%,black)]"
        : "border border-transparent text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
    }`;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/72 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/" className="group flex shrink-0 items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--primary)_70%,black)] ring-1 ring-white/20 transition-transform duration-300 group-hover:-translate-y-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">
                    Helpdesk
                  </span>
                  <span className="rounded-full border border-border/70 bg-card/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unified support operations console
                </p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <NavLink to="/" end className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/tickets" className={navLinkClass}>
                <Ticket className="h-4 w-4" />
                Tickets
              </NavLink>
              {session?.user?.role === Role.admin && (
                <NavLink to="/users" className={navLinkClass}>
                  <Users className="h-4 w-4" />
                  Users
                </NavLink>
              )}
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="hidden items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-300 sm:inline-flex">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                System online
              </div>
              <button
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/75 text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/75 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initial}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session?.user?.role ?? "user"}
                  </div>
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-card/75 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-destructive/25 hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex w-full max-w-[1536px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-in-page">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
