"use client";
import Link from "next/link";
import { MODE_META, MODES, type Mode } from "@/lib/modes";

export interface LessonEx {
  id: string;
  skill: string;
  category: string;
  level: string;
  prompt: string;
  passage?: string;
  speak?: string;
  review?: boolean;
}

export interface GradeResp {
  correct: boolean;
  expected: string;
  corrections: { type: string; expected: string; got: string; hint: string }[];
  skill: string;
  category: string;
  streak: number;
  leveledUp: string | null;
  tip: string | null;
}

export async function fetchNext(params: Record<string, string>, exclude: string[]): Promise<LessonEx> {
  const q = new URLSearchParams({ ...params, ...(exclude.length ? { exclude: exclude.join(",") } : {}) });
  const r = await fetch(`/api/lesson/next?${q.toString()}`);
  if (!r.ok) throw new Error(`No pude cargar (HTTP ${r.status}). Reintenta.`);
  return r.json();
}

export async function sendGrade(id: string, answer: string): Promise<GradeResp> {
  const r = await fetch("/api/lesson/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, answer }),
  });
  if (!r.ok) throw new Error(`No pude corregir (HTTP ${r.status}). Reintenta.`);
  return r.json();
}

export function ModeTabs({ active }: { active: Mode | "mixto" }) {
  const tabs: { href: string; label: string; icon: string; key: string }[] = [
    { href: "/lesson", label: "Mixto", icon: "🔀", key: "mixto" },
    ...MODES.map((m) => ({ href: `/practice?mode=${m}`, label: MODE_META[m].label, icon: MODE_META[m].icon, key: m })),
  ];
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Elige skill">
      {tabs.map((t) => (
        <Link
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          href={t.href}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            active === t.key
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          {t.icon} {t.label}
        </Link>
      ))}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <p>{message}</p>
      <button className="mt-2 rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

export function TipBox({ tip }: { tip: string | null }) {
  if (!tip) return null;
  return (
    <p className="mt-2 rounded-2xl bg-sky-100 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-200">
      📖 Para sonar nativo: {tip}
    </p>
  );
}
