import { transformLeaf } from "../../../manip-obj/modules/get-leaf.js";
// import { typeOf } from "../../../type-of.js";
// import { isEmptyObj, isJsonArray } from "../../../check/index.js";
import { it, describe, expect, jest } from "@jest/globals";

describe("transformLeaf", () => {
  it("should throw TypeError for invalid inputs", () => {
    expect(() => transformLeaf(null, {}, () => {})).toThrow(TypeError);
    expect(() => transformLeaf({}, null, () => {})).toThrow(TypeError);
    expect(() => transformLeaf({}, {}, null)).toThrow(TypeError);
  });

  it("should return `undefined` for empty `node`", () => {
    const node = {};
    const mask = { key: "value" };
    const callback = jest.fn();
    expect(transformLeaf(node, mask, callback)).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should return `undefined` if `mask` keys do not match `node` keys", () => {
    const node = { key1: "value1" };
    const mask = { key2: "value2" };
    const callback = jest.fn();
    expect(transformLeaf(node, mask, callback)).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should return `undefined` if `mask` values do not match `node` values", () => {
    const node = { key: "value1" };
    const mask = { key: 123 };
    const callback = jest.fn();
    expect(transformLeaf(node, mask, callback)).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle basic case: a keyed object, matching `mask`", () => {
    const node = { key: "value" };
    const mask = { key: "value" };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node);
  });

  it("should handle basic case: a keyed object, matching `mask` with an empty primitive for value as a leaf node", () => {
    const node = {
      key1: "value1",
      key2: "value2",
    };
    const mask = {
      key1: "",
    };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node);
  });

  it("should handle basic case: a keyed object, matching `mask` with an empty array for value as a leaf node", () => {
    const node = {
      key1: [{ key2: "value2" }, { key2: "value3" }],
    };
    const mask = {
      key1: [],
    };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node);
  });

  it("should handle basic case: a keyed object, matching `mask` with an empty object value as a leaf node", () => {
    const node = {
      key1: {
        key2: "value2",
        key3: "value3",
      },
    };
    const mask = {
      key1: {},
    };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node.key1);
  });

  it("should handle nested keyed objects, matching `mask`", () => {
    const node = { nested: { key: "value" } };
    const mask = { nested: { key: "value" } };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node.nested);
  });

  it("should handle a nested keyed object, matching `mask` with an empty Array for value as a leaf node", () => {
    const srcNode = {
      name: "John",
      age: 25,
      address: {
        city: ["New York", "Dallas"],
        country: "USA",
      },
    };
    const maskNode = {
      name: "string",
      address: {
        city: [],
      },
    };
    const callback = jest.fn();
    transformLeaf(srcNode, maskNode, callback);
    expect(callback).toHaveBeenCalledWith(srcNode.address);
  });

  it("should handle nested arrays of keyed objects, matching `mask` with a keyed object of primitive for value as a leaf node", () => {
    const node = { nested: [{ key: "value" }] };
    const mask = { nested: [{ key: "value" }] };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node.nested[0]);
  });

  it("should handle a keyed object, matching `mask` with a nested array of keyed objects with an identical key as a leaf node", () => {
    const node = {
      key1: [{ key2: "value2" }, { key2: "value3" }],
    };
    const mask = {
      key1: [{ key2: "" }],
    };
    const callback = jest.fn();
    transformLeaf(node, mask, callback);
    expect(callback).toHaveBeenCalledWith(node.key1[0]);
    expect(callback).toHaveBeenCalledWith(node.key1[1]);
  });

  it("should handle nested arrays of keyed objects, matching `mask` with an array of primitive for value as a leaf node2", () => {
    const srcNode = {
      name: "John",
      age: 25,
      children: [
        {
          Alice: {
            address: {
              city: "New York",
              country: "USA",
            },
          },
        },
        {
          Kevin: {
            address: {
              city: "Sydney",
              country: "AU",
            },
            skills: ["JavaScript", "React", "Node.js"],
          },
        },
        {
          Kevin: {
            address: {
              city: "Melbourne",
              country: "USA",
            },
            skills: ["Docker", "Angular", "CSS"],
          },
        },
      ],
    };
    const maskNode = {
      name: "string",
      children: [
        {
          Kevin: {
            skills: ["string"],
          },
        },
      ],
    };
    const callback = jest.fn();
    transformLeaf(srcNode, maskNode, callback);
    expect(callback).toHaveBeenCalledWith(srcNode.children[1].Kevin);
    expect(callback).toHaveBeenCalledWith(srcNode.children[2].Kevin);
  });

  it("should handle a nested keyed object, matching `mask` with a primitive for value as a leaf node", () => {
    const srcNode = {
      name: "John",
      age: 25,
      address: {
        city: "Manhattan",
        country: "USA",
      },
    };
    const maskNode = {
      name: "string",
      address: {
        city: "string",
      },
    };
    const callback = jest.fn();
    transformLeaf(srcNode, maskNode, callback);
    expect(callback).toHaveBeenCalledWith(srcNode.address);
  });

  it("should handle array of objects, matching `mask` with a primitive for value as a leaf node", () => {
    const srcNode = [
      { name: "Bob", age: "40" },
      { name: "John", age: 25 },
      { name: "Jane", age: 30 },
    ];
    const maskNode = { age: 0 };
    const callback = jest.fn();

    srcNode.forEach((node) => transformLeaf(node, maskNode, callback));

    expect(callback).toHaveBeenCalledWith(srcNode[1]);
    expect(callback).toHaveBeenCalledWith(srcNode[2]);
  });

  it("should handle an array of keyed objects, matching `mask`", () => {
    const srcNode = [
      { name: "John", age: 25, gender: "Male" },
      { name: "Jane", age: 30, gender: "Female" },
      { name: "Bob", age: 40, gender: "Male" },
    ];
    const maskNode = { gender: "Male" };
    const callback = jest.fn();

    srcNode.forEach((node) => transformLeaf(node, maskNode, callback));

    expect(callback).toHaveBeenCalledWith(srcNode[0]);
    expect(callback).toHaveBeenCalledWith(srcNode[2]);
  });

  it("should handle an array of keyed objects, not matching `mask`", () => {
    const srcNode = [
      { name: "John", age: 25 },
      { name: "Jane", age: 30 },
      { name: "Bob", age: 40 },
    ];
    const maskNode = { gender: "Male" };
    const callback = jest.fn();

    srcNode.forEach((node) => transformLeaf(node, maskNode, callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle an array of keyed objects with nested keyed objects, matching `mask` with a primitive for value as a leaf node", () => {
    const srcNode = [
      { name: "Bob", age: 40, address: { city: 40 } },
      { name: "John", age: 25, address: { city: "New York" } },
      { name: "Jane", age: 30, address: { city: "Los Angeles" } },
    ];
    const maskNode = { address: { city: "string" } };
    const callback = jest.fn();

    srcNode.forEach((node) => transformLeaf(node, maskNode, callback));

    expect(callback).toHaveBeenCalledWith(srcNode[1].address);
    expect(callback).toHaveBeenCalledWith(srcNode[2].address);
  });
});
