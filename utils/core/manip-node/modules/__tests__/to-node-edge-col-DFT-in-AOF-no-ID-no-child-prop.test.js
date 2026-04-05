import { toNodeEdgeColDFTinAOFnoID } from "../to-node-edge-collections.js";
import { typeOf } from "../../../type-of.js";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

jest.mock("../../../type-of.js");

/* doesn't run */

// describe("toNodeEdgeColDFTinAOFnoID", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should return nodes and edges for a single-child tree", () => {
//     const tree = {
//       tags: {
//         inherent: {
//           company_description: {
//             martech: {},
//           },
//         },
//       },
//     };

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [
//         { id: "tags", data: tree.tags },
//         { id: "inherent", data: tree.tags.inherent },
//         {
//           id: "company_description",
//           data: tree.tags.inherent.company_description,
//         },
//         { id: "martech", data: tree.tags.inherent.company_description.martech },
//       ],
//       edges: [
//         { from: "tags", to: "inherent" },
//         { from: "inherent", to: "company_description" },
//         { from: "company_description", to: "martech" },
//       ],
//     });
//   });

//   test("should return the root node if it is a leaf node", () => {
//     const tree = { martech: {} };

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [{ id: "martech", data: tree.martech }],
//       edges: [],
//     });
//   });

//   test("should handle an empty object as a root node", () => {
//     const tree = {};

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [{ id: "", data: tree }],
//       edges: [],
//     });
//   });

//   test("should throw TypeError for invalid root_node type", () => {
//     const tree = "invalid";

//     typeOf.mockReturnValue("String");

//     expect(() => toNodeEdgeColDFTinAOFnoID(tree)).toThrow(TypeError);
//   });

//   test("should handle a tree with more than one child", () => {
//     const tree = {
//       tags: {
//         inherent: {
//           company_description: {
//             martech: {},
//             adtech: {},
//           },
//         },
//       },
//     };

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [
//         { id: "tags", data: tree.tags },
//         { id: "inherent", data: tree.tags.inherent },
//         {
//           id: "company_description",
//           data: tree.tags.inherent.company_description,
//         },
//         { id: "martech", data: tree.tags.inherent.company_description.martech },
//         { id: "adtech", data: tree.tags.inherent.company_description.adtech },
//       ],
//       edges: [
//         { from: "tags", to: "inherent" },
//         { from: "inherent", to: "company_description" },
//         { from: "company_description", to: "martech" },
//         { from: "company_description", to: "adtech" },
//       ],
//     });
//   });

//   test("should handle deeply nested objects", () => {
//     const tree = {
//       level1: {
//         level2: {
//           level3: {
//             level4: {},
//           },
//         },
//       },
//     };

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [
//         { id: "level1", data: tree.level1 },
//         { id: "level2", data: tree.level1.level2 },
//         { id: "level3", data: tree.level1.level2.level3 },
//         { id: "level4", data: tree.level1.level2.level3.level4 },
//       ],
//       edges: [
//         { from: "level1", to: "level2" },
//         { from: "level2", to: "level3" },
//         { from: "level3", to: "level4" },
//       ],
//     });
//   });

//   test("should handle a leaf node with an array value", () => {
//     const tree = {
//       tags: {
//         inherent: {
//           company_description: {
//             martech: [],
//           },
//         },
//       },
//     };

//     typeOf.mockReturnValue("Object");

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [
//         { id: "tags", data: tree.tags },
//         { id: "inherent", data: tree.tags.inherent },
//         {
//           id: "company_description",
//           data: tree.tags.inherent.company_description,
//         },
//         { id: "martech", data: tree.tags.inherent.company_description.martech },
//       ],
//       edges: [
//         { from: "tags", to: "inherent" },
//         { from: "inherent", to: "company_description" },
//         { from: "company_description", to: "martech" },
//       ],
//     });
//   });

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

//     const result = toNodeEdgeColDFTinAOFnoID(tree);

//     expect(result).toEqual({
//       nodes: [
//         { id: "tags", data: tree.tags },
//         { id: "inherent", data: tree.tags.inherent },
//         {
//           id: "company_description",
//           data: tree.tags.inherent.company_description,
//         },
//         { id: "martech", data: tree.tags.inherent.company_description.martech },
//       ],
//       edges: [
//         { from: "tags", to: "inherent" },
//         { from: "inherent", to: "company_description" },
//         { from: "company_description", to: "martech" },
//       ],
//     });
//   });
// });
