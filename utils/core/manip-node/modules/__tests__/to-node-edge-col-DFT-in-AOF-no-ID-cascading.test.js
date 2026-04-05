import { toNodeEdgeColBFTinAOFnoIDcascading } from "../to-node-edge-collections.js";
import { describe, test, expect } from "@jest/globals";

describe("toNodeEdgeColBFTinAOFnoIDcascading", () => {
  test("should throw a TypeError if root_node is not an object", () => {
    const invalidRootNode = "invalid_node";

    expect(() => toNodeEdgeColBFTinAOFnoIDcascading(invalidRootNode)).toThrow(
      TypeError,
    );
  });

  test("should return correct nodes and edges for a single node", () => {
    const root_node = { name: "root" };

    const result = toNodeEdgeColBFTinAOFnoIDcascading(root_node);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "root" }],
      edges: [],
    });
  });

  test("should return correct nodes and edges for a tree with multiple levels", () => {
    const root_node = {
      name: "root",
      child1: { name: "child1", grandchild1: { name: "grandchild1" } },
      child2: { name: "child2" },
    };

    const result = toNodeEdgeColBFTinAOFnoIDcascading(root_node);
    expect(result).toEqual({
      nodes: [
        { id: 0, name: "root" },
        { id: 1, name: "child1" },
        { id: 2, name: "child2" },
        { id: 3, name: "grandchild1" },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
      ],
    });
  });

  test("should handle nodes without child nodes", () => {
    const root_node = { name: "root" };

    const result = toNodeEdgeColBFTinAOFnoIDcascading(root_node);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "root" }],
      edges: [],
    });
  });

  test("should handle deeply nested nodes", () => {
    const root_node = {
      name: "root",
      child1: {
        name: "child1",
        grandchild1: {
          name: "grandchild1",
          greatGrandchild1: { name: "greatGrandchild1" },
        },
      },
    };

    const result = toNodeEdgeColBFTinAOFnoIDcascading(root_node);
    expect(result).toEqual({
      nodes: [
        { id: 0, name: "root" },
        { id: 1, name: "child1" },
        { id: 2, name: "grandchild1" },
        { id: 3, name: "greatGrandchild1" },
      ],
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    });
  });
});
