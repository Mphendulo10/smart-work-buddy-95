import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, CheckSquare, Mail, MessageSquare, Notebook } from "lucide-react";
import { AppShell, Chip, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Momentum" },
      {
        name: "description",
        content:
          "Connect Momentum to your email, calendar and task tools so drafts, summaries and schedules stay in sync.",
      },
      { property: "og:title", content: "Integrations — Momentum" },
      {
        property: "og:description",
        content: "Connect email, calendar and task management tools.",
      },
    ],
  }),
  component: IntegrationsPage,
});

const catalog = [
  {
    id: "gmail",
    name: "Gmail",
    icon: Mail,
    copy: "Send generated drafts straight from your inbox.",
    connected: true,
  },
  {
    id: "gcal",
    name: "Google Calendar",
    icon: Calendar,
    copy: "Read busy windows so scheduling avoids conflicts.",
    connected: true,
  },
  {
    id: "notion",
    name: "Notion",
    icon: Notebook,
    copy: "Push meeting summaries into your team wiki.",
    connected: true,
  },
  {
    id: "todoist",
    name: "Todoist",
    icon: CheckSquare,
    copy: "Mirror planner tasks with your task manager.",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    copy: "Post action items to the channel after a meeting.",
    connected: false,
  },
];

function IntegrationsPage() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(catalog.map((c) => [c.id, c.connected])),
  );

  return (
    <AppShell eyebrow="Integrations" title="Connect your tools">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {catalog.map(({ id, name, icon: Icon, copy }) => (
          <Panel key={id}>
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-cobalt-soft text-cobalt">
                <Icon className="size-5" />
              </span>
              {connected[id] ? <Chip tone="sage">Connected</Chip> : <Chip>Not connected</Chip>}
            </div>
            <h2 className="mt-4 font-display text-base font-semibold">{name}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{copy}</p>
            <button
              onClick={() => setConnected((prev) => ({ ...prev, [id]: !prev[id] }))}
              className={`mt-4 w-full rounded-lg py-2 text-[13px] font-semibold transition-colors ${
                connected[id]
                  ? "border border-ink/10 text-muted-foreground hover:bg-secondary"
                  : "bg-cobalt text-primary-foreground"
              }`}
            >
              {connected[id] ? "Disconnect" : "Connect"}
            </button>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
