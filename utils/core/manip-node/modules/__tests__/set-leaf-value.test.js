import { setLeafValue } from "../set-leaf-value.js";
import { typeOf } from "../../../type-of.js";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");

describe("setLeafValue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should set the value at the specified path", () => {
    const node = { level1: { level2: {} } };
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setLeafValue(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should create nested objects if they do not exist", () => {
    const node = {};
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setLeafValue(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should return the node if path_segments is empty", () => {
    const node = { level1: "value" };
    const path = [];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    const result = setLeafValue(node, path, value);

    expect(result).toBe(node);
  });

  test("should handle deeply nested objects", () => {
    const node = { level1: { level2: { level3: { level4: {} } } } };
    const path = ["level1", "level2", "level3", "level4", "level5"];
    const value = "deepValue";

    typeOf.mockReturnValue("Object");

    setLeafValue(node, path, value);

    expect(node.level1.level2.level3.level4.level5).toBe(value);
  });

  test("should overwrite existing value at the specified path", () => {
    const node = { level1: { level2: { level3: "oldValue" } } };
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setLeafValue(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should throw TypeError for invalid node type", () => {
    const node = "invalid";
    const path = ["level1"];
    const value = "newValue";

    typeOf.mockReturnValue("String");

    expect(() => setLeafValue(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for invalid path_segments type", () => {
    const node = { level1: "value" };
    const path = "invalid";
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    expect(() => setLeafValue(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for falsy value", () => {
    const node = { level1: "value" };
    const path = ["level1"];
    const value = null;

    typeOf.mockReturnValue("Object");

    expect(() => setLeafValue(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for non-string elements in path_segments", () => {
    const node = { level1: "value" };
    const path = ["level1", 123];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    expect(() => setLeafValue(node, path, value)).toThrow(TypeError);
  });
});
