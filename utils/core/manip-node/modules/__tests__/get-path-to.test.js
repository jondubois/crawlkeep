import { getPathToNode } from "../get-path-to.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../../check/modules/is-json-array.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-json-array.js");

describe("getPathToNode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw a TypeError for an invalid tree_coll type", () => {
    const invalid_tree_coll = "not an object";
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValueOnce("string").mockReturnValueOnce("Object");

    expect(() => getPathToNode(invalid_tree_coll, target_node)).toThrow(
      TypeError,
    );
  });

  test("should throw a TypeError for an invalid target_node type", () => {
    const tree_coll = { nodes: [], edges: [] };
    const invalid_target_node = "not an object";

    typeOf.mockReturnValueOnce("Object").mockReturnValueOnce("string");

    expect(() => getPathToNode(tree_coll, invalid_target_node)).toThrow(
      TypeError,
    );
  });

  test("should throw a TypeError for an invalid nodes or edges type", () => {
    const invalid_tree_coll = { nodes: "not an array", edges: "not an array" };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(false);

    expect(() => getPathToNode(invalid_tree_coll, target_node)).toThrow(
      TypeError,
    );
  });

  test("should throw a TypeError for an empty nodes collection", () => {
    const empty_tree_coll = { nodes: [], edges: [] };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);

    expect(() => getPathToNode(empty_tree_coll, target_node)).toThrow(
      TypeError,
    );
  });

  test("should throw a TypeError for a nodes collection of empty nodes", () => {
    const empty_nodes_tree_coll = { nodes: [{}], edges: [] };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(true);

    expect(() => getPathToNode(empty_nodes_tree_coll, target_node)).toThrow(
      TypeError,
    );
  });

  test("should warn the console if target node is not found", () => {
    const tree_coll = {
      nodes: [
        { id: "1", name: "root" },
        { id: "2", name: "child1" },
        { id: "3", name: "child2" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "1", to: "3" },
      ],
    };
    const target_node = { id: "4", name: "child3" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    console.warn = jest.fn();

    getPathToNode(tree_coll, target_node);
    expect(console.warn).toHaveBeenCalledWith(
      `Target node with id 4 not found in nodes collection`,
    );
  });

  test("should handle empty edges array", () => {
    const tree_coll = {
      nodes: [
        { id: "1", name: "root" },
        { id: "2", name: "child1" },
      ],
      edges: [],
    };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    const expectedPath = ["2"];
    expect(getPathToNode(tree_coll, target_node)).toEqual(expectedPath);
  });

  test("should return the correct path for a single-child tree", () => {
    const tree_coll = {
      nodes: [
        { id: "1", name: "root" },
        { id: "2", name: "child1" },
      ],
      edges: [{ from: "1", to: "2" }],
    };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    const expectedPath = ["1", "2"];
    expect(getPathToNode(tree_coll, target_node)).toEqual(expectedPath);
  });

  test("should return the correct path for a tree with more than one child", () => {
    const tree_coll = {
      nodes: [
        { id: "1", name: "root" },
        { id: "2", name: "child1" },
        { id: "3", name: "child2" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "1", to: "3" },
      ],
    };
    const target_node = { id: "3", name: "child2" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    const expectedPath = ["1", "3"];
    expect(getPathToNode(tree_coll, target_node)).toEqual(expectedPath);
  });

  test("should return the correct path for deeply nested objects", () => {
    const tree_coll = {
      nodes: [
        { id: "1", name: "root" },
        { id: "2", name: "child1" },
        { id: "3", name: "child2" },
        { id: "4", name: "grandchild1" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
    };
    const target_node = { id: "4", name: "grandchild1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    const expectedPath = ["1", "2", "3", "4"];
    expect(getPathToNode(tree_coll, target_node)).toEqual(expectedPath);
  });
});
