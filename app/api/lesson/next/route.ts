import { db } from "@/src/db";
import { attempts, profile } from "@/src/db/schema";
import { chooseNextCategory } from "@/lib/adapt";
import { pickExercise } from "@/lib/exercises";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude") ?? "";
  const excludeIds = excludeParam.split(",").map((s) => s.trim()).filter(Boolean);

  const rows = await db.select().from(attempts);
  const prof = await db.select().from(profile);
  const level = prof[0]?.level ?? "B1";

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
