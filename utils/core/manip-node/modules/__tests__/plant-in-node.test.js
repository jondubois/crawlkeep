const { plantInNode } = require("../plant-in-node.js");
import { describe, test, expect } from "@jest/globals";

describe("plantInNode", () => {
  test("should throw TypeError for invalid node input", () => {
    expect(() => plantInNode(null, ["a", "b"])).toThrow(TypeError);
    expect(() => plantInNode(42, ["a", "b"])).toThrow(TypeError);
    expect(() => plantInNode("string", ["a", "b"])).toThrow(TypeError);
  });

  test("should throw TypeError for invalid arr input", () => {
    expect(() => plantInNode({}, null)).toThrow(TypeError);
    expect(() => plantInNode({}, 42)).toThrow(TypeError);
    expect(() => plantInNode({}, "string")).toThrow(TypeError);
  });

  test("should return the same node if arr is empty", () => {
    const node = { existing: "value" };
    const result = plantInNode(node, []);
    expect(result).toBe(node);
    expect(result).toEqual({ existing: "value" });
  });

  test("should create nested structure for single key", () => {
    const node = {};
    const result = plantInNode(node, ["key"]);
    expect(result).toEqual({ key: {} });
  });

  test("should create nested objects based on the array keys", () => {
    const node = {};
    plantInNode(node, ["a", "b", "c"]);
    expect(node).toEqual({ a: { b: { c: {} } } });
  });

  test("should not overwrite existing keys", () => {
    const node = { a: { existing: true } };
    plantInNode(node, ["a", "b", "c"]);
    expect(node).toEqual({ a: { existing: true, b: { c: {} } } });
  });

  test("should not overwrite existing keys, even if they are farther down nested", () => {
    const node = { a: { b: { c: {} } } };
    plantInNode(node, ["a", "b"]);
    expect(node).toEqual({ a: { b: { c: {} } } });
  });

  test("should handle empty array", () => {
    const node = { a: { existing: true } };
    plantInNode(node, []);
    expect(node).toEqual({ a: { existing: true } });
  });

  test("should handle complex nested structures", () => {
    const node = { key1: { key2: { existing: "value" } } };
    const result = plantInNode(node, ["key1", "key2", "key3"]);
    expect(result).toEqual({ key1: { key2: { existing: "value", key3: {} } } });
  });
});
