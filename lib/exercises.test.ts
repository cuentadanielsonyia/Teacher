import { describe, expect, it } from "vitest";
import { getExercises } from "./exercises";

describe("exercises", () => {
  it("banco amplio camino a nativo (100+)", () => {
    expect(getExercises().length).toBeGreaterThanOrEqual(100);
  });
  it("ids únicos y niveles válidos", () => {
    const all = getExercises();
    const ids = new Set(all.map((e) => e.id));
    expect(ids.size).toBe(all.length);
    const levels = new Set(all.map((e) => e.level));
    for (const l of ["B1", "B2", "C1", "C2"]) expect(levels.has(l as never)).toBe(true);
  });
  it("cada nivel C tiene al menos 8 ejercicios", () => {
    const all = getExercises();
    for (const l of ["C1", "C1+", "C2"]) {
      expect(all.filter((e) => e.level === l).length).toBeGreaterThanOrEqual(8);
    }
  });
});
