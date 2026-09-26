import { db } from "@/src/db";
import { profile, sessions } from "@/src/db/schema";
import { eq } from "drizzle-orm";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const durationSec = Number(body?.durationSec ?? 0);
  if (!Number.isFinite(durationSec) || durationSec < 0 || durationSec > 12 * 3600) {
    return Response.json({ error: "bad duration" }, { status: 400 });
  }
  await db.insert(sessions).values({ started: new Date().toISOString(), durationSec: Math.round(durationSec) });

  const prof = await db.select().from(profile);
  if (prof.length === 0) {
    await db.insert(profile).values({ id: 1, level: "B1", streak: 1, lastStudy: today() });
  } else {
    const last = prof[0].lastStudy ?? "";
    const t = today();
    if (last !== t) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.toISOString().slice(0, 10);
      await db
        .update(profile)
        .set({ streak: last === y ? prof[0].streak + 1 : 1, lastStudy: t })
        .where(eq(profile.id, 1));
    }
  }
  return Response.json({ ok: true });
}
