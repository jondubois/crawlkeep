import { getTreeHeight } from "../get-tree-height.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../../check/modules/is-json-array.js";
import { jest, describe, beforeEach, test, expect } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-json-array.js");

describe("getTreeHeight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw TypeError if root_node is not an object or not hierarchical", () => {
    const root_node = "not an object";
    typeOf.mockReturnValue("string");

    expect(() => getTreeHeight(root_node)).toThrow(TypeError);
    expect(() => getTreeHeight(root_node)).toThrow(
      `getTreeHeight - Invalid argument. Expected ${root_node} to be a hierarchical node tree. Instead, was passed string`,
    );
  });

  test("should return 0 if root_node is an empty object", () => {
    const root_node = {};
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(true);

    expect(getTreeHeight(root_node)).toBe(0);
  });

  test("should return the correct height for a single node tree", () => {
    const root_node = { id: 1 };
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    expect(getTreeHeight(root_node)).toBe(0);
  });

  test("should return the correct height for a multi-level tree", () => {
    const root_node = {
      children: [
        { id: 1, children: [] },
        { id: 2, children: [{ id: 3, children: [] }] },
      ],
    };
    typeOf.mockImplementation((value) => {
      if (
        value === root_node ||
        value === root_node.children[0] ||
        value === root_node.children[1] ||
        value === root_node.children[1].children[0]
      ) {
        return "Object";
      }
      return typeof value;
    });
    isEmptyObj.mockReturnValue(false);
    isJsonArray.mockReturnValue(true);

    expect(getTreeHeight(root_node)).toBe(2);
  });

  test("should return the correct height for a tree with nested objects", () => {
    const root_node = {
      child: {
        grandchild: {
          greatGrandchild: {},
        },
      },
    };
    typeOf.mockImplementation((value) => {
      if (
        value === root_node ||
        value === root_node.child ||
        value === root_node.child.grandchild ||
        value === root_node.child.grandchild.greatGrandchild
      ) {
        return "Object";
      }
      return typeof value;
    });
    isEmptyObj.mockReturnValue(false);
    isJsonArray.mockReturnValue(false);

    expect(getTreeHeight(root_node)).toBe(3);
  });
});
