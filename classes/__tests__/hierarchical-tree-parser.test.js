// import { TreeParser } from "../hierarchical-tree-parser.js";
// import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
// import { isJsonArray } from "../../check/modules/is-json-array.js";
// import { deDupArr } from "../../manip-arr/modules/dedup-arr.js";
// import { typeOf } from "../../type-of.js";
// import { jest, it, test, describe, expect, beforeEach } from "@jest/globals";

// jest.mock("../../check/modules/is-empty-obj.js");
// jest.mock("../../check/modules/is-json-array.js");
// jest.mock("../../manip-arr/modules/dedup-arr.js");
// jest.mock("../../type-of.js");

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("isContextuallyUnique", () => {
//     it("should return true if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.isContextuallyUnique()).toBe(true);
//     });

//     it("should return true if all nodes are contextually unique", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isContextuallyUnique()).toBe(true);
//     });

//     it("should return false if there are duplicate nodes in the same context", () => {
//       const rootNodeWithDuplicates = {
//         name: "root",
//         child_entries: [
//           { name: "child1", child_entries: [] },
//           { name: "child1", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(rootNodeWithDuplicates);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isContextuallyUnique()).toBe(false);
//     });

//     it("should handle nested structures correctly", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isContextuallyUnique()).toBe(true);
//     });

//     it("should return false if there are duplicate nodes in nested structures", () => {
//       const nestedRootNodeWithDuplicates = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild1", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNodeWithDuplicates);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isContextuallyUnique()).toBe(false);
//     });
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("getDuplicateNodes", () => {
//     it("should return an empty array if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.getDuplicateNodes()).toEqual([]);
//     });

//     it("should return an empty array if there are no duplicates", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       deDupArr.mockImplementation((arr) => arr);
//       expect(treeParser.getDuplicateNodes()).toEqual([]);
//     });

//     it("should return an array of duplicate nodes", () => {
//       const rootNodeWithDuplicates = {
//         name: "root",
//         child_entries: [
//           { name: "child1", child_entries: [] },
//           { name: "child1", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(rootNodeWithDuplicates);
//       isEmptyObj.mockReturnValueOnce(false);
//       deDupArr.mockImplementation((arr) => arr);
//       expect(treeParser.getDuplicateNodes()).toEqual([
//         { name: "child1", child_entries: [] },
//       ]);
//     });

//     it("should handle nested structures correctly", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       deDupArr.mockImplementation((arr) => arr);
//       expect(treeParser.getDuplicateNodes()).toEqual([]);
//     });

//     it("should return an array of duplicate nodes in nested structures", () => {
//       const nestedRootNodeWithDuplicates = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild1", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNodeWithDuplicates);
//       isEmptyObj.mockReturnValueOnce(false);
//       deDupArr.mockImplementation((arr) => arr);
//       expect(treeParser.getDuplicateNodes()).toEqual([
//         { name: "grandchild1", child_entries: [] },
//       ]);
//     });
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("isHierarchical", () => {
//     it("should return true if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.isHierarchical()).toBe(true);
//     });

//     it("should return true if the tree is hierarchical", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isHierarchical()).toBe(true);
//     });

//     it("should return false if a parent appears as a child, creating a circular reference", () => {
//       const rootNodeWithCircularReference = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "root", child_entries: [] }, // Circular reference
//             ],
//           },
//         ],
//       };
//       treeParser.setStateTo(rootNodeWithCircularReference);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isHierarchical()).toBe(false);
//     });

//     it("should handle nested structures correctly", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isHierarchical()).toBe(true);
//     });

//     it("should return false if there are duplicate nodes in nested structures", () => {
//       const nestedRootNodeWithDuplicates = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild1", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNodeWithDuplicates);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.isHierarchical()).toBe(true);
//     });
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("getAbnormalParents", () => {
//     it("should return an empty array if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.getAbnormalParents()).toEqual([]);
//     });

//     it("should return an empty array if there are no abnormal parents", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.getAbnormalParents()).toEqual([]);
//     });

//     it("should return an array of abnormal parents if a parent appears as a child", () => {
//       const rootNodeWithAbnormalParents = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "root", child_entries: [] }, // Abnormal parent
//             ],
//           },
//         ],
//       };
//       treeParser.setStateTo(rootNodeWithAbnormalParents);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.getAbnormalParents()).toEqual([
//         { name: "root", child_entries: [] },
//       ]);
//     });

//     it("should handle nested structures correctly", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.getAbnormalParents()).toEqual([]);
//     });

//     it("should return an array of abnormal parents in nested structures", () => {
//       const nestedRootNodeWithAbnormalParents = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "root", child_entries: [] }, // Abnormal parent
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNodeWithAbnormalParents);
//       isEmptyObj.mockReturnValueOnce(false);
//       expect(treeParser.getAbnormalParents()).toEqual([
//         { name: "root", child_entries: [] },
//       ]);
//     });
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("toFlatStructure", () => {
//     it("should return an empty array if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.toFlatStructure()).toEqual([]);
//     });

//     it("should return a flattened structure of the tree", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       const expectedFlattenedTree = [
//         {
//           name: "root",
//           child_entries: [
//             { name: "child1", child_entries: [] },
//             { name: "child2", child_entries: [] },
//           ],
//         },
//         { name: "child1", child_entries: [] },
//         { name: "child2", child_entries: [] },
//       ];
//       expect(treeParser.toFlatStructure()).toEqual(expectedFlattenedTree);
//     });

//     it("should handle nested structures correctly", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       const expectedFlattenedTree = [
//         {
//           name: "root",
//           child_entries: [
//             {
//               name: "child1",
//               child_entries: [
//                 { name: "grandchild1", child_entries: [] },
//                 { name: "grandchild2", child_entries: [] },
//               ],
//             },
//             { name: "child2", child_entries: [] },
//           ],
//         },
//         {
//           name: "child1",
//           child_entries: [
//             { name: "grandchild1", child_entries: [] },
//             { name: "grandchild2", child_entries: [] },
//           ],
//         },
//         { name: "grandchild1", child_entries: [] },
//         { name: "grandchild2", child_entries: [] },
//         { name: "child2", child_entries: [] },
//       ];
//       expect(treeParser.toFlatStructure()).toEqual(expectedFlattenedTree);
//     });

//     it("should handle trees with multiple levels of nesting", () => {
//       const deeplyNestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               {
//                 name: "grandchild1",
//                 child_entries: [
//                   { name: "greatGrandchild1", child_entries: [] },
//                 ],
//               },
//             ],
//           },
//         ],
//       };
//       treeParser.setStateTo(deeplyNestedRootNode);
//       isEmptyObj.mockReturnValueOnce(false);
//       const expectedFlattenedTree = [
//         {
//           name: "root",
//           child_entries: [
//             {
//               name: "child1",
//               child_entries: [
//                 {
//                   name: "grandchild1",
//                   child_entries: [
//                     { name: "greatGrandchild1", child_entries: [] },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           name: "child1",
//           child_entries: [
//             {
//               name: "grandchild1",
//               child_entries: [{ name: "greatGrandchild1", child_entries: [] }],
//             },
//           ],
//         },
//         {
//           name: "grandchild1",
//           child_entries: [{ name: "greatGrandchild1", child_entries: [] }],
//         },
//         { name: "greatGrandchild1", child_entries: [] },
//       ];
//       expect(treeParser.toFlatStructure()).toEqual(expectedFlattenedTree);
//     });
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   let treeParser;
//   const rootNode = {
//     name: "root",
//     child_entries: [
//       { name: "child1", child_entries: [] },
//       { name: "child2", child_entries: [] },
//     ],
//   };

//   beforeEach(() => {
//     treeParser = new TreeParser(rootNode);
//     jest.clearAllMocks();
//   });

//   describe("getTreeHeight", () => {
//     it("should return 0 if root_node is empty", () => {
//       isEmptyObj.mockReturnValueOnce(true);
//       expect(treeParser.getTreeHeight()).toBe(0);
//     });

//     it("should return the correct height for a simple tree", () => {
//       isEmptyObj.mockReturnValueOnce(false);
//       isJsonArray.mockReturnValue(true);
//       typeOf.mockReturnValue("Object");
//       expect(treeParser.getTreeHeight()).toBe(1);
//     });

//     it("should return the correct height for a nested tree", () => {
//       const nestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               { name: "grandchild1", child_entries: [] },
//               { name: "grandchild2", child_entries: [] },
//             ],
//           },
//           { name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(nestedRootNode);
//       isEmptyObj.mockReturnValue(false);
//       isJsonArray.mockReturnValue(true);
//       typeOf.mockReturnValue("Object");
//       expect(treeParser.getTreeHeight()).toBe(2);
//     });

//     it("should return the correct height for a deeply nested tree", () => {
//       const deeplyNestedRootNode = {
//         name: "root",
//         child_entries: [
//           {
//             name: "child1",
//             child_entries: [
//               {
//                 name: "grandchild1",
//                 child_entries: [
//                   { name: "greatGrandchild1", child_entries: [] },
//                 ],
//               },
//             ],
//           },
//         ],
//       };
//       treeParser.setStateTo(deeplyNestedRootNode);
//       isEmptyObj.mockReturnValue(false);
//       isJsonArray.mockReturnValue(true);
//       typeOf.mockReturnValue("Object");
//       expect(treeParser.getTreeHeight()).toBe(3);
//     });

//     it(`should handle nodes with a "child_entries" property of type Object`, () => {
//       const rootNodeWithNonArrayChild = {
//         name: "root",
//         child_entries: {
//           name: "child1",
//           child_entries: [],
//         },
//       };
//       treeParser.setStateTo(rootNodeWithNonArrayChild);
//       isEmptyObj.mockReturnValue(false);
//       isJsonArray.mockReturnValue(false);
//       typeOf.mockReturnValue("Object");
//       expect(treeParser.getTreeHeight()).toBe(1);
//     });
//   });
// });

/***************************************************************************************/

// failed
// describe("TreeParser.getLeafNodes", () => {
//   let treeParser;

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should return an empty array when root_node is null", () => {
//     treeParser = new TreeParser(null);
//     expect(treeParser.getLeafNodes()).toEqual([]);
//   });

//   test("should return an empty array when root_node is an empty object", () => {
//     treeParser = new TreeParser({});
//     isEmptyObj.mockReturnValueOnce(true);
//     expect(treeParser.getLeafNodes()).toEqual([]);
//   });

//   test("should return the root node when it has no children", () => {
//     const rootNode = { name: "root" };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj.mockReturnValueOnce(true);
//     expect(treeParser.getLeafNodes()).toEqual([rootNode]);
//   });

//   test("should return all leaf nodes in a tree with multiple levels", () => {
//     const rootNode = {
//       name: "root",
//       child_entries: [
//         { name: "child1", child_entries: [{ name: "grandchild1" }] },
//         { name: "child2" },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([
//       { name: "grandchild1" },
//       { name: "child2" },
//     ]);
//   });

//   test("should handle nodes with mixed types of children", () => {
//     const rootNode = {
//       name: "root",
//       child_entries: [
//         { name: "child1", child_entries: [{ name: "grandchild1" }] },
//         { name: "child2", child_entries: { name: "grandchild2" } },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true)
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([
//       { name: "grandchild1" },
//       { name: "grandchild2" },
//     ]);
//   });

//   test("should handle deeply nested structures", () => {
//     const rootNode = {
//       name: "root",
//       child_entries: [
//         {
//           name: "child1",
//           child_entries: [
//             {
//               name: "grandchild1",
//               child_entries: [{ name: "greatgrandchild1" }],
//             },
//           ],
//         },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([{ name: "greatgrandchild1" }]);
//   });

//   test("should handle nodes with no child_entries property", () => {
//     const rootNode = {
//       name: "root",
//       children: [
//         { name: "child1", children: [{ name: "grandchild1" }] },
//         { name: "child2" },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([
//       { name: "grandchild1" },
//       { name: "child2" },
//     ]);
//   });

//   test("should handle nodes with circular references", () => {
//     const rootNode = { name: "root" };
//     rootNode.child_entries = [rootNode]; // Circular reference
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj.mockReturnValueOnce(false).mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([rootNode]);
//   });

//   // New test case: deeply nested object
//   test("should handle deeply nested objects", () => {
//     const rootNode = {
//       name: "root",
//       child_entries: [
//         {
//           name: "child1",
//           child_entries: [
//             {
//               name: "grandchild1",
//               child_entries: [
//                 {
//                   name: "greatgrandchild1",
//                   child_entries: [{ name: "greatgreatgrandchild1" }],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([
//       { name: "greatgreatgrandchild1" },
//     ]);
//   });

//   // New test case: nested object with a combination of array of objects and objects as value
//   test("should handle nested objects with a combination of array of objects and objects as value", () => {
//     const rootNode = {
//       name: "root",
//       child_entries: [
//         {
//           name: "child1",
//           child_entries: [
//             { name: "grandchild1" },
//             {
//               name: "grandchild2",
//               child_entries: [{ name: "greatgrandchild1" }],
//             },
//           ],
//         },
//         {
//           name: "child2",
//           child_entries: { name: "grandchild3" },
//         },
//       ],
//     };
//     treeParser = new TreeParser(rootNode);
//     isEmptyObj
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(false)
//       .mockReturnValueOnce(true)
//       .mockReturnValueOnce(true);
//     isJsonArray.mockReturnValue(true);
//     expect(treeParser.getLeafNodes()).toEqual([
//       { name: "grandchild1" },
//       { name: "greatgrandchild1" },
//       { name: "grandchild3" },
//     ]);
//   });
// });

/***************************************************************************************/

// describe("TreeParser", () => {
//   describe("toNodeEdgeColBFTinAOFwID
//     let treeParser;
//     const rootNode = {
//       id: 1,
//       name: "root",
//       child_entries: [
//         { id: 2, name: "child1", child_entries: [] },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//     };

//     beforeEach(() => {
//       treeParser = TreeParser.getInstance(rootNode);
//       treeParser.setStateTo(rootNode);
//     });

//     it("should return correct nodes and edges for a simple tree", () => {
//       const result = treeParser.toNodeEdgeColBFTinAOFwID
//       expect(result).toEqual({
//         nodes: [
//           {
//             id: 1,
//             name: "root",
//             child_entries: [
//               { id: 2, name: "child1", child_entries: [] },
//               { id: 3, name: "child2", child_entries: [] },
//             ],
//           },
//           { id: 2, name: "child1", child_entries: [] },
//           { id: 3, name: "child2", child_entries: [] },
//         ],
//         edges: [
//           { from: 1, to: 2 },
//           { from: 1, to: 3 },
//         ],
//       });
//     });

//     it("should return correct nodes and edges for a more complex tree", () => {
//       const complexRootNode = {
//         id: 1,
//         name: "root",
//         child_entries: [
//           {
//             id: 2,
//             name: "child1",
//             child_entries: [{ id: 4, name: "grandchild1", child_entries: [] }],
//           },
//           { id: 3, name: "child2", child_entries: [] },
//         ],
//       };
//       treeParser.setStateTo(complexRootNode);
//       const result = treeParser.toNodeEdgeColBFTinAOFwID();
//       expect(result).toEqual({
//         nodes: [
//           {
//             id: 1,
//             name: "root",
//             child_entries: [
//               {
//                 id: 2,
//                 name: "child1",
//                 child_entries: [
//                   { id: 4, name: "grandchild1", child_entries: [] },
//                 ],
//               },
//               { id: 3, name: "child2", child_entries: [] },
//             ],
//           },
//           {
//             id: 2,
//             name: "child1",
//             child_entries: [{ id: 4, name: "grandchild1", child_entries: [] }],
//           },
//           { id: 3, name: "child2", child_entries: [] },
//           { id: 4, name: "grandchild1", child_entries: [] },
//         ],
//         edges: [
//           { from: 1, to: 2 },
//           { from: 1, to: 3 },
//           { from: 2, to: 4 },
//         ],
//       });
//     });

//     it("should handle an empty tree", () => {
//       treeParser.setStateTo({ id: null });
//       const result = treeParser.toNodeEdgeColBFTinAOFwID();
//       expect(result).toEqual({ nodes: [], edges: [] });
//     });

//     it("should handle a tree with only the root node", () => {
//       const singleRootNode = { id: 1, name: "root", child_entries: [] };
//       treeParser.setStateTo(singleRootNode);
//       const result = treeParser.toNodeEdgeColBFTinAOFwID();
//       expect(result).toEqual({
//         nodes: [{ id: 1, name: "root", child_entries: [] }],
//         edges: [],
//       });
//     });
//   });
// });

/***************************************************************************************/

// only failed: should handle nested objects with a combination of array of objects and objects as value
// describe("TreeParser.toNodeEdgeColBFTinAOFwID", () => {
//   // it("should return empty nodes and edges if the tree is empty", () => {
//   //   const treeParser = new TreeParser({ id: 1, child_entries: [] });
//   //   const result = treeParser.toNodeEdgeColBFTinAOFwID();
//   //   expect(result).toEqual({ nodes: [], edges: [] });
//   // });

//   it("should throw a TypeError if the root node is not an object with an id property", () => {
//     const invalidRootNode = { name: "root" };
//     const treeParser = new TreeParser(invalidRootNode);
//     expect(() => treeParser.toNodeEdgeColBFTinAOFwID()).toThrow(TypeError);
//   });

//   it("should return nodes and edges for a valid tree structure", () => {
//     const rootNode = {
//       id: 1,
//       name: "root",
//       child_entries: [
//         { id: 2, name: "child1", child_entries: [] },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//     };
//     const treeParser = new TreeParser(rootNode);
//     const result = treeParser.toNodeEdgeColBFTinAOFwID();
//     expect(result).toEqual({
//       nodes: [
//         { id: 1, name: "root", child_entries: rootNode.child_entries },
//         { id: 2, name: "child1", child_entries: [] },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//       edges: [
//         { from: 1, to: 2 },
//         { from: 1, to: 3 },
//       ],
//     });
//   });

//   it("should handle trees with nested children", () => {
//     const rootNode = {
//       id: 1,
//       name: "root",
//       child_entries: [
//         {
//           id: 2,
//           name: "child1",
//           child_entries: [{ id: 4, name: "grandchild1", child_entries: [] }],
//         },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//     };
//     const treeParser = new TreeParser(rootNode);
//     const result = treeParser.toNodeEdgeColBFTinAOFwID();
//     expect(result).toEqual({
//       nodes: [
//         { id: 1, name: "root", child_entries: rootNode.child_entries },
//         {
//           id: 2,
//           name: "child1",
//           child_entries: rootNode.child_entries[0].child_entries,
//         },
//         { id: 3, name: "child2", child_entries: [] },
//         { id: 4, name: "grandchild1", child_entries: [] },
//       ],
//       edges: [
//         { from: 1, to: 2 },
//         { from: 1, to: 3 },
//         { from: 2, to: 4 },
//       ],
//     });
//   });

//   it("should handle nested objects with a combination of array of objects and objects as value", () => {
//     const rootNode = {
//       id: 1,
//       name: "root",
//       child_entries: [
//         {
//           id: 2,
//           name: "child1",
//           child_entries: [
//             { id: 4, name: "grandchild1", child_entries: [] },
//             { id: 5, name: "grandchild2", child_entries: [] },
//           ],
//         },
//         {
//           id: 3,
//           name: "child2",
//           child_entries: {
//             id: 6,
//             name: "grandchild3",
//             child_entries: [],
//           },
//         },
//       ],
//     };
//     const treeParser = new TreeParser(rootNode);
//     const result = treeParser.toNodeEdgeColBFTinAOFwID();
//     expect(result).toEqual({
//       nodes: [
//         { id: 1, name: "root", child_entries: rootNode.child_entries },
//         {
//           id: 2,
//           name: "child1",
//           child_entries: rootNode.child_entries[0].child_entries,
//         },
//         {
//           id: 3,
//           name: "child2",
//           child_entries: rootNode.child_entries[1].child_entries,
//         },
//         { id: 4, name: "grandchild1", child_entries: [] },
//         { id: 5, name: "grandchild2", child_entries: [] },
//         { id: 6, name: "grandchild3", child_entries: [] },
//       ],
//       edges: [
//         { from: 1, to: 2 },
//         { from: 1, to: 3 },
//         { from: 2, to: 4 },
//         { from: 2, to: 5 },
//         { from: 3, to: 6 },
//       ],
//     });
//   });
// });

/***************************************************************************************/
// passed
// describe("TreeParser.toNodeTreeBy", () => {
//   let treeParser;

//   beforeEach(() => {
//     treeParser = new TreeParser({ id: 1 });
//   });

//   test("should throw TypeError for invalid inputs", () => {
//     expect(() => {
//       treeParser.toNodeTreeBy(null, null);
//     }).toThrow(TypeError);

//     expect(() => {
//       treeParser.toNodeTreeBy([], null);
//     }).toThrow(TypeError);

//     expect(() => {
//       treeParser.toNodeTreeBy(null, []);
//     }).toThrow(TypeError);
//   });

//   test("should throw Error if root node is not found", () => {
//     jest.spyOn(treeParser, "getRootNode").mockReturnValue(null);

//     expect(() => {
//       treeParser.toNodeTreeBy([], []);
//     }).toThrow(Error);
//   });

//   test("should construct a valid tree", () => {
//     const nodes = [
//       { id: 1, name: "root" },
//       { id: 2, name: "child1" },
//       { id: 3, name: "child2" },
//     ];
//     const edges = [
//       { from: 1, to: 2 },
//       { from: 1, to: 3 },
//     ];

//     jest.spyOn(treeParser, "getRootNode").mockReturnValue(nodes[0]);

//     const result = treeParser.toNodeTreeBy(nodes, edges, undefined, true);

//     expect(result).toEqual({
//       id: 1,
//       name: "root",
//       child_entries: [
//         { id: 2, name: "child1", child_entries: [] },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//     });
//   });

//   test("should remove ids if is_kept_id is false", () => {
//     const nodes = [
//       { id: 1, name: "root" },
//       { id: 2, name: "child1" },
//       { id: 3, name: "child2" },
//     ];
//     const edges = [
//       { from: 1, to: 2 },
//       { from: 1, to: 3 },
//     ];

//     jest.spyOn(treeParser, "getRootNode").mockReturnValue(nodes[0]);

//     const result = treeParser.toNodeTreeBy(nodes, edges, "child_entries", false);

//     expect(result).toEqual({
//       name: "root",
//       child_entries: [
//         { name: "child1", child_entries: [] },
//         { name: "child2", child_entries: [] },
//       ],
//     });
//   });

//   test("should keep ids if is_kept_id is true", () => {
//     const nodes = [
//       { id: 1, name: "root" },
//       { id: 2, name: "child1" },
//       { id: 3, name: "child2" },
//     ];
//     const edges = [
//       { from: 1, to: 2 },
//       { from: 1, to: 3 },
//     ];

//     jest.spyOn(treeParser, "getRootNode").mockReturnValue(nodes[0]);

//     const result = treeParser.toNodeTreeBy(nodes, edges, "child_entries", true);

//     expect(result).toEqual({
//       id: 1,
//       name: "root",
//       child_entries: [
//         { id: 2, name: "child1", child_entries: [] },
//         { id: 3, name: "child2", child_entries: [] },
//       ],
//     });
//   });
// });

/***************************************************************************************/
