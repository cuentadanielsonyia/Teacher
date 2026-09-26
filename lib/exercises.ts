import { z } from "zod";
import raw from "@/data/exercises.json";

export const ExerciseSchema = z.object({
  id: z.string(),
  skill: z.string(),
  category: z.string(),
  level: z.enum(["B1", "B1+", "B2"]),
  prompt: z.string(),
  answer: z.string(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;

const all = z.array(ExerciseSchema).parse(raw);

export function getExercises(): Exercise[] {
  return all;
}

export function findExercise(id: string): Exercise | undefined {
  return all.find((e) => e.id === id);
}

export function pickExercise(filter: { skill?: string; category?: string; level?: string; excludeIds?: string[] }): Exercise {
  const exclude = new Set(filter.excludeIds ?? []);
  let pool = all.filter((e) => !exclude.has(e.id));
  if (filter.category) {
    const byCat = pool.filter((e) => e.category === filter.category);
    if (byCat.length > 0) pool = byCat;
  }
  if (filter.skill) {
    const bySkill = pool.filter((e) => e.skill === filter.skill);
    if (bySkill.length > 0) pool = bySkill;
  }
  if (filter.level) {
    const byLevel = pool.filter((e) => e.level === filter.level);
    if (byLevel.length > 0) pool = byLevel;
  }
  if (pool.length === 0) pool = all;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
