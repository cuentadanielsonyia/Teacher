import { db } from "@/src/db";
import { attempts, profile, vocab } from "@/src/db/schema";
import { chooseNextCategory } from "@/lib/adapt";
import { getExercises, pickExercise } from "@/lib/exercises";
import { normalize } from "@/lib/grade";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude") ?? "";
  const excludeIds = excludeParam.split(",").map((s) => s.trim()).filter(Boolean);
  const excluded = new Set(excludeIds);

  const rows = await db.select().from(attempts);
  let prof = await db.select().from(profile);
  if (prof.length === 0) {
    await db.insert(profile).values({ id: 1, level: "B1", streak: 0, lastStudy: null });
    prof = await db.select().from(profile);
  }
  const level = prof[0]?.level ?? "B1";

  // SRS: vocabulario dominado a medias y con repaso vencido tiene prioridad
  const t = today();
  const words = await db.select().from(vocab);
  const due = new Set(
    words.filter((w) => w.mastered !== 1 && (!w.nextReview || w.nextReview <= t)).map((w) => w.word)
  );
  if (due.size > 0) {
    const candidates = getExercises().filter(
      (e) => e.skill === "vocabulario" && !excluded.has(e.id) && due.has(normalize(e.answer))
    );
    const atLevel = candidates.filter((e) => e.level === level);
    const pool = atLevel.length > 0 ? atLevel : candidates;
    if (pool.length > 0) {
      const ex = pool[Math.floor(Math.random() * pool.length)];
      return Response.json({ id: ex.id, skill: ex.skill, category: ex.category, level: ex.level, prompt: ex.prompt, review: true });
    }
  }

  const byCat = new Map<string, { attempts: number; errors: number }>();
  for (const r of rows) {
    const e = byCat.get(r.category) ?? { attempts: 0, errors: 0 };
    e.attempts += 1;
    if (!r.correct) e.errors += 1;
    byCat.set(r.category, e);
  }
  const stats = [...byCat.entries()].map(([category, v]) => ({
    category,
    attempts: v.attempts,
    errors: v.errors,
    mastery: 0.5,
  }));
  const category = stats.length > 0 ? chooseNextCategory(stats) ?? undefined : undefined;

  const ex = pickExercise({ category, level, excludeIds });
  return Response.json({
    id: ex.id,
    skill: ex.skill,
    category: ex.category,
    level: ex.level,
    prompt: ex.prompt,
  });
}
