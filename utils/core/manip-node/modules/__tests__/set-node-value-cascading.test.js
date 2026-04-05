import { setNodeValueCascading } from "../set-node-value-cascading.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");

describe("setNodeValueCascading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should set the value at an intermediate node in a nested node tree with multiple properties at each level", () => {
    const node = {
      tags: {
        inherent: {
          job_title: {
            middle_management: {},
          },
          job_description: {
            miscallenous: {},
            graduate: {},
          },
        },
        inferred: {
          is_characterised_by: {
            middle_management: {},
          },
        },
      },
    };
    const path_segments = ["tags", "inherent", "job_description"];
    const value = { electronics: "engineer" };

    typeOf.mockImplementation((arg) => {
      if (Array.isArray(arg)) return "Array";
      if (arg !== null && typeof arg === "object") return "Object";
      return typeof arg;
    });

    setNodeValueCascading(node, path_segments, value);

    expect(node.tags.inherent.job_description).toEqual(value);
  });

  test("should set the value at an intermediate node in a nested node tree", () => {
    const node = {
      tags: {
        job_description: {
          miscallenous: {
            duration: 1234512987,
            xp_in_pc: 70,
          },
        },
      },
    };
    const path = ["tags", "job_description"];
    const value = { electronics: "engineer" };

    typeOf.mockReturnValue("Object");

    setNodeValueCascading(node, path, value);

    expect(node.tags.job_description).toEqual(value);
  });

  test("should set the value at the specified path", () => {
    const node = { level1: { level2: {} } };
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setNodeValueCascading(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should create nested objects if they do not exist", () => {
    const node = {};
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setNodeValueCascading(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should return the node if path_segments is empty", () => {
    const node = { level1: "value" };
    const path = [];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    const result = setNodeValueCascading(node, path, value);

    expect(result).toBe(node);
  });

  test("should handle deeply nested objects", () => {
    const node = { level1: { level2: { level3: { level4: {} } } } };
    const path = ["level1", "level2", "level3", "level4", "level5"];
    const value = "deepValue";

    typeOf.mockReturnValue("Object");

    setNodeValueCascading(node, path, value);

    expect(node.level1.level2.level3.level4.level5).toBe(value);
  });

  test("should overwrite existing value at the specified path", () => {
    const node = { level1: { level2: { level3: "oldValue" } } };
    const path = ["level1", "level2", "level3"];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    setNodeValueCascading(node, path, value);

    expect(node.level1.level2.level3).toBe(value);
  });

  test("should throw TypeError for invalid node type", () => {
    const node = "invalid";
    const path = ["level1"];
    const value = "newValue";

    typeOf.mockReturnValue("String");

    expect(() => setNodeValueCascading(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for invalid path_segments type", () => {
    const node = { level1: "value" };
    const path = "invalid";
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    expect(() => setNodeValueCascading(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for falsy value", () => {
    const node = { level1: "value" };
    const path = ["level1"];
    const value = null;

    typeOf.mockReturnValue("Object");

    expect(() => setNodeValueCascading(node, path, value)).toThrow(TypeError);
  });

  test("should throw TypeError for non-string elements in path_segments", () => {
    const node = { level1: "value" };
    const path = ["level1", 123];
    const value = "newValue";

    typeOf.mockReturnValue("Object");

    expect(() => setNodeValueCascading(node, path, value)).toThrow(TypeError);
  });
});
