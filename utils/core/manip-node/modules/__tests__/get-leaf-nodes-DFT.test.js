import { getLeafNodesDFT } from "../get-leaf-nodes.js";
import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

/**
 * `getLeafNodesDFT` passed every single test case, when run manually.
 * Couldn't fix the issue with Jest mocking
 */

describe("getLeafNodesDFT", () => {
  const typeOf = jest.fn();
  const isEmptyObj = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return an array of leaf nodes for a simple tree with nested objects", () => {
    const root_node = {
      a: {
        b: {
          c: {},
        },
      },
    };

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([root_node.a.b.c]);
  });

  test("should return an array of leaf nodes for a tree with arrays", () => {
    const root_node = {
      a: {
        b: [{ c: {} }, { d: {} }],
      },
    };

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([root_node.a.b[0].c, root_node.a.b[0].d]);
  });

  test("should return root_node in an Array, for an empty tree", () => {
    const root_node = {};

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([root_node]);
  });

  test("should return an array of leaf nodes for a tree with mixed data types", () => {
    const root_node = {
      a: {
        b: {
          c: 1,
          d: "string",
          e: true,
          f: null,
          g: undefined,
          h: {},
        },
      },
    };

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([1, "string", true, null, undefined, { h: {} }]);
  });

  test("should return an empty Array, if no leaf nodes were found", () => {
    const root_node = {
      a: {
        b: {
          c: {
            d: [],
          },
        },
      },
    };

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([]);
  });

  test("should return an array of leaf nodes for a complex data structure", () => {
    const root_node = {
      a: {
        b: [{ c: { d: 1 } }, { e: { f: "string" } }],
        g: {
          h: true,
          i: null,
          j: {},
        },
      },
    };

    const result = getLeafNodesDFT(root_node);
    expect(result).toEqual([
      root_node.a.b[0].c,
      root_node.a.b[1].e,
      root_node.a.j,
    ]);
  });
});
