// local imports
import { typeOf } from "../../type-of.js";
import { intersection, union } from "../../manip-arr/modules/superpose-arr.js";
import { mergeTopLevelPropsByDepthOfNesting } from "./merge-top-lvl-props-by-depth-of-nesting.js";
import { reduceJsonArrayBy } from "../../manip-json/modules/reduce-json-array-by.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { getValAtNodeCascading } from "./get-val-at-node-cascading.js";
import { deDupArr } from "../../manip-arr/modules/dedup-arr.js";

// external imports
import {
  TreeParser,
  NodesEdgesCollectionParser,
  BooleanParser,
} from "../../../../classes/index.js";
// import { NodesEdgesCollectionParser } from "../../classes/modules/nodes-edges-collection-parser.js";
// import { BooleanParser } from "../../classes/modules/boolean-parser.js";
import param_validator from "../../../../classes/modules/param-validator.js";
import { LookupProps } from "../../../../data-miner/LI-profile-parsing-classes/base/base-entity.js"; // TODO - as a generic function, it should not rely on `DataMiner`
const bool_parser = BooleanParser.getInstance();

/**
 * @description Assigns `source` to `target`. For common keys, `source` overwrites `target`.
 * @param {Object} target - The target node tree into which the combined metadata will be planted.
 * @param {Object} source - The source node tree whose metadata will be combined to the respective metadata in `target`.
 * @return {Array<Object>} An array of equivalence containers, each with the absolute path to the property segments and the combined properties.
 *
 * @todo `LookupProps` in`LI_profile_parsing`, is tightly coupled to `DataMiner`. Pull `identifiers` out to make it a generic function.
 */
