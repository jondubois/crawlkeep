import { toNodeEdgeColBFTinAOFwID } from "../to-node-edge-collections.js";
import { describe, it, expect } from "@jest/globals";

// passed
describe("toNodeEdgeColBFTinAOFwID", () => {
  it("should throw a TypeError if the first argument is not an object with an id property", () => {
    expect(() => toNodeEdgeColBFTinAOFwID(null, "children")).toThrow(TypeError);
    expect(() => toNodeEdgeColBFTinAOFwID({}, "children")).toThrow(TypeError);
    expect(() =>
      toNodeEdgeColBFTinAOFwID({ name: "root" }, "children"),
    ).toThrow(TypeError);
  });

  it("should throw a TypeError if the second argument is not a string", () => {
    expect(() => toNodeEdgeColBFTinAOFwID({ id: 1 }, null)).toThrow(TypeError);
    expect(() => toNodeEdgeColBFTinAOFwID({ id: 1 }, 123)).toThrow(TypeError);
    expect(() => toNodeEdgeColBFTinAOFwID({ id: 1 }, {})).toThrow(TypeError);
  });

  it("should throw a TypeError if the first argument is an empty object", () => {
    expect(() => toNodeEdgeColBFTinAOFwID({}, "children")).toThrow(TypeError);
  });

  it("should throw an Error if the tree node does not have an id property", () => {
    expect(() =>
      toNodeEdgeColBFTinAOFwID({ children: [] }, "children"),
    ).toThrow(Error);
  });

  it("should throw an Error if the id property of the tree node is null or undefined", () => {
    expect(() => toNodeEdgeColBFTinAOFwID({ id: null }, "children")).toThrow(
      Error,
    );
  });

  it("should throw an Error if the child property is not provided", () => {
    expect(() => toNodeEdgeColBFTinAOFwID({ id: 1 })).toThrow(Error);
  });

  it("should return correct nodes and edges for a simple tree", () => {
    const tree = {
      id: 1,
      children: [
        { id: 2, children: [] },
        { id: 3, children: [] },
      ],
    };
    const result = toNodeEdgeColBFTinAOFwID(tree, "children");
    expect(result).toEqual({
      nodes: [
        {
          id: 1,
          children: [
            { id: 2, children: [] },
            { id: 3, children: [] },
          ],
        },
        { id: 2, children: [] },
        { id: 3, children: [] },
      ],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
      ],
    });
  });

  it("should return correct nodes and edges for a more complex tree", () => {
    const tree = {
      id: 1,
      children: [
        { id: 2, children: [{ id: 4, children: [] }] },
        { id: 3, children: [] },
      ],
    };
    const result = toNodeEdgeColBFTinAOFwID(tree, "children");
    expect(result).toEqual({
      nodes: [
        {
          id: 1,
          children: [
            { id: 2, children: [{ id: 4, children: [] }] },
            { id: 3, children: [] },
          ],
        },
        { id: 2, children: [{ id: 4, children: [] }] },
        { id: 3, children: [] },
        { id: 4, children: [] },
      ],
      edges: [
        { from: 1, to: 2 },
        { from: 1, to: 3 },
        { from: 2, to: 4 },
      ],
    });
  });
});
