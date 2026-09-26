"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MODE_META, MODES, isMode } from "@/lib/modes";
import { ModeTabs } from "@/components/practice/shared";
import SpeakingFlow from "@/components/practice/SpeakingFlow";
import ListeningFlow from "@/components/practice/ListeningFlow";
import { ReadingFlow, WritingFlow } from "@/components/practice/TextFlows";

function Inner() {
  const param = useSearchParams().get("mode");
  const mode = isMode(param) ? param : "speaking";
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-4 p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-extrabold">
          {MODE_META[mode].icon} {MODE_META[mode].label}
        </h1>
        <p className="text-sm text-zinc-500">{MODE_META[mode].desc}</p>
      </div>
      <ModeTabs active={mode} />
      {mode === "speaking" && <SpeakingFlow />}
      {mode === "listening" && <ListeningFlow />}
      {mode === "writing" && <WritingFlow />}
      {mode === "reading" && <ReadingFlow />}
      <a className="text-sm text-emerald-700 underline dark:text-emerald-300" href="/progress">
        Ver mi progreso →
      </a>
    </main>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-2xl p-8"><p className="animate-pulse">Cargando…</p></main>}>
      <Inner />
    </Suspense>
  );
}