export function getLeafContainers(target, source) {
  param_validator.validateKeyedObj(target);
  param_validator.validateKeyedObj(source);

  const tree_parser = new TreeParser();
  const n_e_coll_parser = new NodesEdgesCollectionParser();
  const lookup_props = new LookupProps();
  const identifiers = deDupArr([
    ...lookup_props.person_id_keys,
    ...lookup_props.company_id_keys,
    ...lookup_props.school_id_keys,
    ...lookup_props.cert_institution_id_keys,
  ]);

  tree_parser.setStateTo(source);
  // get leaf nodes with values containing:
  // - empty keyed Object i.e. a tag
  // - Array of keyed Objects i.e. IDs of employees
  // - Array of primitive values
  const curr_n_e_coll = tree_parser.toNodeEdgeColBFTinAOFnoIDcascadingBy();
  n_e_coll_parser.setStateTo(curr_n_e_coll);
  const s_has_obj_leaves = n_e_coll_parser.getLeafNodes().filter((node) =>
    // filter only against the rest of the properties, by..
    Object.keys(node)
      .filter(
        (key) =>
          // ..ignoring the clutter introduced by the conversion to nodes & edges collection
          key !== tree_parser.node_id_key &&
          key !== tree_parser.node_name_key &&
          key !== tree_parser.child_entries_key,
      )
      .some((key) => {
        const val = node[key];
        return (
          (typeOf(val) === "Object" && isEmptyObj(val)) || Array.isArray(val)
        ); // /!\ with `typeof val !== "object"`, other data types (e.g. Date, Set, Map, etc) would pass the filter /!\
      }),
  );

  const equivalence_containers = s_has_obj_leaves.flatMap((curr_node) => {
    // trace the absolute path from root node to..
    const path = n_e_coll_parser.getPathToNodeBy(
      curr_node,
      tree_parser.node_name_key,
    );

    // clear clutter
    delete curr_node[tree_parser.node_id_key];
    delete curr_node[tree_parser.node_name_key];
    delete curr_node[tree_parser.child_entries_key];
    path.shift(); // removes segment related to root node

    // ..get the eventual respective value (expected to be an Object) in `target`
    const existing_node = getValAtNodeCascading(target, path) || {}; // /!\ to avoid circular reference, `getValAtNodeCascading` has to be a pure function /!\

    let combined_prop;
    if (typeof existing_node !== "object") {
      // overwrite existing with incoming
      combined_prop = existing_node;
    } else {
      /* for properties common to both, `curr_node` and `existing_node`, that contain an Array as value,
        de-duplicate their respective Array values ByRef, and where applicable, by IDs */
      // get common keys whose value is an Array
      const val_is_arr_curr = Object.fromEntries(
        Object.entries(curr_node).filter(([key, val]) => Array.isArray(val)),
      );
      const val_is_arr_existing = Object.fromEntries(
        Object.entries(existing_node).filter(([key, val]) =>
          Array.isArray(val),
        ),
      );
      const common_keys = intersection(
        Object.keys(val_is_arr_curr),
        Object.keys(val_is_arr_existing),
      );

      const acc = {};
      const existing_node_copy = { ...existing_node }; // a shallow copy suffices, since it's a leaf node. Hence, expected to have no degree of nesting
      const curr_node_copy = { ...curr_node };

      // for properties common to both the objects,
      // concatenate and de-duplicate the Array values
      for (const key of common_keys) {
        const uniq_arr = union(
          existing_node_copy[key] || [],
          curr_node_copy[key] || [],
        ); // in this order, as `reduceJsonArrayBy` relies on the order of the IDs
        let is_employee_arr = false;
        let is_inherent_tag_arr = false;
        if (isJsonArray(uniq_arr)) {
          is_employee_arr = uniq_arr.every((obj) =>
            identifiers.some((id_key) => id_key in obj),
          );
          is_inherent_tag_arr = uniq_arr.every(
            (obj) => bool_parser.kw_key in obj,
          );
        }
        // if array of employees identifiers, then merge by IDs
        acc[key] = is_employee_arr
          ? reduceJsonArrayBy(uniq_arr, identifiers)
          : uniq_arr;

        // if array of inherent tag containers, then merge by `bool_parser.kw_key`
        acc[key] = is_inherent_tag_arr
          ? reduceJsonArrayBy(uniq_arr, [bool_parser.kw_key])
          : uniq_arr;

        delete existing_node_copy[key];
        delete curr_node_copy[key];
      }

      // account for properties of the leaf nodes in both, `source` and `target`
      // whose values are not of type Object.
      combined_prop = mergeTopLevelPropsByDepthOfNesting(
        Object.assign(acc, existing_node_copy),
        curr_node_copy,
      ); /* in this order, as to not revert the above concatenation-merger.
           Because, where the depths of nesting is equal `mergeTopLevelPropsByDepthOfNesting` gets `curr_node` to overwrite `existing_node` */
    }
    // construct equivalence container
    return {
      abs_path_to_prop_segments: path,
      combined_prop: combined_prop,
    };
  });
  return equivalence_containers;
}

// /**
//  * @description in the `source`, gets the leaf nodes which have an
//  * Array of keyed Objects with a primitive value, or an Array of primitive values as value.
//  * Then, follows the same path, from root node to the respective node in `target`,
//  * to the corresponding leaf nodes at the tail end, and gets their value. Then, combines the two values.
//  * Finally, outputs an equivalence container.
//  *
//  * In a cascading node tree, child nodes only have one parent, and can only be Objects.
//  * A leaf node is the the terminal node at the tail end of a branch that doesn't have a child node. Hence, either:
//  * - an empty Object
//  * - a keyed Object with a primitive value, or an Array of primitive values
//  * - (exception to be culled) an Array of keyed Objects with a primitive value, or an Array of primitive values
//  *
//  * @default only merges unilaterally the leaves in `source`. Ignores those in `target`, whose key is not in `source`.
//  *
//  * @requires TreeParser, CascadingTreeParser, NodesEdgesCollectionParser, LookupProps
//  * @typedef {Object<string, CascadingNodeTree | {}} CascadingNodeTree
//  * @property {CascadingNodeTree | {}} [key] - A cascading node tree where every child node is a keyed Object or an empty Object.
//  * In a cascading node tree, child nodes only have one parent, and can only be Objects.
//  * A leaf node is the the terminal node at the tail end of a branch that doesn't have a child node. Hence, either:
//  * - an empty Object
//  * - a keyed Object with a primitive value, or an Array of primitive values
//  * - (exception to be culled) an Array of keyed Objects with a primitive value, or an Array of primitive values
//  *
//  * @param {Object} target - The target object.
//  * @param {Object} source - The source object.
//  * @returns {Map} - A map of leaf nodes and their corresponding values in the target.
//  *
//  * @todo - include identifiers for company
//  * + add early return
//  * + doesn't account for properties of the leaf nodes in both, `source` and `target` whose values are not Arrays.
//  */
// function getLeafIsArrContainers(target, source) {
//   if (typeOf(target) !== "Object" || typeOf(source) !== "Object") {
//     throw new TypeError(
//       `${getLeafIsArrContainers.name} - Invalid input. Expected:
//           - ${target} to be a keyed Object. Instead, was passed ${typeof target}
//           - ${source} to be a keyed Object. Instead, was passed ${typeof source}`,
//     );
//   }

