"use client";
import { useCallback, useEffect, useState } from "react";

interface Progress {
  total: number;
  correct: number;
  accuracy: number;
  errorsTop: { category: string; attempts: number; errors: number; rate: number }[];
  vocabSeen: number;
  vocabMastered: number;
  timeSec: number;
  sessions: number;
  streak: number;
  level: string;
}

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function Ring({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`Precisión ${pct}%`}>
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="8" className="stroke-zinc-200 dark:stroke-zinc-700" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        className="stroke-emerald-500"
        transform="rotate(-90 36 36)"
      />
      <text x="36" y="41" textAnchor="middle" className="fill-zinc-900 text-base font-bold dark:fill-white">
        {pct}%
      </text>
    </svg>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/progress")
      .then((r) => {
        if (!r.ok) throw new Error(`No pude cargar el progreso (HTTP ${r.status}).`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Error de red"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxErr = Math.max(1, ...(data?.errorsTop.map((e) => e.errors) ?? [1]));

  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Tu progreso</h1>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {loading ? "…" : "↻ Actualizar"}
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p>{error}</p>
          <button className="mt-2 rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white" onClick={load}>
            Reintentar
          </button>
        </div>
      )}

      {loading && !data && (
        <div className="grid animate-pulse grid-cols-2 gap-3" aria-label="Cargando progreso">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      )}

      {data && (
        <>
          <section className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow">
            <Ring pct={Math.round(data.accuracy * 100)} />
            <div>
              <p className="text-sm text-white/80">Nivel estimado · {data.level}</p>
              <p className="text-xl font-extrabold">
                {data.correct}/{data.total} aciertos
                {data.streak > 0 && <span className="ml-2 text-base">🔥 {data.streak} día{data.streak === 1 ? "" : "s"}</span>}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">⏱ Tiempo total</p>
              <p className="text-lg font-bold">{fmtTime(data.timeSec)}</p>
              <p className="text-xs text-zinc-500">{data.sessions} sesion{data.sessions === 1 ? "" : "es"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">📚 Vocabulario</p>
              <p className="text-lg font-bold">{data.vocabMastered}/{data.vocabSeen} dominadas</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${data.vocabSeen ? Math.round((data.vocabMastered / data.vocabSeen) * 100) : 0}%` }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-bold">🎯 A repasar (errores frecuentes)</h2>
            {data.errorsTop.length === 0 ? (
              <div className="mt-3 rounded-2xl bg-zinc-50 p-4 text-center text-sm dark:bg-zinc-800">
                <p>Sin intentos aún. El profe necesita verte fallar para adaptarse 😉</p>
                <a href="/lesson" className="mt-2 inline-block rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white">
                  Hacer primera lección →
                </a>
              </div>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {data.errorsTop.map((e) => (
                  <li key={e.category}>
                    <div className="flex justify-between text-sm">
                      <b>{e.category}</b>
                      <span className="text-zinc-500">{e.errors}/{e.attempts} · {Math.round(e.rate * 100)}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className={`h-full rounded-full ${e.rate >= 0.5 ? "bg-red-500" : "bg-amber-400"}`}
                        style={{ width: `${Math.round((e.errors / maxErr) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <a
            href="/lesson"
            className="rounded-full bg-zinc-900 px-6 py-3 text-center font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900"
          >
            Seguir practicando →
          </a>
        </>
      )}
    </main>
  );
}
