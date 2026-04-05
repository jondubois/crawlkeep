// import { isCascading } from "../is-cascading.js";
// import { ParamValidator } from "../../../classes/modules/param-validator.js";
// import { typeOf } from "../../../type-of.js";
// import { jest, describe, beforeEach, it, expect } from "@jest/globals";

// const param_validator = new ParamValidator();

// jest.mock("../../../classes/modules/param-validator.js", () => ({
//   param_validator: {
//     validateKeyedObj: jest.fn(),
//   },
// }));

// jest.mock("../../../type-of.js", () => ({
//   typeOf: jest.fn(),
// }));

// describe("isCascading", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return true for a cascading object", () => {
//     const root_node = {
//       a: { b: [] },
//       c: { d: [] },
//     };

//     param_validator.validateKeyedObj.mockImplementation(() => {});
//     typeOf.mockImplementation((val) => {
//       if (val === root_node.a || val === root_node.c) return "Object";
//       if (val === root_node.a.b || val === root_node.c.d) return "Array";
//       return typeof val;
//     });

//     const result = isCascading(root_node);
//     expect(result).toBe(true);
//     expect(param_validator.validateKeyedObj).toHaveBeenCalledWith(root_node);
//   });

//   it("should return false for a non-cascading object", () => {
//     const root_node = {
//       a: { b: 1 },
//       c: { d: [] },
//     };

//     param_validator.validateKeyedObj.mockImplementation(() => {});
//     typeOf.mockImplementation((val) => {
//       if (val === root_node.a || val === root_node.c) return "Object";
//       if (val === root_node.a.b) return "Number";
//       if (val === root_node.c.d) return "Array";
//       return typeof val;
//     });

//     const result = isCascading(root_node);
//     expect(result).toBe(false);
//     expect(param_validator.validateKeyedObj).toHaveBeenCalledWith(root_node);
//   });

//   it("should handle an empty object", () => {
//     const root_node = {};

//     param_validator.validateKeyedObj.mockImplementation(() => {});
//     typeOf.mockImplementation(() => "Object");

//     const result = isCascading(root_node);
//     expect(result).toBe(true);
//     expect(param_validator.validateKeyedObj).toHaveBeenCalledWith(root_node);
//   });

//   it("should handle a deeply nested cascading object", () => {
//     const root_node = {
//       a: { b: { c: { d: [] } } },
//     };

//     param_validator.validateKeyedObj.mockImplementation(() => {});
//     typeOf.mockImplementation((val) => {
//       if (
//         val === root_node.a ||
//         val === root_node.a.b ||
//         val === root_node.a.b.c
//       )
//         return "Object";
//       if (val === root_node.a.b.c.d) return "Array";
//       return typeof val;
//     });

//     const result = isCascading(root_node);
//     expect(result).toBe(true);
//     expect(param_validator.validateKeyedObj).toHaveBeenCalledWith(root_node);
//   });

//   it("should handle a non-object root_node", () => {
//     const root_node = "not an object";

//     param_validator.validateKeyedObj.mockImplementation(() => {
//       throw new Error("Invalid object");
//     });

//     expect(() => isCascading(root_node)).toThrow("Invalid object");
//     expect(param_validator.validateKeyedObj).toHaveBeenCalledWith(root_node);
//   });
// });
