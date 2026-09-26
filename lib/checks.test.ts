import { describe, expect, it } from "vitest";
import { checkOpenAnswer } from "./checks";

const errors = (s: string) => checkOpenAnswer(s).filter((i) => i.kind === "error");
const detalles = (s: string) => checkOpenAnswer(s).filter((i) => i.kind === "detalle");

describe("checks", () => {
  it("caza have + base (el caso reportado)", () => {
    const e = errors("i have go to the mall");
    expect(e.length).toBeGreaterThan(0);
    expect(e.some((i) => i.hint.includes("gone"))).toBe(true);
  });
  it("acepta have + participio y have to + base", () => {
    expect(errors("I have gone to the mall")).toEqual([]);
    expect(errors("I have to go now, see you later")).toEqual([]);
    expect(errors("She has eaten already and feels fine")).toEqual([]);
  });
  it("caza don't con tercera persona y be", () => {
    expect(errors("He don't like coffee at all").length).toBeGreaterThan(0);
    expect(errors("They is my best friends forever").length).toBeGreaterThan(0);
    expect(errors("She are very happy today").length).toBeGreaterThan(0);
    expect(errors("He doesn't like coffee")).toEqual([]);
  });
  it("caza was/there is/preposición + I / a-an", () => {
    expect(errors("We was at home all evening").length).toBeGreaterThan(0);
    expect(errors("There is many people here today").length).toBeGreaterThan(0);
    expect(errors("This gift is for I and you").length).toBeGreaterThan(0);
    expect(errors("I saw a elephant at the zoo").length).toBeGreaterThan(0);
    expect(errors("He is a university student")).toEqual([]);
  });
  it("respuesta corta suspende; i minúscula es solo detalle", () => {
    expect(errors("I go")).toEqual(
      expect.arrayContaining([expect.objectContaining({ hint: expect.stringContaining("corta") })])
    );
    expect(errors("i went to the mall yesterday")).toEqual([]);
    expect(detalles("i went to the mall yesterday").length).toBeGreaterThan(0);
  });
  it("frase correcta pasa limpia", () => {
    const all = checkOpenAnswer("I went for a walk and watched a movie.");
    expect(all.filter((i) => i.kind === "error")).toEqual([]);
  });
});
