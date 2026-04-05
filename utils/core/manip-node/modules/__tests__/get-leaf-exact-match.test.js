import { getLeafExactMatch } from "../get-leaf.js";
import { describe, expect, test } from "@jest/globals";

describe("getLeafExactMatch", () => {
  test("should throw a TypeError if node is not an object", () => {
    expect(() => getLeafExactMatch(null, {})).toThrow(TypeError);
    expect(() => getLeafExactMatch(42, {})).toThrow(TypeError);
    expect(() => getLeafExactMatch("string", {})).toThrow(TypeError);
    expect(() => getLeafExactMatch([], {})).toThrow(TypeError);
  });

  test("should throw a TypeError if mask is not an object", () => {
    expect(() => getLeafExactMatch({}, null)).toThrow(TypeError);
    expect(() => getLeafExactMatch({}, 42)).toThrow(TypeError);
    expect(() => getLeafExactMatch({}, "string")).toThrow(TypeError);
    expect(() => getLeafExactMatch({}, [])).toThrow(TypeError);
  });

  test("should return an empty array if node is empty", () => {
    const node = {};
    const mask = { key: "value" };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([]);
  });

  test("should return an empty array if mask keys do not match node keys", () => {
    const node = { key1: "value1" };
    const mask = { key2: "value2" };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([]);
  });

  test("should return an empty array if mask values types do not match node values types", () => {
    const node = { key: "value" };
    const mask = { key: 123 };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([]);
  });

  test("should return the node if mask matches node exactly", () => {
    const node = { key: "value" };
    const mask = { key: "value" };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([node]);
  });

  test("should return the leaf nodes for nested objects", () => {
    const node = {
      level1: {
        level2: {
          key: "value",
        },
      },
    };
    const mask = {
      level1: {
        level2: {
          key: "value",
        },
      },
    };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([node.level1.level2]);
  });

  test("should handle arrays of keyed objects", () => {
    const node = {
      level1: [{ key: "value1" }, { key: "value2" }],
    };
    const mask = {
      level1: [{ key: "value1" }],
    };
    const result = getLeafExactMatch(node, mask);
    expect(result).toEqual([{ key: "value1" }]);
  });
});
