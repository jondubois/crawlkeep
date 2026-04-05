import { getLeafNodesIterativePostOrderBFT } from "../get-leaf-nodes.js";
import { describe, test, expect } from "@jest/globals";

// Sample node tree for testing

describe("getLeafNodesIterativePostOrderBFT", () => {
  test("should return all leaf nodes of the tree, in post-order", () => {
    const sampleTree = {
      name: "root",
      children: [
        {
          name: "child1",
          children: [
            {
              name: "child1.1",
              children: [],
            },
            {
              name: "child1.2",
              children: [],
            },
          ],
        },
        {
          name: "child2",
          children: [
            {
              name: "child2.1",
              children: [],
            },
          ],
        },
        {
          name: "child3",
          children: [],
        },
      ],
    };
    const leafNodes = getLeafNodesIterativePostOrderBFT(sampleTree, "children");
    const leafNodeNames = leafNodes.map((node) => node.name);
    expect(leafNodeNames).toEqual([
      "child1.1",
      "child1.2",
      "child2.1",
      "child3",
    ]);
  });

  test("should return root node, if the tree has no leaf nodes", () => {
    const emptyTree = { name: "root", children: [] };
    const leafNodes = getLeafNodesIterativePostOrderBFT(emptyTree, "children");
    expect(leafNodes).toEqual(emptyTree);
  });

  test("should handle a tree with a single node", () => {
    const singleNodeTree = { name: "root", children: [] };
    const leafNodes = getLeafNodesIterativePostOrderBFT(
      singleNodeTree,
      "children",
    );
    expect(leafNodes).toEqual([singleNodeTree]);
  });

  test("should handle a tree with multiple levels of nesting", () => {
    const nestedTree = {
      name: "root",
      children: [
        {
          name: "child1",
          children: [
            {
              name: "child1.1",
              children: [
                {
                  name: "child1.1.1",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
    const leafNodes = getLeafNodesIterativePostOrderBFT(nestedTree, "children");
    const leafNodeNames = leafNodes.map((node) => node.name);
    expect(leafNodeNames).toEqual(["child1.1.1"]);
  });
});
