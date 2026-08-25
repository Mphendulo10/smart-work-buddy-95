import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Clock, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { planTasks } from "@/lib/assistant.functions";
import { formatDue, taskProgress, useTasks, type TaskCategory } from "@/lib/tasks";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Momentum" },
      {
        name: "description",
        content:
          "Turn action items into prioritized tasks with deadlines, suggested time slots, categories, reminders and progress tracking.",
      },
      { property: "og:title", content: "AI Task Planner — Momentum" },
      {
        property: "og:description",
        content: "Prioritized tasks with AI-suggested scheduling and reminders.",
      },
    ],
  }),
  component: TasksPage,
});

const filters = ["all", "work", "personal", "urgent"] as const;

function TasksPage() {
  const { tasks, addTasks, toggleTask, removeTask, setReminder } = useTasks();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState("Mon 13:00-14:00 standup; Tue 10:00-11:00 client call");

  const run = useServerFn(planTasks);
  const mutation = useMutation({
    mutationFn: (input: { actionItems: string[]; busySlots: string[] }) =>
      run({ data: input as never }),
    onSuccess: (data) => {
      addTasks(
        data.tasks.map((t) => ({
          title: t.title,
          category: t.category as TaskCategory,
          priority: t.priority,
          due: t.due,
          suggestedSlot: t.suggestedSlot,
          estimateMinutes: Math.max(5, Math.round(t.estimateMinutes)),
          remindAt: null,
        })),
      );
      setRaw("");
      toast.success(`${data.tasks.length} tasks scheduled`);
    },
    onError: (error: Error) => toast.error(error.message || "Could not plan these tasks."),
  });

  const visible = filter === "all" ? tasks : tasks.filter((t) => t.category === filter);
  const progress = taskProgress(tasks);

  return (
    <AppShell eyebrow="Task Planner" title="Plan and schedule your work">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          className="lg:col-span-5"
          eyebrow="AI scheduling"
          title="Turn action items into tasks"
        >
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder={"One action item per line, e.g.\nDraft API contract by Friday\nBook dentist"}
            className="mt-4 w-full resize-none rounded-xl border border-ink/10 bg-surface px-3.5 py-3 text-[13px] outline-none focus:border-cobalt"
          />
          <label className="mt-3 block">
            <span className="text-[11px] font-medium text-muted-foreground">
              Calendar busy windows
            </span>
            <input
              value={busy}
              onChange={(e) => setBusy(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-[13px] outline-none focus:border-cobalt"
            />
          </label>
          <button
            disabled={!raw.trim() || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                actionItems: raw
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean),
                busySlots: busy
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-cobalt py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {mutation.isPending ? "Planning…" : "Plan & schedule"}
          </button>

          <div className="mt-6 rounded-xl border border-ink/10 bg-surface p-4">
            <div className="flex items-end justify-between">
              <p className="font-display text-2xl font-bold">{progress}%</p>
              <p className="text-[12px] font-medium text-muted-foreground">
                {tasks.filter((t) => t.done).length} of {tasks.length} complete
              </p>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cobalt to-chart-5 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Panel>

        <Panel
          className="lg:col-span-7"
          eyebrow="Your tasks"
          eyebrowClass="text-muted-foreground"
          title="Prioritized and scheduled"
          aside={
            <button
              onClick={() =>
                addTasks([
                  {
                    title: "New task",
                    category: "work",
                    priority: "medium",
                    due: null,
                    suggestedSlot: null,
                    estimateMinutes: 30,
                    remindAt: null,
                  },
                ])
              }
              className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted-foreground"
            >
              <Plus className="size-3.5" /> Add
            </button>
          }
        >
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-cobalt text-primary-foreground"
                    : "border border-ink/10 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            {visible.length === 0 && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                No tasks in this category yet.
              </p>
            )}
            {visible.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-xl border border-ink/10 p-3.5"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.done ? "Mark as not done" : "Mark as done"}
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 text-[10px] font-bold ${
                    task.done
                      ? "border-sage bg-sage/10 text-sage"
                      : "border-ink/20 text-transparent"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] font-medium ${
                      task.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="capitalize">{task.category}</span>
                    <span>{formatDue(task.due)}</span>
                    {task.suggestedSlot && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {task.suggestedSlot}
                      </span>
                    )}
                    <span>{task.estimateMinutes} min</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Chip
                    tone={
                      task.category === "urgent"
                        ? "ember"
                        : task.priority === "high"
                          ? "amber"
                          : "cobalt"
                    }
                  >
                    {task.priority}
                  </Chip>
                  <input
                    type="time"
                    value={task.remindAt ?? ""}
                    onChange={(e) => setReminder(task.id, e.target.value || null)}
                    aria-label="Reminder time"
                    className="w-[92px] rounded-lg border border-ink/10 bg-surface px-2 py-1 text-[11px] text-muted-foreground outline-none focus:border-cobalt"
                  />
                  {task.remindAt && <Bell className="size-3.5 text-cobalt" />}
                  <button
                    onClick={() => removeTask(task.id)}
                    aria-label="Delete task"
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
