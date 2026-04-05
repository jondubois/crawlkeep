import { getLeafInCascading } from "../get-leaf.js";
import { describe, test, expect } from "@jest/globals";

describe("getLeafInCascading", () => {
  test("should return the leaf node for a nested object", () => {
    const nestedObject = {
      tags: {
        inherent: {
          headline: {
            miscellaneous: {},
          },
        },
      },
    };
    const result = getLeafInCascading(nestedObject);
    expect(result).toEqual({});
  });

  test("should return the node itself if it is already a leaf node", () => {
    const leafNode = {};
    const result = getLeafInCascading(leafNode);
    expect(result).toEqual(leafNode);
  });

  test("should throw a TypeError if the input is not an object", () => {
    expect(() => getLeafInCascading(null)).toThrow(TypeError);
    expect(() => getLeafInCascading(42)).toThrow(TypeError);
    expect(() => getLeafInCascading("string")).toThrow(TypeError);
    expect(() => getLeafInCascading([])).toThrow(TypeError);
  });

  test("should handle an empty object correctly", () => {
    const emptyObject = {};
    const result = getLeafInCascading(emptyObject);
    expect(result).toEqual(emptyObject);
  });

  test("should handle a single nested object correctly", () => {
    const singleNestedObject = {
      key: {},
    };
    const result = getLeafInCascading(singleNestedObject);
    expect(result).toEqual({});
  });
});
