import { getPathToNodeBy } from "../get-path-to.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../../check/modules/is-json-array.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");
jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../check/modules/is-json-array.js");

describe("getPathToNodeBy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw a TypeError for an invalid tree_coll type", () => {
    const invalid_tree_coll = "not an object";
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValueOnce("string").mockReturnValueOnce("Object");

    expect(() =>
      getPathToNodeBy(invalid_tree_coll, target_node, "name"),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError for an invalid target_node type", () => {
    const tree_coll = { nodes: [], edges: [] };
    const invalid_target_node = "not an object";

    typeOf.mockReturnValueOnce("Object").mockReturnValueOnce("string");

    expect(() =>
      getPathToNodeBy(tree_coll, invalid_target_node, "name"),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError for an invalid nodes or edges type", () => {
    const invalid_tree_coll = { nodes: "not an array", edges: "not an array" };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(false);

    expect(() =>
      getPathToNodeBy(invalid_tree_coll, target_node, "name"),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError if nodes or edges are not arrays", () => {
    const invalid_tree_coll = { nodes: "not an array", edges: "not an array" };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(false);

    expect(() =>
      getPathToNodeBy(invalid_tree_coll, target_node, "name"),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError if tree_coll doesn't have a nodes or edges property", () => {
    const invalid_tree_coll = { not_nodes: [], not_edges: [] };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");

    expect(() =>
      getPathToNodeBy(invalid_tree_coll, target_node, "name"),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError for an empty nodes collection", () => {
    const empty_tree_coll = { nodes: [], edges: [] };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);

    expect(() => getPathToNodeBy(empty_tree_coll, target_node, "name")).toThrow(
      TypeError,
    );
  });

  test("should throw a TypeError for a nodes collection of empty nodes", () => {
    const empty_nodes_tree_coll = { nodes: [{}], edges: [] };
    const target_node = { id: "2", name: "child1" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(true);

    expect(() =>
      getPathToNodeBy(empty_nodes_tree_coll, target_node, "name"),
    ).toThrow(TypeError);
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

    getPathToNodeBy(tree_coll, target_node, "name");
    expect(console.warn).toHaveBeenCalledWith(
      `getPathToNodeBy - Target node identified by id with ID 4 not found in nodes collection`,
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

    const expectedPath = ["child1"];
    expect(getPathToNodeBy(tree_coll, target_node, "name")).toEqual(
      expectedPath,
    );
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

    const expectedPath = ["root", "child1"];
    expect(getPathToNodeBy(tree_coll, target_node, "name")).toEqual(
      expectedPath,
    );
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

    const expectedPath = ["root", "child2"];
    expect(getPathToNodeBy(tree_coll, target_node, "name")).toEqual(
      expectedPath,
    );
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

    const expectedPath = ["root", "child1", "child2", "grandchild1"];
    expect(getPathToNodeBy(tree_coll, target_node, "name")).toEqual(
      expectedPath,
    );
  });

  test("should return the correct path for a tree with custom id_key", () => {
    const tree_coll = {
      nodes: [
        { custom_id: "1", name: "root" },
        { custom_id: "2", name: "child1" },
        { custom_id: "3", name: "child2" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "1", to: "3" },
      ],
    };
    const target_node = { custom_id: "3", name: "child2" };

    typeOf.mockReturnValue("Object");
    isJsonArray.mockReturnValue(true);
    isEmptyObj.mockReturnValue(false);

    const expectedPath = ["root", "child2"];
    expect(
      getPathToNodeBy(tree_coll, target_node, "name", "custom_id"),
    ).toEqual(expectedPath);
  });
});
