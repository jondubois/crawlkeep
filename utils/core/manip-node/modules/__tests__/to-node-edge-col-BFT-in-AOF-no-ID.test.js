import { toNodeEdgeColBFTinAOFnoID } from "../to-node-edge-collections.js";
import { describe, test, expect } from "@jest/globals";

describe("toNodeEdgeColBFTinAOFnoID", () => {
  test("should throw a TypeError if child_prop is not a string", () => {
    const root_node = { name: "root", child_entries: [] };
    const invalidChildProp = 123;

    expect(() =>
      toNodeEdgeColBFTinAOFnoID(root_node, invalidChildProp),
    ).toThrow(TypeError);
  });

  test("should return correct nodes and edges for a single node", () => {
    const root_node = { name: "root", child_entries: [] };

    const result = toNodeEdgeColBFTinAOFnoID(root_node);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "root" }],
      edges: [],
    });
  });

  test("should return correct nodes and edges for a tree with multiple levels", () => {
    const root_node = {
      name: "root",
      child_entries: [
        {
          name: "child1",
          child_entries: [{ name: "grandchild1", child_entries: [] }],
        },
        { name: "child2", child_entries: [] },
      ],
    };

    const result = toNodeEdgeColBFTinAOFnoID(root_node);
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

  test("should handle nodes without child_entries property", () => {
    const root_node = { name: "root" };

    const result = toNodeEdgeColBFTinAOFnoID(root_node);
    expect(result).toEqual({
      nodes: [{ id: 0, name: "root" }],
      edges: [],
    });
  });

  test("should handle custom child_prop", () => {
    const root_node = {
      name: "root",
      children: [
        { name: "child1", children: [{ name: "grandchild1", children: [] }] },
        { name: "child2", children: [] },
      ],
    };

    const result = toNodeEdgeColBFTinAOFnoID(root_node, "children");
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
});
