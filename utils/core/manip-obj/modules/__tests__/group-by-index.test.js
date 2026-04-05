// import { groupByIndex, groupByIndexHelper } from "../group-by-index.js";
// import { isEmptyObj } from "../../../check/modules/is-empty-obj.js";
// import { isEmptyArr } from "../../../check/modules/is-empty-arr.js";
// import { isKeyedObject } from "../../../check/modules/is-keyed-obj.js";
// import { typeOf } from "../../../type-of.js";
// import { describe, test, expect, jest, beforeEach } from "@jest/globals";
// import { isEmptyObj } from "../../../check/index.js";

// jest.mock("../../../utils/check/index.js");
// jest.mock("../../../utils/type-of.js");

// describe("groupByIndex", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should throw TypeError for invalid inputs", () => {
//     typeOf.mockReturnValueOnce("String");
//     expect(() => groupByIndex("invalid", [/pattern/])).toThrow(TypeError);

//     typeOf.mockReturnValueOnce("Object");
//     expect(() => groupByIndex({}, "invalid")).toThrow(TypeError);
//   });

//   test("should return the same object if obj is empty or patterns is empty", () => {
//     typeOf.mockReturnValue("Object");
//     check.isEmptyObj.mockReturnValueOnce(true);
//     expect(groupByIndex({}, [/pattern/])).toEqual({});

//     check.isEmptyObj.mockReturnValueOnce(false);
//     check.isEmptyArr.mockReturnValueOnce(true);
//     expect(groupByIndex({ key: "value" }, [])).toEqual({ key: "value" });
//   });

//   test("should group properties by index", () => {
//     typeOf.mockReturnValue("Object");
//     check.isEmptyObj.mockReturnValue(false);
//     check.isEmptyArr.mockReturnValue(false);
//     check.isKeyedObject.mockReturnValue(true);

//     const obj = {
//       group1_index1_prop1: "value1",
//       group1_index1_prop2: "value2",
//       group2_index2_prop1: "value3",
//     };
//     const patterns = [
//       /^(?<category_name>group\d+)_(?<index>index\d+)_(?<property_name>prop\d+)$/,
//     ];
//     const expected = {
//       group1: {
//         index1: {
//           prop1: "value1",
//           prop2: "value2",
//         },
//       },
//       group2: {
//         index2: {
//           prop1: "value3",
//         },
//       },
//     };

//     expect(groupByIndex(obj, patterns)).toEqual(expected);
//   });

//   test("should handle nested objects", () => {
//     typeOf.mockReturnValue("Object");
//     check.isEmptyObj.mockReturnValue(false);
//     check.isEmptyArr.mockReturnValue(false);
//     check.isKeyedObject.mockReturnValue(true);

//     const obj = {
//       group1_index1_prop1: "value1",
//       group1_index1_prop2: "value2",
//       nested: [
//         {
//           group2_index2_prop1: "value3",
//         },
//       ],
//     };
//     const patterns = [
//       /^(?<category_name>group\d+)_(?<index>index\d+)_(?<property_name>prop\d+)$/,
//     ];
//     const expected = {
//       group1: {
//         index1: {
//           prop1: "value1",
//           prop2: "value2",
//         },
//       },
//       nested: [
//         {
//           group2: {
//             index2: {
//               prop1: "value3",
//             },
//           },
//         },
//       ],
//     };

//     expect(groupByIndex(obj, patterns)).toEqual(expected);
//   });
// });

describe("groupByIndexHelper", () => {
  test("should throw TypeError for invalid object input", () => {
    expect(() => groupByIndexHelper(null, [/pattern/])).toThrow(TypeError);
    expect(() => groupByIndexHelper([], [/pattern/])).toThrow(TypeError);
    expect(() => groupByIndexHelper("string", [/pattern/])).toThrow(TypeError);
  });

  test("should throw TypeError for invalid patterns input", () => {
    expect(() => groupByIndexHelper({}, null)).toThrow(TypeError);
    expect(() => groupByIndexHelper({}, "string")).toThrow(TypeError);
    expect(() => groupByIndexHelper({}, {})).toThrow(TypeError);
  });

  test("should return the original object if it is empty", () => {
    const obj = {};
    const patterns = [/pattern/];
    expect(groupByIndexHelper(obj, patterns)).toEqual(obj);
  });

  test("should return the original object if patterns array is empty", () => {
    const obj = { key1: "value1" };
    const patterns = [];
    expect(groupByIndexHelper(obj, patterns)).toEqual(obj);
  });

  test("should group properties by index", () => {
    const obj = {
      category1_index1_property1: "value1",
      category1_index1_property2: "value2",
      category2_index2_property1: "value3",
    };
    const patterns = [
      /^(?<category_name>category\d+)_(?<index>index\d+)_(?<property_name>property\d+)$/,
    ];
    const expected = {
      0: {
        category_name: "category1",
        index: "index1",
        property_name: "property1",
        val: "value1",
      },
      1: {
        category_name: "category1",
        index: "index1",
        property_name: "property2",
        val: "value2",
      },
      2: {
        category_name: "category2",
        index: "index2",
        property_name: "property1",
        val: "value3",
      },
    };
    expect(groupByIndexHelper(obj, patterns)).toEqual(expected);
  });

  test("should return the original object if no match is found", () => {
    const obj = { key1: "value1", key2: "value2" };
    const patterns = [/non_matching_pattern/];
    expect(groupByIndexHelper(obj, patterns)).toEqual(obj);
  });

  // Add more tests as needed to cover edge cases and other scenarios
});
