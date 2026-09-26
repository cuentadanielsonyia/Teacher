"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { speak, stopSpeaking, ttsSupported } from "@/lib/useSpeech";
import { ErrorBox, TipBox, fetchNext, sendGrade, type GradeResp, type LessonEx } from "./shared";

export default function ListeningFlow() {
  const [ex, setEx] = useState<LessonEx | null>(null);
  const [answer, setAnswer] = useState("");
  const [grade, setGrade] = useState<GradeResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(1);
  const [showScript, setShowScript] = useState(false);
  const seen = useRef<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGrade(null);
    setAnswer("");
    setPlays(0);
    setShowScript(false);
    stopSpeaking();
    try {
      const n = await fetchNext({ mode: "listening" }, seen.current);
      seen.current.push(n.id);
      setEx(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => stopSpeaking();
  }, [load]);

  async function play() {
    if (!ex?.speak) return;
    if (!ttsSupported()) {
      setError("Tu navegador no tiene voz: usa Edge/Chrome para el listening.");
      return;
    }
    setPlaying(true);
    try {
      await speak(ex.speak, rate);
      setPlays((p) => p + 1);
    } catch {
      setError("No pude reproducir el audio: reintenta.");
    } finally {
      setPlaying(false);
    }
  }

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

  return (
    <div className="flex flex-col gap-3">
      {error && <ErrorBox message={error} onRetry={() => setError(null)} />}
      {!ex && loading && <p className="animate-pulse">Cargando audio…</p>}
      {ex && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-zinc-500">{ex.category} · {ex.level} · ▶ {plays}</p>
          <button
            onClick={play}
            disabled={playing}
            aria-label="Reproducir audio"
            className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-4xl text-white shadow transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
          >
            {playing ? "🔊" : "▶"}
          </button>
          <div className="mt-3 flex items-center justify-center gap-3 text-sm">
            <span className="text-zinc-500">Velocidad:</span>
            {([1, 0.75] as number[]).map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`rounded-full px-3 py-1 font-semibold ${rate === r ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
              >
                {r}x
              </button>
            ))}
          </div>
          <p className="mt-4 text-left text-lg font-medium">{ex.prompt}</p>
          {!grade ? (
            <div className="mt-3 flex gap-2">
              <input
                className="w-full rounded-2xl border border-zinc-300 p-2.5 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Lo que entendiste…"
                aria-label="Tu respuesta"
              />
              <button
                onClick={submit}
                disabled={loading || !answer.trim()}
                className="shrink-0 rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
              >
                ✓
              </button>
            </div>
          ) : (
            <div className={`mt-3 rounded-2xl p-4 text-left ${grade.correct ? "bg-green-50 dark:bg-green-950" : "bg-amber-50 dark:bg-amber-950"}`}>
              <p className="font-bold">{grade.correct ? "🎉 ¡Bien oído!" : `✗ Era: ${grade.expected}`}</p>
              <TipBox tip={grade.tip} />
              <button onClick={() => setShowScript((s) => !s)} className="mt-2 text-sm font-medium text-emerald-700 underline dark:text-emerald-300">
                {showScript ? "Ocultar transcripción" : "📜 Ver transcripción"}
              </button>
              {showScript && <p className="mt-1 text-sm italic">“{ex.speak}”</p>}
              <button onClick={load} className="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2.5 font-semibold text-white dark:bg-white dark:text-zinc-900">
                Siguiente audio →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
