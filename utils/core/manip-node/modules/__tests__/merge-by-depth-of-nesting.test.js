import { typeOf } from "../../../type-of.js";
import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../merge-top-lvl-props-by-depth-of-nesting.js";
import { jest, beforeEach, describe, test, expect } from "@jest/globals";

jest.mock("../../../check/modules/is-empty-obj.js");
jest.mock("../../../type-of.js");

describe("mergeTopLevelPropsByDepthOfNesting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw TypeError for non-object inputs", () => {
    typeOf.mockImplementation((val) => {
      if (val === null) return "null";
      if (typeof val === "object") return "Object";
      return typeof val;
    });

    expect(() => mergeTopLevelPropsByDepthOfNesting(null, {})).toThrow(
      TypeError,
    );
    expect(() => mergeTopLevelPropsByDepthOfNesting({}, null)).toThrow(
      TypeError,
    );
    expect(() => mergeTopLevelPropsByDepthOfNesting(42, {})).toThrow(TypeError);
    expect(() => mergeTopLevelPropsByDepthOfNesting({}, "string")).toThrow(
      TypeError,
    );
  });

  test("should return the non-empty object if one object is empty", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const node1 = {};
    const node2 = { a: 1 };
    expect(mergeTopLevelPropsByDepthOfNesting(node1, node2)).toEqual(node2);
    expect(mergeTopLevelPropsByDepthOfNesting(node2, node1)).toEqual(node2);
  });

  test("should merge objects based on depth of nesting", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const node1 = {
      a: { b: { c: 1 } },
      d: { e: 2 },
    };
    const node2 = {
      a: { b: { c: { d: 3 } } },
      d: { e: { f: 4 } },
    };

    const expected = {
      a: { b: { c: { d: 3 } } },
      d: { e: { f: 4 } },
    };

    expect(mergeTopLevelPropsByDepthOfNesting(node1, node2)).toEqual(expected);
  });

  test("should handle nested objects with different depths", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const node1 = {
      a: { b: { c: 1 } },
      d: { e: 2 },
    };
    const node2 = {
      a: { b: 3 },
      d: { e: { f: 4 } },
    };

    const expected = {
      a: { b: { c: 1 } },
      d: { e: { f: 4 } },
    };

    expect(mergeTopLevelPropsByDepthOfNesting(node1, node2)).toEqual(expected);
  });

  test("should merge non-common properties", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const node1 = {
      a: { b: { c: 1 } },
      g: 5,
    };
    const node2 = {
      a: { b: { c: { d: 3 } } },
      h: 6,
    };

    const expected = {
      a: { b: { c: { d: 3 } } },
      g: 5,
      h: 6,
    };

    expect(mergeTopLevelPropsByDepthOfNesting(node1, node2)).toEqual(expected);
  });

  test("should merge objects based on depth of nesting with TreeParser", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const target = {
      a: { name: "A", child_entries: [{ name: "A1" }] },
      b: { name: "B", child_entries: [{ name: "B1" }] },
    };
    const source = {
      a: {
        name: "A",
        child_entries: [{ name: "A1", child_entries: [{ name: "A1a" }] }],
      },
      c: { name: "C", child_entries: [{ name: "C1" }] },
    };

    // const treeParserInstance = TreeParser.getInstance({
    //   name: "root",
    //   child_entries: [],
    // });
    // treeParserInstance.getTreeHeight = jest.fn((node) => {
    //   if (node.name === "A") return 2;
    //   if (node.name === "B") return 1;
    //   if (node.name === "C") return 1;
    //   return 0;
    // });

    const expected = {
      a: {
        name: "A",
        child_entries: [{ name: "A1", child_entries: [{ name: "A1a" }] }],
      },
      b: { name: "B", child_entries: [{ name: "B1" }] },
      c: { name: "C", child_entries: [{ name: "C1" }] },
    };

    expect(mergeTopLevelPropsByDepthOfNesting(target, source)).toEqual(
      expected,
    );
  });

  test("should handle nested objects correctly with TreeParser", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const target = {
      a: {
        name: "A",
        child_entries: [{ name: "A1", child_entries: [{ name: "A1a" }] }],
      },
    };
    const source = {
      a: { name: "A", child_entries: [{ name: "A1" }] },
    };

    // const treeParserInstance = TreeParser.getInstance({
    //   name: "root",
    //   child_entries: [],
    // });
    // treeParserInstance.getTreeHeight = jest.fn((node) => {
    //   if (node.name === "A") return 2;
    //   if (node.name === "A1") return 1;
    //   return 0;
    // });

    const expected = {
      a: {
        name: "A",
        child_entries: [{ name: "A1", child_entries: [{ name: "A1a" }] }],
      },
    };

    expect(mergeTopLevelPropsByDepthOfNesting(target, source)).toEqual(
      expected,
    );
  });

  test("should merge objects correctly when both are empty", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const target = {};
    const source = {};
    const result = mergeTopLevelPropsByDepthOfNesting(target, source);
    expect(result).toEqual({});
  });

  test("should merge objects with different keys", () => {
    isEmptyObj.mockImplementation((obj) => Object.keys(obj).length === 0);
    typeOf.mockReturnValue("Object");

    const target = { a: 1 };
    const source = { b: 2 };
    const result = mergeTopLevelPropsByDepthOfNesting(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});
