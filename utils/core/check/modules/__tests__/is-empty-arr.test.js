import { isEmptyArr } from "../is-empty-arr.js";
import { describe, it, expect } from "@jest/globals";

describe("isEmptyArr", () => {
  it("should return true for an empty array", () => {
    expect(isEmptyArr([])).toBe(true);
  });

  it("should return false for an array with an empty string", () => {
    expect(isEmptyArr(["", ""])).toBe(false);
  });

  it("should return false for an array with non-empty string", () => {
    expect(isEmptyArr(["non-empty"])).toBe(false);
  });

  it("should return false for an array with multiple elements", () => {
    expect(isEmptyArr([1, 2, 3])).toBe(false);
  });
});
