import { getDuplicates } from "../get-duplicates.js";
import { describe, test, expect } from "@jest/globals";

describe("getDuplicates", () => {
  test("should return an empty array when input array is empty", () => {
    const input = [];
    const expected = [];
    expect(getDuplicates(input)).toEqual(expected);
  });

  test("should return an empty array when there are no duplicates", () => {
    const input = ["a", "b", "c"];
    const expected = [];
    expect(getDuplicates(input)).toEqual(expected);
  });

  test("should return an array of duplicate values", () => {
    const input = ["a", "b", "a", "c", "b"];
    const expected = ["a", "b"];
    expect(getDuplicates(input)).toEqual(expected);
  });

  test("should return an array of duplicate values with multiple duplicates", () => {
    const input = ["a", "b", "a", "c", "b", "c", "c"];
    const expected = ["a", "b", "c"];
    expect(getDuplicates(input)).toEqual(expected);
  });

  test("should handle numeric values", () => {
    const input = [1, 2, 3, 1, 2, 4];
    const expected = [1, 2];
    expect(getDuplicates(input)).toEqual(expected);
  });

  test("should handle mixed types", () => {
    const input = [1, "1", 2, "2", 1, "1"];
    const expected = [1, "1"];
    expect(getDuplicates(input)).toEqual(expected);
  });
});
