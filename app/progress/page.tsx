"use client";
import { useEffect, useState } from "react";

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

export default function ProgressPage() {
  const [data, setData] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => {
        if (!r.ok) throw new Error(`progress ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "error"));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <a className="text-sm underline" href="/">← Inicio</a>
      <h1 className="text-2xl font-bold">Progreso</h1>
      {error && <p className="rounded bg-red-100 p-3 text-red-800">{error}</p>}
      {!data && !error && <p>Cargando…</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border p-3"><p className="text-xs">Nivel</p><p className="text-xl font-bold">{data.level}</p></div>
            <div className="rounded border p-3"><p className="text-xs">Racha (días)</p><p className="text-xl font-bold">{data.streak}</p></div>
            <div className="rounded border p-3"><p className="text-xs">Precisión</p><p className="text-xl font-bold">{Math.round(data.accuracy * 100)}% ({data.correct}/{data.total})</p></div>
            <div className="rounded border p-3"><p className="text-xs">Tiempo / sesiones</p><p className="text-xl font-bold">{Math.round(data.timeSec / 60)} min · {data.sessions}</p></div>
            <div className="rounded border p-3"><p className="text-xs">Vocab visto/dominado</p><p className="text-xl font-bold">{data.vocabSeen} / {data.vocabMastered}</p></div>
          </div>
          <h2 className="mt-2 font-bold">Errores frecuentes</h2>
          {data.errorsTop.length === 0 && <p className="text-sm">Sin intentos aún. <a className="underline" href="/lesson">Haz una lección →</a></p>}
          <ul className="flex flex-col gap-2">
            {data.errorsTop.map((e) => (
              <li key={e.category} className="rounded border p-2 text-sm">
                <b>{e.category}</b> — {e.errors}/{e.attempts} errores ({Math.round(e.rate * 100)}%)
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
