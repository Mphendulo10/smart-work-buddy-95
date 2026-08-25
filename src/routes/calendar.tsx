import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { formatDue, useTasks } from "@/lib/tasks";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Momentum" },
      {
        name: "description",
        content:
          "See your week at a glance with meetings and AI-suggested time slots for every open task.",
      },
      { property: "og:title", content: "Calendar — Momentum" },
      {
        property: "og:description",
        content: "Your week with meetings and suggested focus blocks.",
      },
    ],
  }),
  component: CalendarPage,
});

const meetings = [
  { day: 0, time: "13:00", label: "Team standup", length: "30 min" },
  { day: 1, time: "10:00", label: "Client call — Alvarez", length: "45 min" },
  { day: 2, time: "15:00", label: "Design review", length: "60 min" },
  { day: 4, time: "09:30", label: "Weekly planning", length: "30 min" },
];

function CalendarPage() {
  const { tasks } = useTasks();
  const open = tasks.filter((t) => !t.done);

  const start = new Date();
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = [...Array(5)].map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <AppShell eyebrow="Calendar" title="Your week at a glance">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          className="lg:col-span-8"
          eyebrow="This week"
          eyebrowClass="text-muted-foreground"
          title="Meetings & focus blocks"
        >
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {days.map((d, i) => (
              <div key={i} className="rounded-xl border border-ink/10 bg-surface p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </p>
                <p className="font-display text-lg font-bold">{d.getDate()}</p>
                <div className="mt-3 space-y-2">
                  {meetings
                    .filter((m) => m.day === i)
                    .map((m) => (
                      <div key={m.label} className="rounded-lg bg-card p-2">
                        <p className="text-[11px] font-medium text-cobalt">{m.time}</p>
                        <p className="text-[12px] font-medium leading-tight">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.length}</p>
                      </div>
                    ))}
                  {open
                    .filter((t) => t.suggestedSlot)
                    .slice(i, i + 1)
                    .map((t) => (
                      <div key={t.id} className="rounded-lg border border-cobalt/25 bg-cobalt/5 p-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-cobalt">
                          Suggested
                        </p>
                        <p className="text-[12px] font-medium leading-tight">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground">{t.suggestedSlot}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          className="lg:col-span-4"
          eyebrow="Unscheduled"
          eyebrowClass="text-ember"
          title="Waiting for a slot"
        >
          <div className="mt-4 space-y-2.5">
            {open.filter((t) => !t.suggestedSlot).length === 0 && (
              <p className="py-6 text-[13px] text-muted-foreground">
                Everything open has a suggested slot. Nice.
              </p>
            )}
            {open
              .filter((t) => !t.suggestedSlot)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDue(t.due)}</p>
                  </div>
                  <Chip tone={t.category === "urgent" ? "ember" : "cobalt"}>{t.priority}</Chip>
                </div>
              ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
