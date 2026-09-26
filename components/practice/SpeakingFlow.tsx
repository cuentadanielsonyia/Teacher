"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { scoreReading } from "@/lib/grade";
import {
  LISTEN_HELP,
  listen,
  speak,
  stopSpeaking,
  sttSupported,
  ttsSupported,
} from "@/lib/useSpeech";
import { ErrorBox, TipBox, fetchNext, sendGrade, type LessonEx } from "./shared";

type Sub = "conversacion" | "lectura";
type Mic = "idle" | "listening" | "sending";

interface Turn {
  from: "profe" | "tu";
  text: string;
  lang?: "en" | "es";
}

const PRAISE = ["¡Genial!", "¡Muy bien!", "¡Perfecto!", "¡Buen trabajo!"];

export default function SpeakingFlow() {
  const [sub, setSub] = useState<Sub>("conversacion");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 text-sm">
        {(["conversacion", "lectura"] as Sub[]).map((s) => (
          <button
            key={s}
            onClick={() => setSub(s)}
            className={`rounded-full px-4 py-1.5 font-semibold transition ${
              sub === s
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {s === "conversacion" ? "💬 Conversación" : "📣 Leer en voz alta"}
          </button>
        ))}
      </div>
      {sub === "conversacion" ? <Conversation /> : <ReadAloud />}
    </div>
  );
}

function useVoice() {
  const [voiceOn, setVoiceOn] = useState(true);
  const supported = ttsSupported();
  const say = useCallback(
    async (text: string, lang: "en" | "es" = "en") => {
      if (!voiceOn || !supported) return;
      try {
        await speak(text, { lang });
      } catch {
        /* el usuario puede pulsar ▶ manualmente */
      }
    },
    [voiceOn, supported]
  );
  return { voiceOn, setVoiceOn, say, supported };
}

function Conversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [current, setCurrent] = useState<LessonEx | null>(null);
  const [transcript, setTranscript] = useState("");
  const [mic, setMic] = useState<Mic>("idle");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [spokenWords, setSpokenWords] = useState(0);
  const seen = useRef<string[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const { voiceOn, setVoiceOn, say } = useVoice();
  const stt = sttSupported();

  const loadPrompt = useCallback(async () => {
    const n = await fetchNext({ mode: "speaking", skill: "conversacion" }, seen.current);
    seen.current.push(n.id);
    setCurrent(n);
    setTranscript("");
    return n;
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function start() {
    setError(null);
    try {
      const n = await loadPrompt();
      setStarted(true);
      const hello = n.prompt;
      setTurns([{ from: "profe", text: hello, lang: "en" }]);
      await say(hello);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    }
  }

  async function record() {
    setError(null);
    setMic("listening");
    try {
      const text = await listen("en-US");
      setTranscript(text);
    } catch (e) {
      const code = e instanceof Error ? e.message : "unknown";
      setError(LISTEN_HELP[code] ?? LISTEN_HELP.unknown);
    } finally {
      setMic("idle");
    }
  }

  async function send() {
    if (!current || !transcript.trim() || mic !== "idle") return;
    setMic("sending");
    setError(null);
    try {
      const g = await sendGrade(current.id, transcript.trim());
      setSpokenWords((w) => w + transcript.trim().split(/\s+/).length);
      stopSpeaking();
      // Feedback visible Y audible, burbuja a burbuja (cada una reescuchable)
      const feedback: Turn[] = [];
      const sayQueue: { text: string; lang: "en" | "es" }[] = [];
      if (g.correct) {
        const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
        feedback.push({ from: "profe", text: `✅ ${praise}`, lang: "en" });
        sayQueue.push({ text: praise, lang: "en" });
      } else {
        feedback.push({ from: "profe", text: "❌ Casi, mira:", lang: "es" });
        sayQueue.push({ text: "Casi. Mira la corrección.", lang: "es" });
      }
      for (const c of g.corrections) {
        if (c.type === "detalle") {
          feedback.push({ from: "profe", text: `💡 ${c.hint}`, lang: "es" });
        } else {
          feedback.push({ from: "profe", text: `✏️ ${c.hint}`, lang: "es" });
        }
        sayQueue.push({ text: c.hint, lang: "es" });
      }
      if (!g.correct && g.expected) {
        feedback.push({ from: "profe", text: `💬 Ejemplo: “${g.expected}”`, lang: "en" });
        sayQueue.push({ text: g.expected, lang: "en" });
      }
      if (g.tip) {
        feedback.push({ from: "profe", text: `📖 ${g.tip}`, lang: "es" });
        sayQueue.push({ text: `Consejo: ${g.tip}`, lang: "es" });
      }
      setTurns((t) => [...t, { from: "tu", text: transcript.trim() }, ...feedback]);
      if (g.leveledUp) {
        setTurns((t) => [...t, { from: "profe", text: `🎓 ¡Nivel nuevo: ${g.leveledUp}!`, lang: "es" }]);
        sayQueue.push({ text: `¡Nivel nuevo: ${g.leveledUp}!`, lang: "es" });
      }
      if (voiceOn) {
        for (const s of sayQueue) {
          try {
            await speak(s.text, { lang: s.lang });
          } catch {
            break; // el resto queda visible con 🔊
          }
        }
      }
      const n = await loadPrompt();
      setTurns((t) => [...t, { from: "profe", text: n.prompt, lang: "en" }]);
      await say(n.prompt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setMic("idle");
    }
  }

  if (!started) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-4xl">🎙</p>
        <h2 className="mt-2 text-xl font-extrabold">Conversación guiada</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          El profe te habla en inglés, tú respondes con el micro (o escribiendo).
          {!stt && " Tu navegador no tiene dictado: escribirás tus respuestas."}
        </p>
        <button
          onClick={start}
          className="mt-4 rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-emerald-700 active:scale-95"
        >
          ▶ Escuchar y empezar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <p className="text-zinc-500">🗣 {spokenWords} palabras habladas</p>
        <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} />
          Voz del profe
        </label>
      </div>

      <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900" aria-live="polite">
        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.from === "profe" ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-[15px] ${
                t.from === "profe"
                  ? "bg-zinc-100 dark:bg-zinc-800"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {t.text}
              {t.from === "profe" && (
                <button
                  aria-label="Repetir en voz alta"
                  className="ml-2 text-sm opacity-70 hover:opacity-100"
                  onClick={() => say(t.text.replace(/^[✅❌✏️💡💬📖🎓🔊\s]+/u, ""), t.lang ?? "en")}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      {error && <ErrorBox message={error} onRetry={() => setError(null)} />}

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          {stt ? (
            <button
              onClick={record}
              disabled={mic !== "idle"}
              aria-label="Grabar respuesta"
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl text-white shadow transition active:scale-95 disabled:opacity-50 ${
                mic === "listening" ? "animate-pulse bg-red-500" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {mic === "listening" ? "⏺" : "🎤"}
            </button>
          ) : null}
          <textarea
            className="w-full rounded-2xl border border-zinc-300 p-2 text-[15px] outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
            rows={2}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") send();
            }}
            placeholder={stt ? "Tu respuesta aparecerá aquí (puedes editarla)…" : "Escribe tu respuesta en inglés…"}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {mic === "listening"
            ? "Escuchando… habla ahora."
            : stt
              ? "Pulsa 🎤 y habla, o escribe y pulsa Enviar (Ctrl+Enter)."
              : "Escribe y pulsa Enviar (Ctrl+Enter)."}
        </p>
        <button
          onClick={send}
          disabled={mic !== "idle" || !transcript.trim()}
          className="mt-2 w-full rounded-full bg-zinc-900 px-6 py-2.5 font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {mic === "sending" ? "Enviando…" : "Enviar ➤"}
        </button>
      </div>
    </div>
  );
}

function ReadAloud() {
  const [ex, setEx] = useState<LessonEx | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<{ score: number; missing: string[]; tip: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const seen = useRef<string[]>([]);
  const stt = sttSupported();

  const load = useCallback(async () => {
    setError(null);
    setResult(null);
    try {
      const n = await fetchNext({ mode: "speaking", category: "read-aloud" }, seen.current);
      seen.current.push(n.id);
      setEx(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function record() {
    if (!ex) return;
    setError(null);
    setRecording(true);
    try {
      const text = await listen("en-US", 15000);
      const g = await sendGrade(ex.id, text);
      const s = scoreReading(g.expected, text);
      setResult({ score: s.score, missing: s.missing, tip: g.tip });
    } catch (e) {
      const code = e instanceof Error ? e.message : "unknown";
      setError(LISTEN_HELP[code] ?? LISTEN_HELP.unknown);
    } finally {
      setRecording(false);
    }
  }

  if (!stt) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm dark:border-amber-800 dark:bg-amber-950">
        La lectura en voz alta necesita dictado por voz (Edge/Chrome). Mientras tanto practica en{" "}
        <b>Conversación</b> escribiendo, o cambia de navegador.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <ErrorBox message={error} onRetry={load} />}
      {!ex && !error && <p className="animate-pulse">Cargando frase…</p>}
      {ex && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-zinc-500">{ex.category} · {ex.level}</p>
          <p className="mt-2 text-2xl leading-relaxed font-medium">“{ex.prompt.replace(/^Lee en voz alta:\s*/i, "")}”</p>
          <button
            onClick={record}
            disabled={recording}
            className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white shadow transition active:scale-95 disabled:opacity-60 ${
              recording ? "animate-pulse bg-red-500" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            aria-label="Leer en voz alta"
          >
            {recording ? "⏺" : "🎤"}
          </button>
          <p className="mt-2 text-sm text-zinc-500">{recording ? "Leyendo… termina la frase." : "Pulsa y lee la frase completa."}</p>
        </div>
      )}
      {result && (
        <div className="rounded-3xl border-2 p-5 text-center shadow-sm" aria-live="polite">
          <p className={`text-4xl font-extrabold ${result.score >= 90 ? "text-green-600" : result.score >= 70 ? "text-amber-600" : "text-red-500"}`}>
            {result.score}%
          </p>
          <p className="mt-1 font-semibold">
            {result.score >= 90 ? "🎉 ¡Suenas casi nativo!" : result.score >= 70 ? "💪 Bien — pule los detalles" : "🔁 Inténtalo otra vez, despacio"}
          </p>
          {result.missing.length > 0 && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Se me escapó: {result.missing.slice(0, 6).map((w) => (
                <span key={w} className="mr-1 rounded-full bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-900 dark:text-red-200">{w}</span>
              ))}
            </p>
          )}
          {result.tip && <TipBox tip={result.tip} />}
          <div className="mt-3 flex gap-2">
            <button onClick={record} className="flex-1 rounded-full border border-zinc-300 px-4 py-2 font-semibold dark:border-zinc-700">
              ↻ Repetir
            </button>
            <button onClick={load} className="flex-1 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white dark:bg-white dark:text-zinc-900">
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
