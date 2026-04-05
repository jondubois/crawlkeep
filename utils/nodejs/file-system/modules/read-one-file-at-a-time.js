import fs from "fs";
import path from "path";
import { convertBufferToJSONflat1 } from "./convert-buffer-to-json.js";

/**
 * @description Asynchronously reads files with a specific extension from a directory, one at a time,
 * and yields their content as JSON arrays. Supports optional recursive directory traversal.
 *
 * @param {string} dir_path - The path to the directory to read files from.
 * @param {string} file_ext - The file extension to filter files by (e.g., ".json").
 * @param {boolean} [is_recursive=false] - Whether to read files recursively from subdirectories.
 *
 * @yields {Promise<{dirent: fs.Dirent, json_arr: Array<Object>}>} An object containing the file's directory entry
 * and its content parsed as a JSON array.
 */
export async function* readOneFileAtATime(
  dir_path,
  file_ext,
  is_recursive = false,
) {
  try {
    const dirents = await fs.promises.readdir(dir_path, {
      withFileTypes: true,
      recursive: is_recursive,
    });
    const file_dirents = dirents.filter(
      (dirent) => dirent.isFile() && path.extname(dirent.name) === file_ext,
    );

    if (!file_dirents.length)
      throw new Error(`No file of extension ${file_ext} in directory`);

    // for..of allows the use of `await` inside the loop
    for await (const dirent of file_dirents) {
      try {
        const parent_path = dirent.parentPath ?? dirent.path;
        const abs_path = path.resolve(parent_path, dirent.name);
        const content = await fs.promises.readFile(abs_path);
        const json_arr = await convertBufferToJSONflat1(content, file_ext);
        yield { dirent, json_arr };
      } catch (error) {
        // preserve stack trace whilst adding context
        error.message = `Whilst processing file: ${dirent.name}, Error: ${error.message}`;
        throw error;
      }
    } /* for await...of is used to iterate over an asynchronous iterable.
    yield is used to produce a value from the generator function.
    yield itself is not blocking. However,  the combination of for await...of and yield allows
    the generator to asynchronously yield values over a collection of Promises.
    The for await...of loop will wait for each Promise to resolve
    before proceeding to the next iteration */
  } catch (err) {
    // preserve stack trace whilst adding context
    err.message = `Whilst processing readOneFileAtATime(), Error: ${err.message}`;
    throw err;
  }
}
