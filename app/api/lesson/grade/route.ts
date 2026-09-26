import { db } from "@/src/db";
import { attempts, profile, vocab } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { nextDifficulty, nextReviewDate, type Difficulty } from "@/lib/adapt";
import { findExercise } from "@/lib/exercises";
import { gradeAnswer, normalize } from "@/lib/grade";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const answer = typeof body?.answer === "string" ? body.answer : "";
  const ex = findExercise(id);
  if (!ex) return Response.json({ error: "unknown exercise" }, { status: 400 });

  const { correct, note } = gradeAnswer(ex.skill, ex.answer, answer);

  await db.insert(attempts).values({
    skill: ex.skill,
    category: ex.category,
    prompt: ex.prompt,
    answer,
    correct: correct ? 1 : 0,
    createdAt: new Date().toISOString(),
  });

  // Racha global (últimos intentos, el recién guardado primero)
  const recent = await db.select().from(attempts).orderBy(desc(attempts.id)).limit(10);
  let run = 0;
  for (const a of recent) {
    if (a.correct === 1) run += 1;
    else break;
  }

  // Subida de dificultad al encadenar exactamente 3 (edge-trigger, especificación T05)
  let leveledUp: string | null = null;
  if (run === 3) {
    const prof = await db.select().from(profile);
    const current = (prof[0]?.level ?? "B1") as Difficulty;
    const next = nextDifficulty(current, run);
    if (next !== current) {
      if (prof.length === 0) {
        await db.insert(profile).values({ id: 1, level: next, streak: 0, lastStudy: null });
      } else {
        await db.update(profile).set({ level: next }).where(eq(profile.id, 1));
      }
      leveledUp = next;
    }
  }

  if (ex.skill === "vocabulario") {
    const word = normalize(ex.answer);
    const existing = await db.select().from(vocab).where(eq(vocab.word, word));
    if (existing.length === 0) {
      await db.insert(vocab).values({
        word,
        seen: 1,
        mastered: correct ? 1 : 0,
        nextReview: correct ? null : nextReviewDate(new Date(), 1),
      });
    } else {
      await db
        .update(vocab)
        .set({
          seen: existing[0].seen + 1,
          mastered: correct ? 1 : existing[0].mastered,
          nextReview: correct ? existing[0].nextReview : nextReviewDate(new Date(), existing[0].seen),
        })
        .where(eq(vocab.word, word));
    }
  }

  const corrections = correct
    ? []
    : [{ type: "respuesta", expected: ex.answer, got: answer, hint: note ?? "Compara con la respuesta esperada." }];
  return Response.json({
    correct,
    expected: ex.answer,
    corrections,
    skill: ex.skill,
    category: ex.category,
    streak: run,
    leveledUp,
  });
}
