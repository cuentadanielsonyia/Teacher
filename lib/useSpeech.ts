"use client";

interface SpeechRecognitionResultItem {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: { [index: number]: SpeechRecognitionResultItem } | undefined;
  length: number;
}
interface SpeechRecognitionEvent {
  results?: SpeechRecognitionResultList;
}
interface SpeechRecognitionError {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function sttSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    (("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window))
  );
}

function pickVoice(lang = "en"): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ??
    (lang === "en" ? (voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null) : null)
  );
}

async function voicesReady(): Promise<void> {
  if (window.speechSynthesis.getVoices().length > 0) return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 2000);
    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timer);
      resolve();
    };
  });
}

/** Lee un texto en voz alta. `lang`: "en" (defecto) o "es" para consejos en español. */
export async function speak(text: string, opts?: { rate?: number; lang?: string }): Promise<void> {
  if (!ttsSupported()) throw new Error("tts-unsupported");
  const rate = opts?.rate ?? 0.95;
  const lang = opts?.lang ?? "en";
  window.speechSynthesis.cancel();
  await voicesReady();
  await new Promise<void>((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(lang);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = lang === "es" ? "es-ES" : "en-US";
    }
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = (e) => reject(new Error(`tts-error:${e.error}`));
    // Seguridad: Chrome a veces no dispara onend en pausa larga
    setTimeout(resolve, Math.max(5000, text.length * 120));
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export type ListenError = "stt-unsupported" | "not-allowed" | "no-speech" | "aborted" | "network" | "unknown";

/** Escucha el micro y devuelve la transcripción en inglés. */
export async function listen(lang = "en-US", timeoutMs = 20000): Promise<string> {
  if (!sttSupported()) throw new Error("stt-unsupported");
  const Ctor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
  if (!Ctor) throw new Error("stt-unsupported");
  return new Promise<string>((resolve, reject) => {
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let done = false;
    const finish = (fn: () => void) => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        try {
          rec.abort();
        } catch {
          /* noop */
        }
        fn();
      }
    };
    const timer = setTimeout(() => finish(() => reject(new Error("no-speech"))), timeoutMs);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      finish(() => (text.trim() ? resolve(text.trim()) : reject(new Error("no-speech"))));
    };
    rec.onerror = (e: SpeechRecognitionError) => {
      const code = e.error;
      const mapped: ListenError =
        code === "not-allowed" || code === "service-not-allowed"
          ? "not-allowed"
          : code === "no-speech" || code === "audio-capture"
            ? "no-speech"
            : code === "aborted"
              ? "aborted"
              : code === "network"
                ? "network"
                : "unknown";
      finish(() => reject(new Error(mapped)));
    };
    rec.onend = () => finish(() => reject(new Error("no-speech")));
    try {
      rec.start();
    } catch {
      finish(() => reject(new Error("unknown")));
    }
  });
}

export const LISTEN_HELP: Record<string, string> = {
  "not-allowed": "Micro bloqueado: pulsa el candado 🔒 de la barra de direcciones → permite el micrófono → reintenta.",
  "no-speech": "No te escuché: acércate al micro, habla alto y pulsa de nuevo.",
  network: "Falló la red de reconocimiento: revisa tu conexión e inténtalo otra vez.",
  "stt-unsupported": "Tu navegador no soporta dictado: usa Edge/Chrome o escribe abajo.",
  aborted: "Escucha cancelada: pulsa el micro e inténtalo de nuevo.",
  unknown: "Algo falló con el micro: reintenta o escribe tu respuesta.",
};
