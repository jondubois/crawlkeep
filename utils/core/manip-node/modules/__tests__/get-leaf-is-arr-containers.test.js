import { getLeafIsArrContainers } from "../get-leaf-is-arr-containers.js";
import { TreeParser } from "../../../../../classes/modules/hierarchical-tree-parser.jsarser.js";
import { CascadingTreeParser } from "../../../../../classes/modules/cascading-tree-parser.js";
import { NodesEdgesCollectionParser } from "../../../../../classes/modules/nodes-edges-collection-parser.js";
import { LookupProps } from "../../../../../data-miner/LI-profile-parsing-classes/base/base-entity.js";
import { jest, beforeEach, describe, test, expect } from "@jest/globals";

// Mock dependencies if necessary
jest.mock("../../../classes/modules/hierarchical-tree-parser.js");
jest.mock("../../../../../classes/modules/cascading-tree-parser.js");
jest.mock(
  "../../../../../classes/classes/modules/nodes-edges-collection-parser.js",
);
jest.mock(
  "../../../../../data-miner/LI-profile-parsing-classes/base/base-entity.js",
);

describe("getLeafIsArrContainers", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    TreeParser.mockClear();
    CascadingTreeParser.mockClear();
    NodesEdgesCollectionParser.mockClear();
    LookupProps.mockClear();
  });

  test("should throw TypeError for invalid inputs", () => {
    const invalidInputs = [
      [null, {}],
      [{}, null],
      [[], {}],
      [{}, []],
      [42, {}],
      [{}, "string"],
    ];

    invalidInputs.forEach(([target, source]) => {
      expect(() => getLeafIsArrContainers(target, source)).toThrow(TypeError);
    });
  });

  test("should return an empty array for empty objects", () => {
    const target = {};
    const source = {};

    const result = getLeafIsArrContainers(target, source);
    expect(result).toEqual([]);
  });

  test("should return correct equivalence containers for valid inputs", () => {
    const target = {
      a: {
        b: {
          c: [
            { id: 1, value: "x" },
            { id: 2, value: "y" },
          ],
        },
      },
    };
    const source = {
      a: {
        b: {
          c: [
            { id: 2, value: "y" },
            { id: 3, value: "z" },
          ],
        },
      },
    };

    const expected = [
      {
        abs_path_to_prop_segments: ["a", "b"],
        combined_prop: {
          c: [
            {
              id: 2,
              value: "y",
            },
            {
              id: 3,
              value: "z",
            },
            {
              id: 1,
              value: "x",
            },
            {
              id: 2,
              value: "y",
            },
          ],
        },
      },
    ];

    const result = getLeafIsArrContainers(target, source);
    expect(result).toEqual(expected);
  });

  test("should return correct equivalence containers for valid inputs", () => {
    const target = {
      a: {
        b: {
          c: [
            { public_id: 1, value: "x" },
            { public_id: 2, value: "y" },
          ],
        },
      },
    };
    const source = {
      a: {
        b: {
          c: [
            { public_id: 2, value: "y" },
            { public_id: 3, value: "z" },
          ],
        },
      },
    };

    const expected = [
      {
        abs_path_to_prop_segments: ["a", "b"],
        combined_prop: {
          c: [
            {
              public_id: 2,
              value: "y",
            },
            {
              public_id: 3,
              value: "z",
            },
            {
              public_id: 1,
              value: "x",
            },
          ],
        },
      },
    ];

    const result = getLeafIsArrContainers(target, source);
    expect(result).toEqual(expected);
  });
});
