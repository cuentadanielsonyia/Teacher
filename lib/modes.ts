export const MODES = ["speaking", "listening", "writing", "reading"] as const;
export type Mode = (typeof MODES)[number];

export const MODE_META: Record<Mode, { label: string; icon: string; desc: string }> = {
  speaking: { label: "Speaking", icon: "🎙", desc: "Conversa en voz alta y lee con puntuación de pronunciación." },
  listening: { label: "Listening", icon: "🎧", desc: "Escucha audios y responde. Con transcripción tras contestar." },
  writing: { label: "Writing", icon: "✍️", desc: "Escribe emails, ensayos y paráfrasis con corrección y tips." },
  reading: { label: "Reading", icon: "📖", desc: "Lee textos y gramática con preguntas de comprensión." },
};

interface ModeLike {
  skill: string;
  mode?: string;
}

/** Formato de práctica de un ejercicio: explícito si lo trae, si no por skill. */
export function modeOf(e: ModeLike): Mode {
  if (e.mode === "speaking" || e.mode === "listening" || e.mode === "writing" || e.mode === "reading") {
    return e.mode;
  }
  if (e.skill === "conversacion" || e.skill === "pronunciacion") return "speaking";
  if (e.skill === "writing") return "writing";
  if (e.skill === "listening") return "listening";
  if (e.skill === "reading") return "reading";
  return "reading"; // gramatica, vocabulario: leer + escribir
}

export function isMode(s: string | null): s is Mode {
  return s === "speaking" || s === "listening" || s === "writing" || s === "reading";
}
