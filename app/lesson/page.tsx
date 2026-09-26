"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Lesson {
  id: string;
  skill: string;
  category: string;
  level: string;
  prompt: string;
}

interface Grade {
  correct: boolean;
  expected: string;
  corrections: { type: string; expected: string; got: string; hint: string }[];
  skill: string;
  category: string;
}

export default function LessonPage() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIds = useRef<string[]>([]);
  const startRef = useRef<number>(Date.now());

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGrade(null);
    setAnswer("");
    try {
      const q = seenIds.current.length ? `?exclude=${seenIds.current.join(",")}` : "";
      const r = await fetch(`/api/lesson/next${q}`);
      if (!r.ok) throw new Error(`next ${r.status}`);
      const data = (await r.json()) as Lesson;
      setLesson(data);
      seenIds.current.push(data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNext();
    startRef.current = Date.now();
    const onUnload = () => {
      const sec = Math.round((Date.now() - startRef.current) / 1000);
      if (sec > 0) {
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
    if (!lesson || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/lesson/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lesson.id, answer }),
      });
      if (!r.ok) throw new Error(`grade ${r.status}`);
      setGrade((await r.json()) as Grade);
    } catch (e) {
      setError(e instanceof Error ? e.message : "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <a className="text-sm underline" href="/">← Inicio</a>
      <h1 className="text-2xl font-bold">Lección</h1>
      {error && <p className="rounded bg-red-100 p-3 text-red-800">{error}</p>}
      {!lesson && loading && <p>Cargando…</p>}
      {lesson && (
        <div className="rounded border p-4">
          <p className="text-xs text-zinc-500">{lesson.skill} · {lesson.category} · {lesson.level}</p>
          <p className="mt-2 text-lg">{lesson.prompt}</p>
          <textarea
            className="mt-3 w-full rounded border p-2"
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escribe tu respuesta en inglés…"
          />
          <div className="mt-3 flex gap-2">
            <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={loading || !answer.trim()} onClick={submit}>
              Corregir
            </button>
            <button className="rounded border px-4 py-2" disabled={loading} onClick={loadNext}>
              Siguiente
            </button>
          </div>
        </div>
      )}
      {grade && (
        <div className={`rounded border p-4 ${grade.correct ? "border-green-500" : "border-red-500"}`}>
          <p className="font-bold">{grade.correct ? "✓ Correcto" : "✗ A repasar"}</p>
          {!grade.correct && <p className="mt-1">Esperado: <b>{grade.expected}</b></p>}
          {grade.corrections.map((c, i) => (
            <p key={i} className="mt-1 text-sm text-zinc-700">{c.hint}</p>
          ))}
          <button className="mt-3 rounded bg-black px-4 py-2 text-white" onClick={loadNext}>Siguiente ajustada →</button>
        </div>
      )}
      <a className="text-sm underline" href="/progress">Ver progreso →</a>
    </main>
  );
}
