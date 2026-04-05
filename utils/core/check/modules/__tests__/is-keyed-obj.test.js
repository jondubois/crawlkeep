import { isKeyedObject } from "../is-keyed-obj.js";
import { describe, it, expect } from "@jest/globals";

describe("isKeyedObject", () => {
  it("should return true for keyed objects", () => {
    expect(isKeyedObject({ key: "value" })).toBe(true);
  });

  it("should return false for non-keyed objects", () => {
    expect(isKeyedObject([])).toBe(false);
    expect(isKeyedObject(null)).toBe(false);
    expect(isKeyedObject(new Date())).toBe(false);
    expect(isKeyedObject(() => {})).toBe(false);
  });
});
