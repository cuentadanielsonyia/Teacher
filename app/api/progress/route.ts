import { db } from "@/src/db";
import { attempts, profile, sessions, vocab } from "@/src/db/schema";

export async function GET() {
  const att = await db.select().from(attempts);
  const voc = await db.select().from(vocab);
  const ses = await db.select().from(sessions);
  const prof = await db.select().from(profile);

  const total = att.length;
  const correct = att.filter((a) => a.correct === 1).length;
  const byCat = new Map<string, { attempts: number; errors: number }>();
  for (const a of att) {
    const e = byCat.get(a.category) ?? { attempts: 0, errors: 0 };
    e.attempts += 1;
    if (a.correct !== 1) e.errors += 1;
    byCat.set(a.category, e);
  }
  const errorsTop = [...byCat.entries()]
    .map(([category, v]) => ({ category, ...v, rate: v.attempts ? v.errors / v.attempts : 0 }))
    .sort((x, y) => y.errors - x.errors)
    .slice(0, 5);
  const timeSec = ses.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
  return Response.json({
    total,
    correct,
    accuracy: total ? correct / total : 0,
    errorsTop,
    vocabSeen: voc.length,
    vocabMastered: voc.filter((v) => v.mastered === 1).length,
    timeSec,
    sessions: ses.length,
    streak: prof[0]?.streak ?? 0,
    level: prof[0]?.level ?? "B1",
  });
}
