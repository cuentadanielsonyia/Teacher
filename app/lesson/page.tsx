"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Lesson {
  id: string;
  skill: string;
  category: string;
  level: string;
  prompt: string;
}

interface Correction {
  type: string;
  expected: string;
  got: string;
  hint: string;
}

interface Grade {
  correct: boolean;
  expected: string;
  corrections: Correction[];
  skill: string;
  category: string;
  streak: number;
  leveledUp: string | null;
  tip: string | null;
}

const SKILL_LABEL: Record<string, string> = {
  gramatica: "📝 Gramática",
  vocabulario: "📚 Vocabulario",
  conversacion: "💬 Conversación",
  writing: "✍️ Writing",
  pronunciacion: "🔊 Pronunciación",
  listening: "🎧 Listening",
  reading: "📖 Reading",
};

function Chip({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {children}
    </span>
  );
}

export default function LessonPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(0);
  const seenIds = useRef<string[]>([]);
  const startRef = useRef<number>(Date.now());
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGrade(null);
    setAnswer("");
    try {
      const q = seenIds.current.length ? `?exclude=${seenIds.current.join(",")}` : "";
      const r = await fetch(`/api/lesson/next${q}`);
      if (!r.ok) throw new Error(`No pude cargar el ejercicio (HTTP ${r.status}). Reintenta.`);
      const data = (await r.json()) as Lesson;
      setLesson(data);
      seenIds.current.push(data.id);
      requestAnimationFrame(() => areaRef.current?.focus());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNext();
    startRef.current = Date.now();
    const onUnload = () => {
      const sec = Math.round((Date.now() - startRef.current) / 1000);
      if (sec > 2) {
        navigator.sendBeacon?.(
          "/api/session",
          new Blob([JSON.stringify({ durationSec: sec })], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [loadNext]);

  async function submit() {
    if (!lesson || !answer.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/lesson/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lesson.id, answer }),
      });
      if (!r.ok) throw new Error(`No pude corregir (HTTP ${r.status}). Reintenta.`);
      const g = (await r.json()) as Grade;
      setGrade(g);
      setDone((d) => d + 1);
      setStreak((s) => (g.correct ? s + 1 : 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-6 sm:p-8">
      <div className="flex items-center justify-between text-sm">
        <p className="text-zinc-500 dark:text-zinc-400">
          ✅ {done} hechas
          {streak >= 2 && (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 font-bold text-orange-700 dark:bg-orange-900 dark:text-orange-200">
              🔥 racha {streak}
            </span>
          )}
        </p>
        <a className="font-medium text-emerald-700 underline dark:text-emerald-300" href="/progress">
          Progreso →
        </a>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p>{error}</p>
          <button className="mt-2 rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white" onClick={loadNext}>
            Reintentar
          </button>
        </div>
      )}

      {!lesson && loading && (
        <div className="animate-pulse rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900" aria-busy="true" aria-label="Cargando ejercicio">
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 h-6 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-2 h-6 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-6 h-24 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      )}

      {lesson && (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap gap-2">
            <Chip tone="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              {SKILL_LABEL[lesson.skill] ?? lesson.skill}
            </Chip>
            <Chip tone="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200">{lesson.category}</Chip>
            <Chip tone="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{lesson.level}</Chip>
          </div>
          <p className="mt-4 text-xl leading-relaxed font-medium">{lesson.prompt}</p>
          <label htmlFor="answer" className="mt-4 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Tu respuesta {words > 0 && <span className="text-zinc-400">· {words} palabra{words === 1 ? "" : "s"}</span>}
          </label>
          <textarea
            id="answer"
            ref={areaRef}
            className="mt-1 w-full rounded-2xl border border-zinc-300 p-3 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-emerald-900"
            rows={3}
            value={answer}
            disabled={loading || grade !== null}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
            }}
            placeholder="Escribe en inglés… (Ctrl+Enter para corregir)"
          />
          {!grade ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-white shadow transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                disabled={loading || !answer.trim()}
                onClick={submit}
              >
                {loading ? "Corrigiendo…" : "✓ Corregir"}
              </button>
              <button
                className="rounded-full border border-zinc-300 px-5 py-2.5 font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                disabled={loading}
                onClick={loadNext}
              >
                Saltar →
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">Pulsa “Siguiente” para continuar ↓</p>
          )}
        </section>
      )}

      {grade && (
        <section
          aria-live="polite"
          className={`rounded-3xl border-2 p-6 shadow-sm ${
            grade.correct
              ? "border-green-500 bg-green-50 dark:bg-green-950"
              : "border-amber-500 bg-amber-50 dark:bg-amber-950"
          }`}
        >
          <p className="text-xl font-extrabold">
            {grade.correct ? "🎉 ¡Correcto!" : "💪 Casi — a repasar"}
          </p>
          {!grade.correct && (
            <div className="mt-3 rounded-2xl bg-white/70 p-3 dark:bg-black/30">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Tu respuesta: “{answer.trim()}”</p>
              {grade.expected && (
                <p className="mt-1 text-base">
                  Esperado: <b className="text-emerald-700 dark:text-emerald-300">{grade.expected}</b>
                </p>
              )}
              {grade.corrections.map((c, i) => (
                <p key={i} className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {c.type === "detalle" ? "💡" : "✏️"} {c.hint}
                </p>
              ))}
            </div>
          )}
          {grade.correct && streak >= 3 && (
            <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              ⬆️ ¡{streak} seguidas! El profe subirá la dificultad.
            </p>
          )}
          {grade.leveledUp && (
            <p className="mt-2 rounded-2xl bg-emerald-600 p-3 text-center text-sm font-extrabold text-white">
              🎓 ¡Nivel nuevo: {grade.leveledUp}! Los próximos ejercicios serán de ese nivel.
            </p>
          )}
          {grade.tip && (
            <p className="mt-2 rounded-2xl bg-sky-100 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-200">
              📖 Para sonar nativo: {grade.tip}
            </p>
          )}
          <button
            className="mt-4 w-full rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            onClick={loadNext}
            autoFocus
          >
            Siguiente ejercicio →
          </button>
        </section>
      )}
    </main>
  );
}
