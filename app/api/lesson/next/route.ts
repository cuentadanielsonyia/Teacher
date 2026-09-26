import { db } from "@/src/db";
import { attempts, profile, vocab } from "@/src/db/schema";
import { chooseNextCategory } from "@/lib/adapt";
import { getExercises, pickExercise } from "@/lib/exercises";
import { normalize } from "@/lib/grade";
import { isMode, modeOf } from "@/lib/modes";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude") ?? "";
  const excludeIds = excludeParam.split(",").map((s) => s.trim()).filter(Boolean);
  const excluded = new Set(excludeIds);
  const modeParam = searchParams.get("mode");
  const skillParam = searchParams.get("skill");
  const categoryParam = searchParams.get("category");

  const rows = await db.select().from(attempts);
  let prof = await db.select().from(profile);
  if (prof.length === 0) {
    await db.insert(profile).values({ id: 1, level: "B1", streak: 0, lastStudy: null });
    prof = await db.select().from(profile);
  }
  const level = prof[0]?.level ?? "B1";

  // Banco filtrado por modo/skill/categoría (con fallback si el filtro vacía)
  let candidates = getExercises();
  if (isMode(modeParam)) {
    const byMode = candidates.filter((e) => modeOf(e) === modeParam);
    if (byMode.length > 0) candidates = byMode;
  }
  if (skillParam) {
    const bySkill = candidates.filter((e) => e.skill === skillParam);
    if (bySkill.length > 0) candidates = bySkill;
  }
  if (categoryParam) {
    const byCat = candidates.filter((e) => e.category === categoryParam);
    if (byCat.length > 0) candidates = byCat;
  }

  // SRS: vocabulario vencido tiene prioridad (dentro de los candidatos)
  const t = today();
  const words = await db.select().from(vocab);
  const due = new Set(
    words.filter((w) => w.mastered !== 1 && (!w.nextReview || w.nextReview <= t)).map((w) => w.word)
  );
  if (due.size > 0) {
    const duePool = candidates.filter(
      (e) => e.skill === "vocabulario" && !excluded.has(e.id) && due.has(normalize(e.answer))
    );
    const atLevel = duePool.filter((e) => e.level === level);
    const pool = atLevel.length > 0 ? atLevel : duePool;
    if (pool.length > 0) {
      const ex = pool[Math.floor(Math.random() * pool.length)];
      return Response.json({ id: ex.id, skill: ex.skill, category: ex.category, level: ex.level, prompt: ex.prompt, review: true });
    }
  }

  // Cobertura: evita repetir lo intentado hasta agotar el banco
  const seenPrompts = new Set(rows.map((r) => r.prompt));
  const dbSeenIds = candidates.filter((e) => seenPrompts.has(e.prompt)).map((e) => e.id);
  const allExclude = [...new Set([...excludeIds, ...dbSeenIds])];

  // Peso por errores dentro de las categorías candidatas
  const candCats = new Set(candidates.map((e) => e.category));
  const byCat = new Map<string, { attempts: number; errors: number }>();
  for (const r of rows) {
    if (!candCats.has(r.category)) continue;
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
  const category = categoryParam ?? (stats.length > 0 ? chooseNextCategory(stats) ?? undefined : undefined);

  const ex = pickExercise({ category, level, excludeIds: allExclude, pool: candidates });
  return Response.json({
    id: ex.id,
    skill: ex.skill,
    category: ex.category,
    level: ex.level,
    prompt: ex.prompt,
    ...(ex.passage ? { passage: ex.passage } : {}),
    ...(ex.speak ? { speak: ex.speak } : {}),
  });
}
