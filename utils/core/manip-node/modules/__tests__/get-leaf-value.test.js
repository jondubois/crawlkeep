import { getLeafValue } from "../get-leaf-value.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { jest, describe, test, expect } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");

describe("getLeafValue", () => {
  test("should return the correct leaf value for a valid path", () => {
    const root_node = {
      level1: {
        level2: {
          level3: "leafValue",
        },
      },
    };
    const path_segments = ["level1", "level2", "level3"];

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    const result = getLeafValue(root_node, path_segments);
    expect(result).toBe("leafValue");
  });

  test("should return the root node if path_segments is empty", () => {
    const root_node = {
      level1: {
        level2: {
          level3: "leafValue",
        },
      },
    };
    const path_segments = [];

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    const result = getLeafValue(root_node, path_segments);
    expect(result).toBe(root_node);
  });

  test("should throw a TypeError for invalid root_node type", () => {
    const root_node = "invalid";
    const path_segments = ["level1", "level2", "level3"];

    typeOf.mockReturnValue("String");

    expect(() => getLeafValue(root_node, path_segments)).toThrow(TypeError);
  });

  test("should throw a TypeError for invalid path_segments type", () => {
    const root_node = {
      level1: {
        level2: {
          level3: "leafValue",
        },
      },
    };
    const path_segments = "invalid";

    typeOf.mockReturnValue("Object");

    expect(() => getLeafValue(root_node, path_segments)).toThrow(TypeError);
  });

  test("should throw a TypeError if path_segments contains non-string elements", () => {
    const root_node = {
      level1: {
        level2: {
          level3: "leafValue",
        },
      },
    };
    const path_segments = ["level1", 2, "level3"];

    typeOf.mockReturnValue("Object");

    expect(() => getLeafValue(root_node, path_segments)).toThrow(TypeError);
  });

  test("should return undefined for a non-existent path", () => {
    const root_node = {
      level1: {
        level2: {
          level3: "leafValue",
        },
      },
    };
    const path_segments = ["level1", "level2", "nonExistent"];

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    const result = getLeafValue(root_node, path_segments);
    expect(result).toBeUndefined();
  });

  test("should handle an empty object as root node", () => {
    const root_node = {};
    const path_segments = ["level1", "level2", "level3"];

    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(true);

    const result = getLeafValue(root_node, path_segments);
    expect(result).toBe(root_node);
  });
});
