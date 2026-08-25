import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  Mail,
  Plug,
  ScrollText,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/notes", label: "Meeting Notes", icon: ScrollText },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/integrations", label: "Integrations", icon: Plug },
] as const;

const mobileNav = nav.slice(0, 4);

export function AppShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-surface text-ink">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink/10 bg-card px-6 py-7 lg:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-cobalt font-display text-lg font-bold text-primary-foreground">
              M
            </div>
            <div>
              <p className="font-display text-[15px] font-bold leading-none">Momentum</p>
              <p className="mt-1 text-[11px] text-muted-foreground">AI productivity</p>
            </div>
          </Link>

          <nav className="mt-9 space-y-1 text-[13px] font-medium">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-ink"
                activeProps={{ className: "bg-cobalt-soft text-cobalt hover:bg-cobalt-soft" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-cobalt to-chart-5 p-4 text-primary-foreground">
            <p className="text-[12px] font-semibold">Sync status</p>
            <p className="mt-1 text-[11px] opacity-75">
              Gmail, Google Calendar &amp; Notion connected
            </p>
            <div className="mt-3 flex gap-1.5">
              <span className="size-1.5 rounded-full bg-current opacity-90" />
              <span className="size-1.5 rounded-full bg-current opacity-50" />
              <span className="size-1.5 rounded-full bg-current opacity-50" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 pb-28 lg:px-10 lg:py-8 lg:pb-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium text-muted-foreground">{eyebrow}</p>
              <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-card px-4 py-2.5 text-[13px] text-muted-foreground sm:flex">
                <Search className="size-4" />
                Search tasks, notes, emails…
              </div>
              <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-card py-1.5 pl-1.5 pr-4">
                <div className="grid size-8 place-items-center rounded-full bg-cobalt-soft font-display text-[13px] font-bold text-cobalt">
                  P
                </div>
                <span className="text-[13px] font-medium">Priya N.</span>
              </div>
            </div>
          </header>

          <div className="mt-6 lg:mt-8">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4">
          {mobileNav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center justify-center gap-1 py-3 text-muted-foreground"
              activeProps={{ className: "text-cobalt" }}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label.split(" ").at(-1)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function Panel({
  eyebrow,
  eyebrowClass = "text-cobalt",
  title,
  aside,
  className = "",
  children,
}: {
  eyebrow?: string;
  eyebrowClass?: string;
  title?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-card p-5 lg:p-6 ${className}`}>
      {(eyebrow || title || aside) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${eyebrowClass}`}
              >
                {eyebrow}
              </p>
            )}
            {title && <h2 className="mt-1 font-display text-lg font-semibold">{title}</h2>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "cobalt" | "ember" | "sage" | "amber";
}) {
  const tones = {
    neutral: "bg-secondary text-muted-foreground",
    cobalt: "bg-cobalt-soft text-cobalt",
    ember: "bg-ember/10 text-ember",
    sage: "bg-sage/10 text-sage",
    amber: "bg-amber/15 text-amber",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
