import { toNodeEdgeColBFTinAOFnoIDcascadingBy } from "../to-node-edge-collections.js";
import { describe, test, expect } from "@jest/globals";

describe("toNodeEdgeColBFTinAOFnoIDcascadingBy", () => {
  test("should throw a TypeError if root_node is not an object", () => {
    const invalidRootNode = "invalid_node";
    const name_key = "name";

    expect(() =>
      toNodeEdgeColBFTinAOFnoIDcascadingBy(invalidRootNode, name_key),
    ).toThrow(TypeError);
  });

  test("should throw a TypeError if name_key is not a string", () => {
    const root_node = { value: "root_value" };
    const invalidNameKey = 123;

    expect(() =>
      toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, invalidNameKey),
    ).toThrow(TypeError);
  });

  test("should return correct nodes and edges for a single node", () => {
    const root_node = { value: "root_value" };
    const name_key = "name";

    const result = toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, name_key);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "value", value: "root_value" }],
      edges: [],
    });
  });

  test("should return correct nodes and edges for a tree with multiple levels", () => {
    const root_node = {
      value: "root_value",
      child1: {
        value: "child1_value",
        grandchild1: { value: "grandchild1_value" },
      },
      child2: { value: "child2_value" },
    };
    const name_key = "name";

    const result = toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, name_key);
    expect(result).toEqual({
      nodes: [
        { id: 0, name: "value", value: "root_value" },
        { id: 1, name: "child1", value: "child1_value" },
        { id: 2, name: "child2", value: "child2_value" },
        { id: 3, name: "grandchild1", value: "grandchild1_value" },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
      ],
    });
  });

  test("should handle nodes without child nodes", () => {
    const root_node = { value: "root_value" };
    const name_key = "name";

    const result = toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, name_key);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "value", value: "root_value" }],
      edges: [],
    });
  });

  test("should handle deeply nested nodes", () => {
    const root_node = {
      value: "root_value",
      child1: {
        value: "child1_value",
        grandchild1: {
          value: "grandchild1_value",
          greatGrandchild1: { value: "greatGrandchild1_value" },
        },
      },
    };
    const name_key = "name";

    const result = toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, name_key);
    expect(result).toEqual({
      nodes: [
        { id: 0, name: "value", value: "root_value" },
        { id: 1, name: "child1", value: "child1_value" },
        { id: 2, name: "grandchild1", value: "grandchild1_value" },
        { id: 3, name: "greatGrandchild1", value: "greatGrandchild1_value" },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    });
  });
});
