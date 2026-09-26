export type Skill = "conversacion" | "gramatica" | "vocabulario" | "writing" | "pronunciacion" | "listening" | "reading";
export type Difficulty = "B1" | "B1+" | "B2" | "B2+" | "C1" | "C1+" | "C2";

export interface CategoryStats {
  category: string;
  attempts: number;
  errors: number;
  mastery: number; // 0..1 por skill
}

export function errorRate(s: CategoryStats): number {
  if (s.attempts <= 0) return 0;
  return s.errors / s.attempts;
}

export function categoryWeight(s: CategoryStats): number {
  return errorRate(s) * 2 + (1 - s.mastery);
}

export function chooseNextCategory(stats: CategoryStats[]): string | null {
  if (stats.length === 0) return null;
  let best = stats[0];
  let bestW = categoryWeight(best);
  for (const s of stats.slice(1)) {
    const w = categoryWeight(s);
    if (w > bestW) {
      best = s;
      bestW = w;
    }
  }
  return best.category;
}

export function shouldLevelUp(consecutiveCorrect: number): boolean {
  return consecutiveCorrect >= 3;
}

const ORDER: Difficulty[] = ["B1", "B1+", "B2", "B2+", "C1", "C1+", "C2"];

export function nextDifficulty(current: Difficulty, consecutiveCorrect: number): Difficulty {
  if (!shouldLevelUp(consecutiveCorrect)) return current;
  const i = ORDER.indexOf(current);
  if (i < 0 || i >= ORDER.length - 1) return current;
  return ORDER[i + 1];
}

export function nextReviewDate(from: Date, failCount: number): string {
  const days = Math.pow(2, Math.max(0, failCount));
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
