// import {
//   getLeafIsArrContainers,
//   getLeafIsObjContainers,
// } from "../../../../data-miner/utils/manip-node/modules/get-leaf-is-arr-containers.js";
// import { mergeTopLevelPropsByDepthOfNesting } from "../../manip-node/modules/merge-top-lvl-props-by-depth-of-nesting.js";
// import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
// import { typeOf } from "../../type-of.js";

// import {
//   CascadingTreeParser,
//   ParamValidator,
// } from "../../../../classes/index.js";

// const param_validator = new ParamValidator();
// const c_tree_parser = new CascadingTreeParser();

// /**
//  * Combines the leaf nodes of `source` and `target` node trees, into `target`.
//  * Merges the top-level properties of `source` that aren't cascading node trees, into `target`.
//  *
//  * @description first step is to merge the leaf nodes of `target` into `source` to output an array of containers.
//  * Each container has the absolute path to the property. It traverses `target` to reach the end of the the absolute path
//  * to get the respective property in `target`. Then combines the property from `source` and `target`.
//  * Just because a leaf node was reached in `source` doesn't mean it's also a leaf node in `target`.
//  * So, it merges by depth of nesting to ensure no property gets overwritten: higher depth of nesting supersedes.
//  * Finally, it plants the combined metadata into `target`.
//  *
//  * @param {Object} target - The target object into which the combined metadata will be planted.
//  * @param {Object} source - The source object which metadata will be combined to the respective metadata in `target`.
//  * @typedef {Object} NodeTree. A node is of type Object.
//  * @property {NodeTree[]} [children] - An array of child nodes.
//  * @return {NodeTree} Mutates `target` in-place by reference.
//  *
//  * @requires CascadingTreeParser
//  * @typedef {Object<string, CascadingNodeTree | {}} CascadingNodeTree
//  * @property {CascadingNodeTree | {}} [key] - A cascading node tree where every child node is a keyed Object or an empty Object.
//  *
//  * @todo update `mergeCascading` according to the method of the same name
//  */
// function mergeCascading(target, source) {
//   param_validator.validateKeyedObj(target);
//   param_validator.validateKeyedObj(source);

//   if (isEmptyObj(target) || isEmptyObj(source)) {
//     return isEmptyObj(target) ? source : target;
//   }
//   const source_clone = structuredClone(source);

//   // merge leaf nodes of `target` into `source` (higher depth of nesting supersedes)
//   const leaf_is_arr_containers = getLeafIsArrContainers(target, source);
//   const leaf_is_obj_containers = getLeafIsObjContainers(target, source);

//   // in `target`, assign combined meta to the node at tail end of the path
//   c_tree_parser.setStateTo(target);
//   [...leaf_is_arr_containers, ...leaf_is_obj_containers].forEach(
//     (container) => {
//       const { abs_path_to_prop_segments, combined_prop } = container;
//       // for the same path, properties should be merged, not overwritten
//       let existing_obj =
//         c_tree_parser.getValAtNodeCascading(abs_path_to_prop_segments) || {};

//       if (typeOf(existing_obj) !== "Object") return;

//       let merged_prop = mergeTopLevelPropsByDepthOfNesting(
//         existing_obj,
//         combined_prop,
//       );
//       c_tree_parser.setNodeValueCascading(
//         abs_path_to_prop_segments,
//         merged_prop,
//       );

//       const top_lvl_key = abs_path_to_prop_segments.at(0);
//       delete source_clone[top_lvl_key];
//     },
//   );
//   // Account for top-level properties of `source` that are not cascading node trees
//   return Object.assign(target, source_clone);
// }
// // // usage:
// // const target = { a: "test0", b: { c: 3 } };
// // const source = { a: [1, 2], b: { d: 4 }, e: { f: {} }, g: "h" };

// // // const target = { a: [1, 2], b: { c: 3, d: "test0" } };
// // // const source = { a: [3, 4], b: { e: 4, f: "test1" } };

// // // const target = { a: [1, 2], b: { c: [5, 6] } };
// // // const source = { a: [3, 4], b: { d: [7, 8] } };

// // // const target = { a: [1, 2], b: { c: [5, 6], d: "test0" } };
// // // const source = { a: [3, 4], b: { c: [7, 8], e: "test1" } };

// // // const target = { a: { b: { c: [1, 2] } } };
// // // const source = { a: { b: { d: [3, 4] } }, e: "test" };
// // mergeCascading(target, source);
// // debugger;
