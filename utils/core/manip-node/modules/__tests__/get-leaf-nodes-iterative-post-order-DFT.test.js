import { getLeafNodesIterativePostOrderDFT } from "../get-leaf-nodes.js";
import { describe, test, expect } from "@jest/globals";

describe("getLeafNodesIterativePostOrderDFT", () => {
  test("should throw a TypeError if the root is not an object or child_prop is not a string", () => {
    expect(() => getLeafNodesIterativePostOrderDFT(null, "children")).toThrow(
      TypeError,
    );
    expect(() => getLeafNodesIterativePostOrderDFT({}, 123)).toThrow(TypeError);
  });

  test("should return an empty array if the root is an empty object", () => {
    expect(getLeafNodesIterativePostOrderDFT({}, "children")).toEqual([]);
  });

  test("should return the root node if it has an empty children array", () => {
    const root = { id: 1, children: [] };
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual([root]);
  });

  test("should not return the root node if it has no children property, but an empty array", () => {
    const root = { id: 1 };
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual([]);
  });

  test("should handle trees with no children property", () => {
    const root = {
      id: 1,
      child_nodes: [
        {
          id: 2,
          child_nodes: [
            {
              id: 3,
              child_nodes: [{ id: 4, child_nodes: [] }],
            },
          ],
        },
      ],
    };
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual([]);
  });

  test("should handle trees with varying child property names", () => {
    const root = {
      id: 1,
      descendants: [
        { id: 2, descendants: [] },
        { id: 3, descendants: [] },
        { id: 4, descendants: [] },
      ],
    };
    const expectedLeafNodes = [
      { id: 2, descendants: [] },
      { id: 3, descendants: [] },
      { id: 4, descendants: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "descendants")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should return all leaf nodes in a simple tree", () => {
    const root = {
      id: 1,
      children: [
        { id: 2, children: [] },
        { id: 3, children: [] },
        { id: 4, children: [] },
      ],
    };
    const expectedLeafNodes = [
      { id: 2, children: [] },
      { id: 3, children: [] },
      { id: 4, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should return all leaf nodes in a complex tree", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          children: [
            { id: 5, children: [] },
            { id: 6, children: [] },
          ],
        },
        {
          id: 3,
          children: [{ id: 7, children: [] }],
        },
        { id: 4, children: [] },
      ],
    };
    const expectedLeafNodes = [
      { id: 5, children: [] },
      { id: 6, children: [] },
      { id: 7, children: [] },
      { id: 4, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should handle trees with nested children", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          children: [
            {
              id: 5,
              children: [{ id: 8, children: [] }],
            },
          ],
        },
        {
          id: 3,
          children: [{ id: 6, children: [] }],
        },
        {
          id: 4,
          children: [{ id: 7, children: [] }],
        },
      ],
    };
    const expectedLeafNodes = [
      { id: 8, children: [] },
      { id: 6, children: [] },
      { id: 7, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should handle trees with successive levels of nesting", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          children: [
            {
              id: 3,
              children: [{ id: 4, children: [] }],
            },
          ],
        },
      ],
    };
    const expectedLeafNodes = [{ id: 4, children: [] }];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should handle trees with mixed children and no children nodes", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          children: [],
        },
        {
          id: 3,
          children: [{ id: 4, children: [] }],
        },
      ],
    };
    const expectedLeafNodes = [
      { id: 2, children: [] },
      { id: 4, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should handle trees with mixed children and no children property", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          child_node: [],
        },
        {
          id: 3,
          children: [{ id: 4, children: [] }],
        },
      ],
    };
    const expectedLeafNodes = [{ id: 4, children: [] }];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should not count nodes without the specified child property as leaf nodes", () => {
    const root = {
      id: 1,
      children: [{ id: 2 }, { id: 3, children: [] }, { id: 4, children: [] }],
    };
    const expectedLeafNodes = [
      { id: 3, children: [] },
      { id: 4, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });

  test("should return leaf nodes in post-order traversal order", () => {
    const root = {
      id: 1,
      children: [
        {
          id: 2,
          children: [
            { id: 5, children: [] },
            { id: 6, children: [] },
          ],
        },
        {
          id: 3,
          children: [{ id: 7, children: [] }],
        },
        { id: 4, children: [] },
      ],
    };
    const expectedLeafNodes = [
      { id: 5, children: [] },
      { id: 6, children: [] },
      { id: 7, children: [] },
      { id: 4, children: [] },
    ];
    expect(getLeafNodesIterativePostOrderDFT(root, "children")).toEqual(
      expectedLeafNodes,
    );
  });
});
