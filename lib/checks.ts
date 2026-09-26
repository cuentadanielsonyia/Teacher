import { normalize } from "./grade";

export interface Issue {
  kind: "error" | "detalle";
  hint: string;
}

/** have/has + forma base (no participio). Clave = base, valor = participio. */
const PARTICIPLES: Record<string, string> = {
  go: "gone", do: "done", eat: "eaten", see: "seen", take: "taken", make: "made",
  come: "come", be: "been", have: "had", give: "given", know: "known", speak: "spoken",
  break: "broken", choose: "chosen", drive: "driven", forget: "forgotten", write: "written",
  drink: "drunk", swim: "swum", sing: "sung", begin: "begun", run: "run", say: "said",
  pay: "paid", buy: "bought", think: "thought", teach: "taught", catch: "caught",
  bring: "brought", feel: "felt", sleep: "slept", keep: "kept", leave: "left",
  lose: "lost", meet: "met", send: "sent", spend: "spent", build: "built",
  bite: "bitten", hide: "hidden", ride: "ridden", shake: "shaken", steal: "stolen",
  wear: "worn", freeze: "frozen", fly: "flown", grow: "grown", throw: "thrown",
};

const A_EXCEPTIONS = new Set([
  "university", "uniform", "union", "unique", "useful", "usual", "user", "one",
  "once", "european", "eucalyptus", "unit", "united", "unicorn",
]);
const AN_WORDS = new Set(["hour", "hours", "honest", "honestly", "honour", "honor", "heir", "heiress"]);

/** Revisa una respuesta abierta. Solo falla por errores gramaticales reales
 *  (insensible a mayúsculas/puntuación: el dictado por voz no las pone). */
export function checkOpenAnswer(givenRaw: string): Issue[] {
  const issues: Issue[] = [];
  const text = normalize(givenRaw);
  if (!text) return issues;
  const words = text.split(" ").filter(Boolean);
  const push = (kind: Issue["kind"], hint: string) => {
    if (!issues.some((i) => i.hint === hint)) issues.push({ kind, hint });
  };

  if (words.length < 4) {
    push("error", "Respuesta demasiado corta: desarrolla con 1-2 frases completas.");
  }

  // have/has + base → participio (cuidado con "have to + base", que es correcto).
  // Ojo: normalize() ya quitó apóstrofes ("haven't" → "havent").
  const haveRe = /\b(have|has|havent|hasnt|ve|ive)\b(?!\s+to\b)\s+(not\s+)?([a-z]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = haveRe.exec(text)) !== null) {
    const base = m[3];
    if (base === "got" || base === "get") {
      if (/\b(have|has|ve)\s+(not\s+)?got\b/.test(m[0])) continue; // "have got" es correcto
      push("error", `Con "have" usa participio: "have ${base === "get" ? "got" : PARTICIPLES[base] ?? base}".`);
      continue;
    }
    const part = PARTICIPLES[base];
    if (part && part !== base) {
      push("error", `Tras "have/has" va participio: no "${m[0].trim()}", sino "have ${part}".`);
    }
  }

  // he/she/it + don't → doesn't
  if (/\b(he|she|it)\s+dont\b/.test(text)) {
    push("error", `Tercera persona: no "he don't", sino "he doesn't".`);
  }

  // concordancia básica be
  if (/\b(they|we|you)\s+is\b/.test(text)) {
    push("error", `"They/we/you" va con "are", no con "is".`);
  }
  if (/\b(he|she|it)\s+are\b/.test(text)) {
    push("error", `"He/she/it" va con "is", no con "are".`);
  }

  // pasado be
  if (/\b(you|we|they)\s+was\b/.test(text)) {
    push("error", `En pasado: "you/we/they were", no "was".`);
  }

  // there is + plural
  if (/\bthere\s+is\s+(many|several|few|two|three|four|five|six|\d+)/.test(text)) {
    push("error", `Con plural usa "there are": no "there is many", sino "there are many".`);
  }

  // preposición + I → me
  if (/\b(for|with|from|about|without)\s+i\b/.test(text) || /\bbetween\s+\w+\s+and\s+i\b/.test(text)) {
    push("error", `Tras preposición se usa "me": no "for I", sino "for me".`);
  }

  // a/an
  const aRe = /\ba\s+([a-z][a-z]*)/g;
  while ((m = aRe.exec(text)) !== null) {
    const w = m[1];
    if (AN_WORDS.has(w)) {
      push("error", `"${w}" lleva "an" (la h es muda): no "a ${w}", sino "an ${w}".`);
    } else if (/^[aeiou]/.test(w) && !A_EXCEPTIONS.has(w)) {
      push("error", `Ante vocal usa "an": no "a ${w}", sino "an ${w}".`);
    }
  }

  // detalles (no suspenden): "i" minúscula, puntuación final
  if (/(^|\s)i(\s|$)/.test(text)) {
    push("detalle", `Detalle nativo: "yo" siempre es "I" mayúscula.`);
  }
  if (!/[.?!]$/.test(givenRaw.trim())) {
    push("detalle", `Detalle nativo: termina con punto o signo (. ? !).`);
  }

  return issues;
}
