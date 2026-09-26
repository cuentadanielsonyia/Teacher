import Link from "next/link";

const STEPS = [
  { n: "1", t: "Recibe un ejercicio", d: "Elegido según tus errores y tu nivel B1–B2." },
  { n: "2", t: "Responde en inglés", d: "Conversación, gramática, vocabulario, writing o pronunciación." },
  { n: "3", t: "Corrección al instante", d: "Con la respuesta esperada y pista de repaso." },
  { n: "4", t: "El profe adapta", d: "Repite tus fallos y sube de nivel tras 3 aciertos seguidos." },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 p-6 sm:p-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
        <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
          NIVEL B1–B2 · SINGLE-USER
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
          Tu profesor de inglés adaptativo
        </h1>
        <p className="mt-2 max-w-md text-white/85">
          Sesiones cortas de texto. Cada respuesta enseña al profe qué ponerte después.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/lesson"
            className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow transition hover:scale-[1.03] active:scale-95"
          >
            ▶ Empezar lección
          </Link>
          <Link
            href="/progress"
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Ver progreso
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
              {s.n}
            </p>
            <p className="mt-2 font-semibold">{s.t}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        💡 <b>Consejo:</b> responde cada día para mantener la racha. El audio (listening/speaking) llegará en la fase 2.
      </section>
    </main>
  );
}
