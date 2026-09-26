import { describe, expect, it } from "vitest";
import { isMode, modeOf } from "./modes";

describe("modes", () => {
  it("respeta mode explícito", () => {
    expect(modeOf({ skill: "gramatica", mode: "listening" })).toBe("listening");
  });
  it("mapea por skill", () => {
    expect(modeOf({ skill: "conversacion" })).toBe("speaking");
    expect(modeOf({ skill: "pronunciacion" })).toBe("speaking");
    expect(modeOf({ skill: "writing" })).toBe("writing");
    expect(modeOf({ skill: "gramatica" })).toBe("reading");
    expect(modeOf({ skill: "vocabulario" })).toBe("reading");
    expect(modeOf({ skill: "listening" })).toBe("listening");
    expect(modeOf({ skill: "reading" })).toBe("reading");
  });
  it("valida query param", () => {
    expect(isMode("speaking")).toBe(true);
    expect(isMode("bailar")).toBe(false);
    expect(isMode(null)).toBe(false);
  });
});
