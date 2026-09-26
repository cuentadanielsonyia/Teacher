import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(),
  level: text("level").notNull().default("B1"),
  streak: integer("streak").notNull().default(0),
  lastStudy: text("last_study"),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  skill: text("skill").notNull(),
  category: text("category").notNull(),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  correct: integer("correct").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const vocab = sqliteTable("vocab", {
  word: text("word").primaryKey(),
  seen: integer("seen").notNull().default(1),
  mastered: integer("mastered").notNull().default(0),
  nextReview: text("next_review"),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  started: text("started").notNull(),
  durationSec: integer("duration_sec").notNull().default(0),
});
