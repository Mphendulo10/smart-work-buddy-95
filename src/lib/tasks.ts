import { useCallback, useEffect, useState } from "react";

export type TaskCategory = "work" | "personal" | "urgent";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  due: string | null;
  suggestedSlot: string | null;
  estimateMinutes: number;
  done: boolean;
  remindAt: string | null;
  createdAt: string;
};

const STORAGE_KEY = "momentum.tasks.v1";

function isoDay(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function seedTasks(): Task[] {
  return [
    {
      id: "seed-1",
      title: "Circulate revised Q3 timeline",
      category: "work",
      priority: "medium",
      due: isoDay(0),
      suggestedSlot: "Today 11:00-11:30",
      estimateMinutes: 30,
      done: true,
      remindAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-2",
      title: "Draft API contract for billing service",
      category: "urgent",
      priority: "high",
      due: isoDay(2),
      suggestedSlot: "Today 14:00-15:30",
      estimateMinutes: 90,
      done: false,
      remindAt: "09:30",
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-3",
      title: "Finalize mobile beta invite list",
      category: "work",
      priority: "high",
      due: isoDay(6),
      suggestedSlot: "Thu 10:00-10:45",
      estimateMinutes: 45,
      done: false,
      remindAt: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-4",
      title: "Book dentist + renew gym membership",
      category: "personal",
      priority: "low",
      due: isoDay(4),
      suggestedSlot: "Today 15:30-16:00",
      estimateMinutes: 30,
      done: false,
      remindAt: "15:15",
      createdAt: new Date().toISOString(),
    },
  ];
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: Task[] | null = null;

function read(): Task[] {
  if (cache) return cache;
  if (typeof window === "undefined") return seedTasks();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Task[]) : seedTasks();
  } catch {
    cache = seedTasks();
  }
  return cache;
}

function write(next: Task[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);

  useEffect(() => {
    const sync = () => setTasks(read());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const addTasks = useCallback((incoming: Omit<Task, "id" | "done" | "createdAt">[]) => {
    write([
      ...incoming.map((t) => ({
        ...t,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        done: false,
        createdAt: new Date().toISOString(),
      })),
      ...read(),
    ]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    write(read().map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: string) => {
    write(read().filter((t) => t.id !== id));
  }, []);

  const setReminder = useCallback((id: string, remindAt: string | null) => {
    write(read().map((t) => (t.id === id ? { ...t, remindAt } : t)));
  }, []);

  return { tasks, addTasks, toggleTask, removeTask, setReminder };
}

export function taskProgress(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}

export function formatDue(due: string | null) {
  if (!due) return "No date";
  const date = new Date(`${due}T12:00:00`);
  if (Number.isNaN(date.getTime())) return due;
  const today = new Date();
  const diff = Math.round((date.getTime() - new Date(today.toDateString()).getTime()) / 86400000);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) return `Overdue · ${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
  return `Due ${date.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`;
}
