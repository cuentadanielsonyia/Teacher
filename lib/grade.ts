export const OPEN_SKILLS = new Set(["conversacion", "writing"]);

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:"'¡¿]/g, "").replace(/\s+/g, " ");
}

export interface GradeResult {
  correct: boolean;
  note: string | null;
}

export interface ReadScore {
  score: number; // 0..100
  matched: number;
  total: number;
  missing: string[];
}

/** Puntuación de lectura en voz alta: % de palabras de referencia presentes (multiconjunto). */
export function scoreReading(referenceRaw: string, transcriptRaw: string): ReadScore {
  const ref = normalize(referenceRaw).split(" ").filter(Boolean);
  const got = normalize(transcriptRaw).split(" ").filter(Boolean);
  const counts = new Map<string, number>();
  for (const w of got) counts.set(w, (counts.get(w) ?? 0) + 1);
  const missing: string[] = [];
  let matched = 0;
  for (const w of ref) {
    const n = counts.get(w) ?? 0;
    if (n > 0) {
      matched += 1;
      counts.set(w, n - 1);
    } else {
      missing.push(w);
    }
  }
  const total = ref.length;
  return { score: total === 0 ? 0 : Math.round((matched / total) * 100), matched, total, missing };
}

/** Reglas de corrección: igualdad normalizada (o alternativa aceptada); abiertas aceptadas si elaboradas. */
export function gradeAnswer(skill: string, expectedRaw: string, givenRaw: string, acceptRaw: string[] = []): GradeResult {
  const expected = normalize(expectedRaw);
  const given = normalize(givenRaw);
  if (!given) return { correct: false, note: null };
  if (given === expected) return { correct: true, note: null };
  if (acceptRaw.some((a) => normalize(a) === given)) return { correct: true, note: null };
  if (OPEN_SKILLS.has(skill) && given.length >= 12) {
    return { correct: true, note: "Respuesta abierta aceptada (revisión ligera en MVP)." };
  }
  return { correct: false, note: null };
}
