import path from "node:path";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Converts a Windows-style absolute file path to a POSIX-style path.
 * @param {string} abs_file_path - The absolute file path to convert.
 * @returns {string} - The converted POSIX-style file path.
 * @throws {TypeError} - If the input is not a string.
 */
export function toPosix(abs_file_path) {
  param_validator.validateString(abs_file_path);
  // breakdown the Windows format absolute path
  const { dir, base } = path.parse(abs_file_path);
  // turn Windows's backslashes ..
  const path_fragments = dir.split(path.sep);
  // .. into forward slashes
  const posix_dir = path.posix.join(...path_fragments);
  // recompose the file path in POSIX format, compatible with the `madge` library
  const file_path = path.posix.format({
    root: "_", // ignored (https://nodejs.org/api/path.html#pathformatpathobject)
    dir: posix_dir,
    base: base,
  });
  return file_path;
}
