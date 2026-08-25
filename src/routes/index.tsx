import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ScrollText, ListChecks, Bell, ArrowRight } from "lucide-react";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { formatDue, taskProgress, useTasks } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Momentum — AI Productivity Dashboard" },
      {
        name: "description",
        content:
          "Draft emails, summarize meeting notes, and turn action items into scheduled tasks — all from one AI workspace.",
      },
      { property: "og:title", content: "Momentum — AI Productivity Dashboard" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meeting notes, and turn action items into scheduled tasks — all from one AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    eyebrow: "Smart Email Generator",
    title: "Draft a professional email",
    copy: "Turn a one-line brief into subject options, greeting, context and closing — in your chosen tone.",
  },
  {
    to: "/notes",
    icon: ScrollText,
    eyebrow: "Meeting Summarizer",
    title: "Summarize a transcript",
    copy: "Paste or upload notes and get decisions, action items and deadlines as clean bullets.",
  },
  {
    to: "/tasks",
    icon: ListChecks,
    eyebrow: "Task Planner",
    title: "Schedule your action items",
    copy: "Convert action items into prioritized tasks with suggested time slots and reminders.",
  },
] as const;

function Dashboard() {
  const { tasks, toggleTask } = useTasks();
  const open = tasks.filter((t) => !t.done);
  const progress = taskProgress(tasks);
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AppShell eyebrow={today} title="Good morning, Priya">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {tools.map(({ to, icon: Icon, eyebrow, title, copy }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-ink/10 bg-card p-5 transition-shadow hover:shadow-panel lg:col-span-4"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-cobalt-soft text-cobalt">
                <Icon className="size-4.5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-cobalt">
              {eyebrow}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
          </Link>
        ))}

        <Panel
          className="lg:col-span-7"
          eyebrow="Task Planner"
          eyebrowClass="text-muted-foreground"
          title="Today's schedule"
          aside={
            <div className="flex items-center gap-2 text-[12px]">
              <Chip>{tasks.length - open.length} done</Chip>
              <Chip tone="cobalt">{open.length} open</Chip>
            </div>
          }
        >
          <div className="mt-4 space-y-2.5">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-ink/10 p-3.5"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.done ? "Mark as not done" : "Mark as done"}
                  className={`grid size-5 shrink-0 place-items-center rounded-md border-2 text-[10px] font-bold ${
                    task.done
                      ? "border-sage bg-sage/10 text-sage"
                      : "border-ink/20 text-transparent"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[13px] font-medium ${
                      task.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {task.category} · {task.suggestedSlot ?? formatDue(task.due)}
                  </p>
                </div>
                <Chip
                  tone={
                    task.done
                      ? "sage"
                      : task.category === "urgent"
                        ? "ember"
                        : task.priority === "high"
                          ? "amber"
                          : "cobalt"
                  }
                >
                  {task.done ? "Done" : task.category === "urgent" ? "Urgent" : task.priority}
                </Chip>
              </div>
            ))}
          </div>
          <Link
            to="/tasks"
            className="mt-4 block w-full rounded-lg bg-ink py-2.5 text-center text-[13px] font-semibold text-card"
          >
            Open the planner
          </Link>
        </Panel>

        <Panel
          className="lg:col-span-5"
          eyebrow="Progress today"
          eyebrowClass="text-muted-foreground"
          title="On track for your day"
        >
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <p className="font-display text-3xl font-bold">{progress}%</p>
              <p className="text-[12px] font-medium text-sage">
                {tasks.length - open.length} of {tasks.length} complete
              </p>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cobalt to-chart-5 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(
              [
                ["Work", tasks.filter((t) => t.category === "work"), "bg-cobalt"],
                ["Urgent", tasks.filter((t) => t.category === "urgent"), "bg-ember"],
                ["Personal", tasks.filter((t) => t.category === "personal"), "bg-sage"],
              ] as const
            ).map(([label, list, color]) => {
              const pct = list.length ? taskProgress(list) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-[12px] font-medium">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-muted-foreground">
                      {list.filter((t) => t.done).length} / {list.length}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-ink/10 bg-surface p-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-cobalt-soft text-cobalt">
              <Bell className="size-4" />
            </div>
            <p className="text-[12px] leading-snug text-muted-foreground">
              {open.find((t) => t.remindAt)
                ? `Reminder at ${open.find((t) => t.remindAt)!.remindAt} — ${open.find((t) => t.remindAt)!.title}`
                : "No reminders set. Add one from the planner."}
            </p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
