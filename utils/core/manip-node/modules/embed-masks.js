import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { getLeafNodesDFT } from "./get-leaf-nodes.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Append the extension mask to the leaf nodes of the root mask.
 * @param {Object} root_mask - The root mask object to be modified.
 * @param {Object} extension_mask - The extension mask object to be embedded into the leaf nodes of the root mask.
 * @returns {Object} A new object with the extension mask embedded into the leaf nodes of the root mask.
 */
export function embedMasksCascading(root_mask, extension_mask) {
  param_validator.validateKeyedObj(root_mask);
  param_validator.validateKeyedObj(extension_mask);

  if (isEmptyObj(extension_mask)) {
    return root_mask;
  }

  const root_mask_copy = structuredClone(root_mask); // creates a deep copy

  // embed the extension mask at the tail end of `root_mask`
  const leaf_nodes = getLeafNodesDFT(root_mask_copy);
  for (const node of leaf_nodes) {
    Object.assign(node, extension_mask);
  }
  return root_mask_copy;
}
