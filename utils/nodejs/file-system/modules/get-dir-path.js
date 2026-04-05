import fs from "fs";
import path from "path";
const { lstat } = fs.promises;
import { existsEntry } from "../../check/exists-entry.js";

import param_validator from "../../../../classes/modules/param-validator.js";

const CLOUD_STORAGE_FILES = ["desktop.ini", "thumbs.db"];
/**
 * @description Retrieves the paths of all directories within the specified directory.
 * @param {string} dir - The path to the directory to be read.
 * @returns {Promise<string[]>} A promise that resolves to an array of directory paths.
 */
export async function getPath(dir) {
  param_validator.validateString(dir);

  try {
    const dirents = await fs.promises.readdir(dir, {
      withFileTypes: true,
      recursive: false,
    });
    const dir_paths = [];

    const isExcludedFileOrDir = (filename) => {
      const lowerFilename = filename.toLowerCase();
      return (
        lowerFilename.startsWith("~$") ||
        lowerFilename.startsWith(".") ||
        CLOUD_STORAGE_FILES.includes(lowerFilename)
      );
    };

    for (const dirent of dirents) {
      try {
        const entry_path = path.resolve(dir, dirent.name);
        if (
          !(await existsEntry(entry_path)) ||
          isExcludedFileOrDir(dirent.name)
        ) {
          continue;
        }

        const stats = await lstat(entry_path);
        if (stats.isDirectory()) {
          dir_paths.push(entry_path);
        }
      } catch (error) {
        // preserve stack trace whilst adding context
        error.message = `Whilst processing file: ${dirent.name}, Error: ${error.message}`;
        throw error;
      }
    }

    return dir_paths;
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing getPath(), Error reading directory: ${error.message}`;
    throw error;
  }
}

// // Example usage
// (async () => {
//   const directories = await getPath("your_directory_path_here");
//   console.log(directories);
// })();