//   const tree_parser = new TreeParser();
//   const c_tree_parser = new CascadingTreeParser();
//   const n_e_coll_parser = new NodesEdgesCollectionParser();
//   const lookup_props = new LookupProps();
//   const identifiers = lookup_props.person_id_keys; // TODO - include identifiers for company, etc.

//   // TODO - early return
//   // let check;
//   // if ((check = isEmptyObj(target)) || isEmptyObj(source)) {
//   //   return check ? source : target;
//   // }
//   tree_parser.setStateTo(source);
//   // get leaf nodes with values containing an
//   // Array of keyed Objects with a primitive value, or an Array of primitive values
//   const curr_n_e_coll = tree_parser.toNodeEdgeColBFTinAOFnoIDcascadingBy();
//   n_e_coll_parser.setStateTo(curr_n_e_coll);
//   const s_has_arr_leaves = n_e_coll_parser.getLeafNodes().filter((node) =>
//     // filter only against the rest of the properties..
//     Object.keys(node)
//       .filter(
//         (key) =>
//           // ..ignore the clutter introduced by the conversion to nodes & edges collection
//           key !== tree_parser.node_id_key &&
//           key !== tree_parser.node_name_key &&
//           key !== tree_parser.child_entries_key,
//       )
//       .some((key) => Array.isArray(node[key])),
//   );

//   const equivalence_containers = s_has_arr_leaves.flatMap((curr_node) => {
//     // trace the absolute path from root node to..
//     const path = n_e_coll_parser.getPathToNodeBy(
//       curr_node,
//       tree_parser.node_name_key,
//     );

//     // clear clutter
//     delete curr_node[tree_parser.node_id_key];
//     delete curr_node[tree_parser.node_name_key];
//     delete curr_node[tree_parser.child_entries_key];
//     path.shift(); // removes segment related to root node

//     // ..get the eventual respective value (expected to be an Object) in `target`
//     c_tree_parser.setStateTo(target);
//     const existing_node = c_tree_parser.getValAtNodeCascading(path) || {};

//     /* for properties common to both, `curr_node` and `existing_node`, that contain an Array as value,
//     de-duplicate their respective Array values ByRef, and where applicable, by IDs */
//     const acc = {};
//     const existing_node_copy = { ...existing_node }; // a shallow copy suffices, since it's a leaf node. Hence, expected to have no degree of nesting
//     const curr_node_copy = { ...curr_node };

//     // get common keys whose value is an Array
//     const val_is_arr_curr = Object.fromEntries(
//       Object.entries(curr_node).filter(([key, val]) => Array.isArray(val)),
//     );
//     const val_is_arr_existing = Object.fromEntries(
//       Object.entries(existing_node).filter(([key, val]) => Array.isArray(val)),
//     );
//     const common_keys = intersection(
//       Object.keys(val_is_arr_curr),
//       Object.keys(val_is_arr_existing),
//     );

//     // for properties common to both the objects,
//     // concatenate and deduplicate the Array values
//     for (const key of common_keys) {
//       const uniq_arr = union(
//         existing_node_copy[key] || [],
//         curr_node_copy[key] || [],
//       );
//       // if array contains employees identifiers, then merge by IDs
//       let is_employee_arr = false;
//       if (isJsonArray(uniq_arr)) {
//         is_employee_arr = uniq_arr.every((obj) =>
//           identifiers.some((id_key) => id_key in obj),
//         );
//       }
//       acc[key] = is_employee_arr
//         ? reduceJsonArrayBy(uniq_arr, identifiers)
//         : uniq_arr;

