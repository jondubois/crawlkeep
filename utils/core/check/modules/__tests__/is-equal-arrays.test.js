import { isEqualArrays } from "../is-equal-arrays.js";
import { describe, test, expect } from "@jest/globals";

describe("isEqualArrays function", () => {
  test("should return true for two empty arrays", () => {
    expect(isEqualArrays([], [])).toBe(true);
  });

  test("should return true for two identical arrays with same elements", () => {
    expect(isEqualArrays([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  test("should return false for two arrays of different lengths", () => {
    expect(isEqualArrays([1, 2, 3], [1, 2])).toBe(false);
  });

  test("should return false for two arrays with same length but different elements", () => {
    expect(isEqualArrays([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  test("should return false for two arrays with elements in different order", () => {
    expect(isEqualArrays([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  test("should throw TypeError if first argument is not an array", () => {
    expect(() => isEqualArrays(null, [1, 2, 3])).toThrow(TypeError);
  });

  test("should throw TypeError if second argument is not an array", () => {
    expect(() => isEqualArrays([1, 2, 3], null)).toThrow(TypeError);
  });

  test("should throw TypeError if neither arguments are arrays", () => {
    expect(() => isEqualArrays("1,2,3", "1,2,3")).toThrow(TypeError);
  });
});
