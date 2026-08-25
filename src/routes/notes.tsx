import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Flag, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { summarizeNotes } from "@/lib/assistant.functions";
import { useTasks } from "@/lib/tasks";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Momentum" },
      {
        name: "description",
        content:
          "Summarize meeting transcripts into concise bullets with key decisions, action items and deadlines, then convert them into tasks.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Momentum" },
      {
        property: "og:description",
        content: "Turn transcripts into decisions, action items and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

const SAMPLE = `Anna: Thanks everyone for joining the Q3 roadmap sync.
David: We agreed onboarding redesign should ship before the billing work.
Priya: Agreed. I'll circulate the revised timeline by Friday.
David: I'll draft the API contract for the billing service, due next Friday.
Anna: Mobile beta invite list needs to be finalized by the 27th.
Priya: Two risks flagged for the on-call rotation, we'll review next week.`;

function NotesPage() {
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addTasks } = useTasks();

  const run = useServerFn(summarizeNotes);
  const mutation = useMutation({
    mutationFn: (input: { transcript: string; title?: string | undefined }) =>
      run({ data: input as never }),
    onError: (error: Error) => toast.error(error.message || "Could not summarize the notes."),
  });

  const summary = mutation.data;

  return (
    <AppShell eyebrow="Meeting Summarizer" title="Summarize your meeting">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          className="lg:col-span-5"
          eyebrow="Transcript"
          eyebrowClass="text-ember"
          title="Paste or upload notes"
        >
          <label className="mt-4 block">
            <span className="text-[11px] font-medium text-muted-foreground">
              Meeting title (optional)
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 Roadmap Sync"
              className="mt-1 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-[13px] outline-none focus:border-cobalt"
            />
          </label>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={12}
            placeholder="Paste the transcript or your raw notes here…"
            className="mt-3 w-full resize-none rounded-xl border border-ink/10 bg-surface px-3.5 py-3 text-[13px] outline-none focus:border-cobalt"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.vtt,.srt,text/plain"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setTranscript(await file.text());
                if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
                toast.success(`Loaded ${file.name}`);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-[13px] font-medium text-muted-foreground"
            >
              <Upload className="size-4" /> Upload .txt
            </button>
            <button
              onClick={() => {
                setTranscript(SAMPLE);
                setTitle("Q3 Roadmap Sync");
              }}
              className="rounded-lg border border-ink/10 px-3 py-2 text-[13px] font-medium text-muted-foreground"
            >
              Use sample
            </button>
          </div>

          <button
            disabled={!transcript.trim() || mutation.isPending}
            onClick={() => mutation.mutate({ transcript, title: title || undefined })}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-cobalt py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {mutation.isPending ? "Summarizing…" : "Summarize notes"}
          </button>
        </Panel>

        <Panel
          className="lg:col-span-7"
          eyebrow="Summary"
          eyebrowClass="text-sage"
          title={summary?.title ?? "Key decisions, actions & deadlines"}
          aside={summary ? <Chip tone="sage">Ready</Chip> : undefined}
        >
          {!summary && !mutation.isPending && (
            <p className="mt-6 text-[13px] text-muted-foreground">
              Add a transcript on the left and the summary will appear here as concise bullets.
            </p>
          )}

          {mutation.isPending && (
            <div className="mt-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-secondary" />
              ))}
            </div>
          )}

          {summary && (
            <>
              <div className="mt-4 rounded-xl bg-sage/8 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sage">
                  Overview
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {summary.summary}
                </p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-cobalt">
                    <Flag className="size-3.5" /> Key decisions
                  </p>
                  <ul className="mt-2 space-y-2">
                    {summary.decisions.map((d) => (
                      <li
                        key={d}
                        className="rounded-lg border border-ink/10 p-3 text-[13px] text-muted-foreground"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ember">
                    <CheckCircle2 className="size-3.5" /> Action items
                  </p>
                  <ul className="mt-2 space-y-2">
                    {summary.actionItems.map((a) => (
                      <li key={a.task} className="rounded-lg border border-ink/10 p-3 text-[13px]">
                        <p className="text-muted-foreground">{a.task}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {[a.owner ?? "Unassigned", a.due ?? "No date"].join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber">
                  <CalendarClock className="size-3.5" /> Deadlines
                </p>
                <ul className="mt-2 grid gap-2 md:grid-cols-2">
                  {summary.deadlines.map((d) => (
                    <li
                      key={d.what}
                      className="flex items-center justify-between rounded-lg border border-ink/10 p-3 text-[13px] text-muted-foreground"
                    >
                      <span>{d.what}</span>
                      <span className="font-medium text-ink">{d.when}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  addTasks(
                    summary.actionItems.map((a) => ({
                      title: a.task,
                      category: "work" as const,
                      priority: "medium" as const,
                      due: a.due && /^\d{4}-\d{2}-\d{2}$/.test(a.due) ? a.due : null,
                      suggestedSlot: null,
                      estimateMinutes: 30,
                      remindAt: null,
                    })),
                  );
                  toast.success("Action items added to your planner");
                  void navigate({ to: "/tasks" });
                }}
                className="mt-5 w-full rounded-lg bg-ink py-2.5 text-[13px] font-semibold text-card"
              >
                Convert action items to tasks
              </button>
            </>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
