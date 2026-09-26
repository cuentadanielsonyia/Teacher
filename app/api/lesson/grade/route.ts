import { db } from "@/src/db";
import { attempts, vocab } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { findExercise } from "@/lib/exercises";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[.,!?;:"'¡¿]/g, "").replace(/\s+/g, " ");
}

const OPEN_SKILLS = new Set(["conversacion", "writing"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const answer = typeof body?.answer === "string" ? body.answer : "";
  const ex = findExercise(id);
  if (!ex) return Response.json({ error: "unknown exercise" }, { status: 400 });

  const expected = norm(ex.answer);
  const given = norm(answer);
  let correct = given === expected;
  let note: string | null = null;
  if (!correct && OPEN_SKILLS.has(ex.skill) && given.length >= 12) {
    correct = true;
    note = "Respuesta abierta aceptada (revisión ligera en MVP).";
  }

  await db.insert(attempts).values({
    skill: ex.skill,
    category: ex.category,
    prompt: ex.prompt,
    answer,
    correct: correct ? 1 : 0,
    createdAt: new Date().toISOString(),
  });

  if (ex.skill === "vocabulario") {
    const word = expected;
    const existing = await db.select().from(vocab).where(eq(vocab.word, word));
    if (existing.length === 0) {
      await db.insert(vocab).values({ word, seen: 1, mastered: correct ? 1 : 0, nextReview: null });
    } else {
      await db
        .update(vocab)
        .set({ seen: existing[0].seen + 1, mastered: correct ? 1 : existing[0].mastered })
        .where(eq(vocab.word, word));
    }
  }

  const corrections = correct
    ? []
    : [{ type: "respuesta", expected: ex.answer, got: answer, hint: note ?? "Compara con la respuesta esperada." }];
  return Response.json({ correct, expected: ex.answer, corrections, skill: ex.skill, category: ex.category });
}