//       delete existing_node_copy[key];
//       delete curr_node_copy[key];
//     }

//     // construct equivalence container
//     return {
//       abs_path_to_prop_segments: path,
//       combined_prop: Object.assign(acc, existing_node_copy, curr_node_copy),
//     };
//   });
//   return equivalence_containers;
// }

// // const invalidInputs = [
// //   [null, {}],
// //   [{}, null],
// //   [[], {}],
// //   [{}, []],
// //   [42, {}],
// //   [{}, "string"],
// // ];
// // const output = invalidInputs.map(([target, source]) => {
// //   return getLeafIsArrContainers(target, source);
// // });
// // // usage:
// // const target = {
// //   electronics_engineering: {
// //     employee_ids: [
// //       {
// //         member_id: "123456789",
// //         public_id: "jack-90a2bb134",
// //       },
// //       {
// //         member_id: "550167130",
// //         public_id: "denil-john-90a2bb134",
// //         lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
// //       },
// //       {
// //         member_id: "123456789",
// //         public_id: "jack-90a2bb134",
// //       },
// //     ],
// //   },
// //   test: {
// //     employee_ids: [
// //       {
// //         member_id: "987654321",
// //         public_id: "test-90a2bb134",
// //         lir_niid: "AZERTYUIOP",
// //       },
// //     ],
// //   },
// //   tag_test: {
// //     depth_1: {},
// //   },
// // };
// // const source = {
// //   electronics_engineering: {
// //     employee_ids: [
// //       {
// //         member_id: "550167130",
// //         public_id: "denil-john-90a2bb134",
// //         lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
// //       },
// //       {
// //         member_id: "987654321",
// //         public_id: "kevin-smith-90a2bb134",
// //       },
// //     ],
// //     affiliated_companies: [
// //       { name: "Google", company_id: "123456789", location: "Mountain View" },
// //     ],
// //   },
// //   software: {
// //     employee_ids: [
// //       {
// //         member_id: "550167130",
// //         public_id: "denil-john-90a2bb134",
// //         lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
// //       },
// //       {
// //         member_id: "550167130",
// //         public_id: "denil-john-90a2bb134",
// //         lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk",
// //       },
// //     ],
// //   },
// //   tag_test: {
// //     depth_1: {
// //       depth_2: {},
// //     },
// //   },
// // };
// // const target = {
// //   a: {
// //     b: {
// //       c: [
// //         { public_id: 1, value: "x" },
// //         { public_id: 2, value: "y" },
// //       ],
// //     },
// //   },
// // };
// // const source = {
// //   a: {
// //     b: {
// //       c: [
// //         { public_id: 2, value: "y" },
// //         { public_id: 3, value: "z" },
// //       ],
// //     },
// //   },
// // };
// // const output = getLeafIsArrContainers(target, source);
// // debugger;

// /**
//  * @description in the `source`, gets the leaf nodes which have either a primitive, an Array of primitives or an empty Object as value.
//  * Then, follows the same path, from root node to the respective node in `target`,
//  * to the corresponding leaf nodes at the tail end, and gets their value. Then, combines the two values.
//  * Finally, outputs an equivalence container.
//  *
//  * In a cascading node tree, child nodes only have one parent, and can only be Objects.
//  * A leaf node is the the terminal node at the tail end of a branch that doesn't have a child node. Hence, either:
//  * - an empty Object
//  * - a keyed Object with a primitive value, or an Array of primitive values
//  * - (exception to be culled) an Array of keyed Objects with a primitive value, or an Array of primitive values
//  *
//  * @default only merges unilaterally the leaves in `source`. Ignores those in `target`, whose key is not in `source`.
//  *
//  * @param {Object} target - The target object.
//  * @param {Object} source - The source object.
//  * @returns {Map} - A map of leaf nodes and their corresponding values in the target.
//  */
// function getLeafIsObjContainers(target, source) {
//   if (typeOf(target) !== "Object" || typeOf(source) !== "Object") {
//     throw new TypeError(
//       `${getLeafIsObjContainers.name} - Invalid input. Expected:
//           - ${target} to be a keyed Object. Instead, was passed ${typeof target}
//           - ${source} to be a keyed Object. Instead, was passed ${typeof source}`,
//     );
//   }

