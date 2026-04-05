import { getLeafNodesCascadingRecursive } from "../get-leaf-nodes.js";
import { describe, test, expect } from "@jest/globals";

describe("getLeafNodesCascadingRecursive", () => {
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
    const result = getLeafNodesCascadingRecursive(nestedObject);
    expect(result).toEqual({});
  });

  test("should return the node itself if it is already a leaf node", () => {
    const leafNode = {};
    const result = getLeafNodesCascadingRecursive(leafNode);
    expect(result).toEqual(leafNode);
  });

  test("should throw a TypeError if the input is not an object", () => {
    expect(() => getLeafNodesCascadingRecursive(null)).toThrow(TypeError);
    expect(() => getLeafNodesCascadingRecursive(42)).toThrow(TypeError);
    expect(() => getLeafNodesCascadingRecursive("string")).toThrow(TypeError);
    expect(() => getLeafNodesCascadingRecursive([])).toThrow(TypeError);
  });

  test("should handle an empty object correctly", () => {
    const emptyObject = {};
    const result = getLeafNodesCascadingRecursive(emptyObject);
    expect(result).toEqual(emptyObject);
  });

  test("should handle a single nested object correctly", () => {
    const singleNestedObject = {
      key: {},
    };
    const result = getLeafNodesCascadingRecursive(singleNestedObject);
    expect(result).toEqual({});
  });
});
