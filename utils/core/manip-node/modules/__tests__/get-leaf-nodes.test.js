import { getLeafNodes } from "../get-leaf-nodes.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../../check/modules/is-json-array.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-json-array.js");

describe("getLeafNodes", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  test("should return an array of leaf nodes", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isJsonArray.mockReturnValue(true);

    const root_node = {
      children: [
        { id: 1, children: [] },
        { id: 2, children: [{ id: 3, children: [] }] },
      ],
    };
    const child_prop = "children";
    const expected = [
      { id: 1, children: [] },
      { id: 3, children: [] },
    ];
    expect(getLeafNodes(root_node, child_prop)).toEqual(expected);
  });

  test("should return root_node in an array if the root node is empty", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(true);

    const root_node = {};
    const child_prop = "children";
    expect(getLeafNodes(root_node, child_prop)).toEqual([root_node]);
  });

  test("should return an empty array if there are no leaf nodes", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isJsonArray.mockReturnValue(true);

    const root_node = { children: [{ children: [] }] };
    const child_prop = "children";
    expect(getLeafNodes(root_node, child_prop)).toEqual([]);
  });

  test("should handle nodes without the child property", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);
    isJsonArray.mockReturnValue(false);

    const root_node = { id: 1 };
    const child_prop = "children";
    const expected = [{ id: 1 }];
    expect(getLeafNodes(root_node, child_prop)).toEqual(expected);
  });

  test("should throw a TypeError if the first argument is not an object", () => {
    typeOf.mockReturnValue("String");
    isEmptyObj.mockReturnValue(false);

    const root_node = "not an object";
    const child_prop = "children";
    expect(() => getLeafNodes(root_node, child_prop)).toThrow(TypeError);
  });

  test("should throw a TypeError if the second argument is not a string", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    const root_node = { children: [] };
    const child_prop = 123;
    expect(() => getLeafNodes(root_node, child_prop)).toThrow(TypeError);
  });

  test("should throw a ReferenceError if the second argument is missing", () => {
    typeOf.mockReturnValue("Object");
    isEmptyObj.mockReturnValue(false);

    const root_node = { children: [] };
    expect(() => getLeafNodes(root_node)).toThrow(ReferenceError);
  });
});
