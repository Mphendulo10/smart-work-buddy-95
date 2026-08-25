import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Chip, Panel } from "@/components/AppShell";
import { generateEmail } from "@/lib/assistant.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Momentum" },
      {
        name: "description",
        content:
          "Turn a one-line brief into a polished email with subject options, greeting, context and closing in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator — Momentum" },
      {
        property: "og:description",
        content: "Compose professional emails from short prompts, with tone control.",
      },
    ],
  }),
  component: EmailPage,
});

const tones = ["formal", "friendly", "persuasive"] as const;

function EmailPage() {
  const [brief, setBrief] = useState("thank client for the meeting, confirm next steps");
  const [tone, setTone] = useState<(typeof tones)[number]>("formal");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("Priya Nair");
  const [subjectIndex, setSubjectIndex] = useState(0);

  const run = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: (input: {
      brief: string;
      tone: string;
      recipient?: string | undefined;
      sender?: string | undefined;
    }) => run({ data: input as never }),
    onSuccess: () => setSubjectIndex(0),
    onError: (error: Error) => toast.error(error.message || "Could not generate the email."),
  });

  const draft = mutation.data;
  const fullText = draft
    ? [
        `Subject: ${draft.subjectOptions[subjectIndex] ?? draft.subjectOptions[0]}`,
        "",
        draft.greeting,
        "",
        ...draft.body,
        "",
        draft.closing,
        "",
        draft.signOff,
      ].join("\n")
    : "";

  return (
    <AppShell eyebrow="Smart Email Generator" title="Draft a professional email">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Panel
          className="lg:col-span-5"
          eyebrow="Brief"
          title="What should this email do?"
          aside={<Chip>Gmail</Chip>}
        >
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder="e.g. thank client for the meeting, confirm next steps"
            className="mt-4 w-full resize-none rounded-xl border border-ink/10 bg-surface px-3.5 py-3 text-[13px] outline-none focus:border-cobalt"
          />

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-medium text-muted-foreground">Recipient</span>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Ms. Alvarez"
                className="mt-1 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-[13px] outline-none focus:border-cobalt"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-medium text-muted-foreground">Your name</span>
              <input
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-[13px] outline-none focus:border-cobalt"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Tone</span>
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                  tone === t
                    ? "bg-cobalt text-primary-foreground"
                    : "border border-ink/10 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            disabled={!brief.trim() || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                brief,
                tone,
                recipient: recipient || undefined,
                sender: sender || undefined,
              })
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cobalt py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {mutation.isPending ? "Writing…" : "Generate email"}
          </button>
        </Panel>

        <Panel className="lg:col-span-7" eyebrow="Draft output" title="Generated email">
          {!draft && !mutation.isPending && (
            <p className="mt-6 text-[13px] text-muted-foreground">
              Your draft will appear here with three subject line options, a greeting, context
              paragraphs and a closing.
            </p>
          )}

          {mutation.isPending && (
            <div className="mt-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-secondary" />
              ))}
            </div>
          )}

          {draft && (
            <>
              <div className="mt-4 rounded-xl bg-surface p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Subject options
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {draft.subjectOptions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setSubjectIndex(i)}
                      className={`rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                        i === subjectIndex
                          ? "bg-cobalt text-primary-foreground"
                          : "border border-ink/10 bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-ink/10 bg-card p-4 text-[13px] leading-relaxed">
                  <p>{draft.greeting}</p>
                  {draft.body.map((p, i) => (
                    <p key={i} className="mt-3 text-muted-foreground">
                      {p}
                    </p>
                  ))}
                  <p className="mt-3 text-muted-foreground">{draft.closing}</p>
                  <p className="mt-3 whitespace-pre-line">{draft.signOff}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    void navigator.clipboard.writeText(fullText);
                    toast.success("Draft copied to clipboard");
                  }}
                  className="flex items-center gap-2 rounded-lg bg-cobalt px-4 py-2 text-[13px] font-semibold text-primary-foreground"
                >
                  <Copy className="size-4" /> Copy draft
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(draft.subjectOptions[subjectIndex] ?? "")}&body=${encodeURIComponent(
                    [draft.greeting, "", ...draft.body, "", draft.closing, "", draft.signOff].join(
                      "\n",
                    ),
                  )}`}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-[13px] font-medium text-muted-foreground"
                >
                  Open in email client
                </a>
                <button
                  onClick={() =>
                    mutation.mutate({
                      brief,
                      tone,
                      recipient: recipient || undefined,
                      sender: sender || undefined,
                    })
                  }
                  className="rounded-lg border border-ink/10 px-4 py-2 text-[13px] font-medium text-muted-foreground"
                >
                  Regenerate
                </button>
              </div>
            </>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
