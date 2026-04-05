import { getLeafNodesCascadingDFT } from "../get-leaf-nodes.js";
import { typeOf } from "../../../type-of.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");

describe("getLeafNodesCascadingDFT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return multiple leaf nodes", () => {
    const root_node = {
      child1: { id: 1 },
      child2: { id: 2 },
      child3: { id: 3 },
    };
    typeOf.mockImplementation((value) => {
      if (
        value === root_node ||
        value === root_node.child1 ||
        value === root_node.child2 ||
        value === root_node.child3
      ) {
        return "Object";
      }
      return typeof value;
    });

    const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(getLeafNodesCascadingDFT(root_node)).toEqual(expected);
  });

  test("should handle a node tree with more than one child node", () => {
    const root_node = {
      child1: { id: 1, subchild: { id: 4 } },
      child2: { id: 2 },
      child3: { id: 3, subchild: { id: 5 } },
    };
    typeOf.mockImplementation((value) => {
      if (
        value === root_node ||
        value === root_node.child1 ||
        value === root_node.child1.subchild ||
        value === root_node.child2 ||
        value === root_node.child3 ||
        value === root_node.child3.subchild
      ) {
        return "Object";
      }
      return typeof value;
    });

    const expected = [{ id: 4 }, { id: 2 }, { id: 5 }];
    expect(getLeafNodesCascadingDFT(root_node)).toEqual(expected);
  });

  test("should return the leaf node of a single-child tree", () => {
    const tree = {
      tags: {
        inherent: {
          company_description: {
            martech: {},
          },
        },
      },
    };
    typeOf.mockReturnValue("Object");
    const leafNodes = getLeafNodesCascadingDFT(tree);
    expect(leafNodes).toEqual([tree.tags.inherent.company_description.martech]);
  });

  test("should return a root_node in an Array if root_node is an empty object", () => {
    const root_node = {};
    typeOf.mockReturnValue("Object");

    expect(getLeafNodesCascadingDFT(root_node)).toEqual([root_node]);
  });

  test("should return the root node if it is a leaf node", () => {
    const tree = { martech: {} };
    typeOf.mockReturnValue("Object");

    const leafNodes = getLeafNodesCascadingDFT(tree);
    expect(leafNodes).toEqual([tree.martech]);
  });

  //   test("should handle a tree with more than one child", () => {
  // const tree = {
  //   tags: {
  //     inherent: {
  //       company_description: {
  //         martech: {},
  //         adtech: {},
  //       },
  //     },
  //   },
  // };

  //     typeOf.mockReturnValue("Object");

  //     const leafNodes = getLeafNodesCascadingDFT(tree);

  //     expect(leafNodes).toEqual([
  //       tree.tags.inherent.company_description.martech,
  //       tree.tags.inherent.company_description.adtech,
  //     ]);
  //   });

  test("should handle deeply nested objects", () => {
    const tree = {
      level1: {
        level2: {
          level3: {
            level4: {},
          },
        },
      },
    };

    typeOf.mockReturnValue("Object");

    const leafNodes = getLeafNodesCascadingDFT(tree);

    expect(leafNodes).toEqual([tree.level1.level2.level3.level4]);
  });

  test("should handle a leaf node with an array value", () => {
    const tree = {
      tags: {
        inherent: {
          company_description: {
            martech: [],
          },
        },
      },
    };

    typeOf.mockReturnValue("Object");

    const leafNodes = getLeafNodesCascadingDFT(tree);

    expect(leafNodes).toEqual([tree.tags.inherent.company_description.martech]);
  });

  // makes Jest crash, but passed test
  //   test("should handle a leaf node with a string value", () => {
  //     const tree = {
  //       tags: {
  //         inherent: {
  //           company_description: {
  //             martech: "leafNode",
  //           },
  //         },
  //       },
  //     };

  //     typeOf.mockReturnValue("Object");

  //     const leafNodes = getLeafNodesCascadingDFT(tree);

  //     expect(leafNodes).toEqual([tree.tags.inherent.company_description.martech]);
  //   });

  test("should throw TypeError if root_node is not an object", () => {
    const tree = "invalid";
    typeOf.mockReturnValue("String");
    expect(() => getLeafNodesCascadingDFT(tree)).toThrow(TypeError);
  });
});
