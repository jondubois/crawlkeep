import { getTreeHeightCascading } from "../get-depth-of-nesting.js";
import { describe, test, expect } from "@jest/globals";

describe("getTreeHeightCascading", () => {
  test("should throw a TypeError for non-object input", () => {
    expect(() => getTreeHeightCascading(42)).toThrow(TypeError);
    expect(() => getTreeHeightCascading("string")).toThrow(TypeError);
    expect(() => getTreeHeightCascading(null)).toThrow(TypeError);
    expect(() => getTreeHeightCascading(undefined)).toThrow(TypeError);
  });

  test("should return 0 for an empty object", () => {
    const obj = {};
    expect(getTreeHeightCascading(obj)).toBe(0);
  });

  test("should return 0 for an object with no nesting", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(getTreeHeightCascading(obj)).toBe(0);
  });

  test("should return the correct depth for a nested object", () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    expect(getTreeHeightCascading(obj)).toBe(2);
  });

  test("should return the correct depth for a deeply nested object", () => {
    const obj = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    expect(getTreeHeightCascading(obj)).toBe(5);
  });

  test("should handle objects with mixed types correctly", () => {
    const obj = { a: 1, b: { c: 2, d: { e: 3 } }, f: "string", g: [1, 2, 3] };
    expect(getTreeHeightCascading(obj)).toBe(2);
  });
});