//   const tree_parser = new TreeParser();
//   const c_tree_parser = new CascadingTreeParser();
//   const n_e_coll_parser = new NodesEdgesCollectionParser();

//   tree_parser.setStateTo(source);
//   // get leaf nodes with values containing:
//   // - an empty Object
//   // - a keyed Object with a primitive value, or an Array of primitive values
//   const curr_n_e_coll = tree_parser.toNodeEdgeColBFTinAOFnoIDcascadingBy();
//   n_e_coll_parser.setStateTo(curr_n_e_coll);
//   const s_has_obj_leaves = n_e_coll_parser.getLeafNodes().filter((node) =>
//     // filter only against the rest of the properties..
//     Object.keys(node)
//       .filter(
//         (key) =>
//           // ..ignore the clutter introduced by the conversion to nodes & edges collection
//           key !== tree_parser.node_id_key &&
//           key !== tree_parser.node_name_key &&
//           key !== tree_parser.child_entries_key,
//       )
//       .some((key) => {
//         const val = node[key];
//         return (
//           (typeOf(val) === "Object" && isEmptyObj(val)) ||
//           typeof val !== "object"
//         );
//       }),
//   );

//   const equivalence_containers = s_has_obj_leaves.map((curr_node) => {
//     // trace the absolute path from root node to..
//     const path = n_e_coll_parser.getPathToNodeBy(
//       curr_node,
//       tree_parser.node_name_key,
//     );

//     // clear clutter
//     delete curr_node[tree_parser.node_id_key];
//     delete curr_node[tree_parser.node_name_key];
//     delete curr_node[tree_parser.child_entries_key];
//     path.shift(); // removes segment related to root node

//     // ..get the eventual respective value (expected to be an Object) in `target`
//     c_tree_parser.setStateTo(target);
//     const existing_node = c_tree_parser.getValAtNodeCascading(path) || {};

//     // leaf nodes in `source` were reached.
//     // However, at that depth, the respective `target` node might not be a leaf or,
//     // migth have additional properties.
//     let combined_prop = mergeTopLevelPropsByDepthOfNesting(
//       existing_node,
//       curr_node,
//     ); /* in this order, as to not revert the above concatenation.
//     Because, where the depths of nesting is equal `mergeTopLevelPropsByDepthOfNesting` gets `curr_node` to overwrite `existing_node` */

//     // store in equivalence container
//     return {
//       abs_path_to_prop_segments: path,
//       combined_prop: combined_prop,
//     };
//   });
//   return equivalence_containers;
// }

// // usage:
// const target0 = {
//   tags: {
//     inherent: {
//       headline: {
//         middle_management: {},
//         javascript: {},
//       },
//     },
//     inferred: {
//       expertise_in: {
//         middle_management: {},
//       },
//     },
//   },
// };

// const target1 = {
//   added_props: {
//     inherent: {
//       total_xp_in_ms: 146966400000,
//     },
//     inferred: {
//       all_skills_characterised: {
//         middle_management: {
//           xp_in_ms: 146966400000,
//           xp_in_pc: 100,
//         },
//       },
//       software_engineering: {},
//     },
//   },
// };

// const source0 = {
//   tags: {
//     inherent: {
//       headline: {
//         software_engineering: {},
//         javascript: {
//           front_end: {
//             nodejs: {},
//           },
//         },
//       },
//     },
//     inferred: {
//       expertise_in: {
//         communication: {},
//       },
//     },
//   },
// };

// const source1 = {
//   added_props: {
//     inferred: {
//       all_skills_characterised: {
//         tutoring: {
//           xp_in_ms: 1234685498500000,
//           xp_in_pc: 40,
//         },
//         middle_management: {
//           xp_in_ms: 146966400000,
//           xp_in_pc: 100,
//           test_of_depth: {},
//         },
//       },
//     },
//   },
// };
// const output0 = getLeafIsObjContainers(target0, source0);
// const output1 = getLeafIsObjContainers(target1, source1);
// debugger;
