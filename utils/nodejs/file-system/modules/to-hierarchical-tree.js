import { stat, readdir } from "fs/promises";
import path from "path";
import { existsEntry } from "../../check/exists-entry.js";
import { isEmptyObj } from "../../../core/check/modules/is-empty-obj.js";
// import { getAbsPathCwd } from "./to-abs-path.js";
// import { copyToClipboard } from "../../copy-to-clipboard.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Recursively lists the file tree of a directory and converts it to a hierarchical tree,
 * as a directed acyclic graph (DAG) which has:
 * - a single root (the initial directory),
 * - each child node have only one parent,
 * - directed edges (from directories to their contents),
 * - no cycles (a file or directory cannot be its own ancestor).
 * @param {string} dir - The absolute path to the directory.
 * @returns {Promise<JSON>} - The root node (contains the hierarchical tree structure in a JSON).
 *
 * @todo - `{ withFileTypes: true }` of `readdir()` return Dirent, whose `.isDirectory()` can be used to check if the entry is a directory.
 * @todo - `lstat()` could be used to handle symbolic links differently. Retrieves the stats of the target the symbolic link points to.
 */
// https://stackoverflow.com/questions/11194287/convert-a-directory-structure-in-the-filesystem-to-json-with-node-js
const CLOUD_STORAGE_FILES = ["desktop.ini", "thumbs.db"];
export async function toHierarchicalTree(dir) {
  param_validator.validateString(dir);

  const isExcludedFileOrDir = (filename) => {
    const lowerFilename = filename.toLowerCase();
    return (
      lowerFilename.startsWith("~$") ||
      lowerFilename.startsWith(".") ||
      CLOUD_STORAGE_FILES.includes(lowerFilename)
    );
  };

  const recurse = async (entry) => {
    if (!(await existsEntry(entry))) {
      return {};
    }

    const basename = path.basename(entry);

    if (isExcludedFileOrDir(basename)) {
      return {};
    }

    const stats = await stat(entry);

    if (!stats.isDirectory()) {
      return {
        name: basename,
        parent_name: path.dirname(entry).split(path.sep).pop(),
      };
    }

    // List child directories/files
    const files = await readdir(entry);
    const child_entries = await Promise.all(
      files.map((child) => recurse(path.join(entry, child))),
    );

    return {
      name: basename,
      parent_name: path.dirname(entry).split(path.sep).pop(),
      child_entries: child_entries.filter((child) => !isEmptyObj(child)),
    };
  };

  return recurse(dir); // Starts the recursion with the root directory
}

// // usage
// const root_node = await toHierarchicalTree(
//   getAbsPathCwd("F:/My Drive/insnare/taxo/DoNotDelete_taxo/taxonomy_14052025"),
// );
// copyToClipboard(JSON.stringify(root_node, null, 2));

/***************************************************************************************************** */

// export async function toHierarchicalTree(dir) {
//   param_validator.validateString(dir);

//   const recurse = async (entry) => {
//     if (!(await existsEntry(entry))) {
//       return {};
//     }

//     const stats = await lstat(entry);
//     if (!stats.isDirectory()) {
//       return {
//         name: path.basename(entry),
//         parent_name: path.dirname(entry).split(path.sep).pop(),
//       };
//     }

//     // list of child directories/files
//     const files = await readdir(entry);
//     const child_entries = await Promise.all(
//       files.map((child) => recurse(path.join(entry, child))),
//     );
//     return {
//       name: path.basename(entry),
//       parent_name: path.dirname(entry).split(path.sep).pop(),
//       child_entries: child_entries,
//     };
//   };
//   return recurse(dir); // starts the recursion with the root directory
// }
