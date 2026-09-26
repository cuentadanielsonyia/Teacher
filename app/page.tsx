import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Profesor de Inglés (B1-B2)</h1>
      <p className="text-zinc-600">MVP texto: lección → corrección → registro → siguiente ajustada.</p>
      <div className="flex gap-4">
        <Link className="rounded bg-black px-5 py-3 text-white" href="/lesson">
          Empezar lección
        </Link>
        <Link className="rounded border px-5 py-3" href="/progress">
          Ver progreso
        </Link>
      </div>
    </main>
  );
}
