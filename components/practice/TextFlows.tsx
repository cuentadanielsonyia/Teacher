"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorBox, TipBox, fetchNext, sendGrade, type GradeResp, type LessonEx } from "./shared";

function Flow({ mode, title, hint, showPassage }: { mode: string; title: string; hint: string; showPassage?: boolean }) {
  const [ex, setEx] = useState<LessonEx | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<GradeResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const seen = useRef<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGrade(null);
    setAnswer("");
    try {
      const n = await fetchNext({ mode }, seen.current);
      seen.current.push(n.id);
      setEx(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!ex || !answer.trim()) return;
    setLoading(true);
    try {
      setGrade(await sendGrade(ex.id, answer));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-3">
      {error && <ErrorBox message={error} onRetry={load} />}
      {!ex && loading && <p className="animate-pulse">Cargando…</p>}
      {ex && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-zinc-500">{title} · {ex.skill} · {ex.category} · {ex.level}</p>
          {showPassage && ex.passage && (
            <blockquote className="mt-3 rounded-2xl bg-zinc-50 p-4 leading-relaxed italic dark:bg-zinc-800">
              {ex.passage}
            </blockquote>
          )}
          <p className="mt-3 text-lg font-medium">{ex.prompt}</p>
          {!grade ? (
            <>
              <textarea
                className="mt-3 w-full rounded-2xl border border-zinc-300 p-3 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                rows={mode === "writing" ? 4 : 2}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit();
                }}
                placeholder={hint}
              />
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-zinc-500">{words > 0 ? `${words} palabras · Ctrl+Enter para corregir` : hint}</p>
                <button
                  onClick={submit}
                  disabled={loading || !answer.trim()}
                  className="rounded-full bg-emerald-600 px-6 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {loading ? "…" : "✓ Corregir"}
                </button>
              </div>
            </>
          ) : (
            <div className={`mt-3 rounded-2xl p-4 ${grade.correct ? "bg-green-50 dark:bg-green-950" : "bg-amber-50 dark:bg-amber-950"}`}>
              <p className="font-bold">{grade.correct ? "🎉 ¡Correcto!" : "💪 A repasar"}</p>
              {!grade.correct && <p className="mt-1">Esperado: <b>{grade.expected}</b></p>}
              {grade.leveledUp && <p className="mt-1 text-sm font-bold text-emerald-700">🎓 ¡Nivel nuevo: {grade.leveledUp}!</p>}
              <TipBox tip={grade.tip} />
              <button onClick={load} className="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2.5 font-semibold text-white dark:bg-white dark:text-zinc-900">
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WritingFlow() {
  return <Flow mode="writing" title="✍️ Writing" hint="Escribe en inglés…" />;
}

export function ReadingFlow() {
  return <Flow mode="reading" title="📖 Reading" hint="Tu respuesta…" showPassage />;
}
