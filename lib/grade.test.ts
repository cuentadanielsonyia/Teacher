import { describe, expect, it } from "vitest";
import { gradeAnswer, normalize, scoreReading } from "./grade";

describe("grade", () => {
  it("normaliza mayúsculas, espacios y puntuación", () => {
    expect(normalize("  The  Sun! ")).toBe("the sun");
    expect(normalize("¿went?")).toBe("went");
  });
  it("acepta igualdad exacta normalizada", () => {
    expect(gradeAnswer("gramatica", "went", "  WENT. ")).toEqual({ correct: true, note: null });
  });
  it("suspende cerrada distinta", () => {
    const r = gradeAnswer("gramatica", "went", "goed");
    expect(r.correct).toBe(false);
  });
  it("suspende respuesta vacía aunque sea abierta", () => {
    expect(gradeAnswer("conversacion", "I like reading.", "   ").correct).toBe(false);
  });
  it("acepta abierta elaborada aunque no sea exacta", () => {
    const r = gradeAnswer("conversacion", "I like reading.", "I really enjoy reading novels every night");
    expect(r.correct).toBe(true);
    expect(r.note).not.toBeNull();
  });
  it("suspende abierta demasiado corta", () => {
    expect(gradeAnswer("writing", "Dear Sir or Madam,", "hi").correct).toBe(false);
  });
  it("acepta alternativas válidas", () => {
    expect(gradeAnswer("vocabulario", "knife", "KNOW.", ["know", "knight"]).correct).toBe(true);
    expect(gradeAnswer("vocabulario", "knife", "fork", ["know"]).correct).toBe(false);
  });
  it("puntúa lectura en voz alta por palabras", () => {
    const full = scoreReading("The weather is changing", "the weather is changing");
    expect(full.score).toBe(100);
    const half = scoreReading("the weather is changing quickly today", "the weather is");
    expect(half.score).toBeLessThan(60);
    expect(half.missing).toContain("changing");
  });
});
