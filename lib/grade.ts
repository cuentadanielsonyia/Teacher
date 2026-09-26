export const OPEN_SKILLS = new Set(["conversacion", "writing"]);

export function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:"'¡¿]/g, "").replace(/\s+/g, " ");
}

export interface GradeResult {
  correct: boolean;
  note: string | null;
}

/** Reglas MVP: igualdad normalizada (o alternativa aceptada); abiertas aceptadas si elaboradas. */
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
