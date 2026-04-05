import { typeOf } from "../../../type-of.js";
import { isTaggedWith } from "../is-tagged-with.js";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");

describe("isTaggedWith", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  test("should return true if the node is tagged with the given path", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        b: {
          c: "tagged",
        },
      },
    };
    const path = ["a", "b", "c"];
    expect(isTaggedWith(node, path)).toBe(true);
  });

  test("should return false if the node is not tagged with the given path", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        b: {
          d: "not tagged",
        },
      },
    };
    const path = ["a", "b", "c"];
    expect(isTaggedWith(node, path)).toBe(false);
  });

  test("should return false if the node does not have the key at the first segment", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      x: {
        b: {
          c: "tagged",
        },
      },
    };
    const path = ["a", "b", "c"];
    expect(isTaggedWith(node, path)).toBe(false);
  });

  test("should return false if the node does not have the key at any segment", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        x: {
          c: "tagged",
        },
      },
    };
    const path = ["a", "b", "c"];
    expect(isTaggedWith(node, path)).toBe(false);
  });

  test("should return false if the path is empty", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        b: {
          c: "tagged",
        },
      },
    };
    const path = [];
    expect(isTaggedWith(node, path)).toBe(false);
  });

  test("should throw a TypeError if the first argument is not an object", () => {
    typeOf.mockReturnValue("String");

    const node = "not an object";
    const path = ["a", "b", "c"];
    expect(() => isTaggedWith(node, path)).toThrow(TypeError);
  });

  test("should throw a TypeError if the second argument is not an array", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        b: {
          c: "tagged",
        },
      },
    };
    const path = "not an array";
    expect(() => isTaggedWith(node, path)).toThrow(TypeError);
  });

  test("should throw a TypeError if the second argument is not an array of strings", () => {
    typeOf.mockReturnValue("Object");

    const node = {
      a: {
        b: {
          c: "tagged",
        },
      },
    };
    const path = ["a", "b", 123];
    expect(() => isTaggedWith(node, path)).toThrow(TypeError);
  });
});
