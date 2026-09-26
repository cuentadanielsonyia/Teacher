import { describe, expect, it } from "vitest";
import {
  categoryWeight,
  chooseNextCategory,
  errorRate,
  nextDifficulty,
  nextReviewDate,
  shouldLevelUp,
} from "./adapt";

describe("adapt", () => {
  it("errorRate 0 sin intentos", () => {
    expect(errorRate({ category: "x", attempts: 0, errors: 0, mastery: 0 })).toBe(0);
  });
  it("peso prioriza errores sobre mastery", () => {
    const a = { category: "past-simple", attempts: 10, errors: 8, mastery: 0.9 };
    const b = { category: "articles", attempts: 10, errors: 1, mastery: 0.1 };
    expect(categoryWeight(a)).toBeGreaterThan(categoryWeight(b));
  });
  it("chooseNextCategory elige max peso", () => {
    const c = chooseNextCategory([
      { category: "a", attempts: 5, errors: 0, mastery: 0.9 },
      { category: "b", attempts: 5, errors: 5, mastery: 0.1 },
    ]);
    expect(c).toBe("b");
  });
  it("chooseNextCategory null vacío", () => {
    expect(chooseNextCategory([])).toBeNull();
  });
  it("level up tras 3 aciertos", () => {
    expect(shouldLevelUp(2)).toBe(false);
    expect(shouldLevelUp(3)).toBe(true);
    expect(nextDifficulty("B1", 3)).toBe("B1+");
    expect(nextDifficulty("B1+", 3)).toBe("B2");
    expect(nextDifficulty("B2", 5)).toBe("B2");
    expect(nextDifficulty("B1", 2)).toBe("B1");
  });
  it("SRS 2^fallos días", () => {
    const base = new Date("2026-09-26T00:00:00Z");
    expect(nextReviewDate(base, 0)).toBe("2026-09-27");
    expect(nextReviewDate(base, 1)).toBe("2026-09-28");
    expect(nextReviewDate(base, 2)).toBe("2026-09-30");
  });
});
