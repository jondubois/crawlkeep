import path from "path";
import fs from "fs";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Renames a file based on a given base name pattern. If the pattern:
 * - matches, it constructs a new base name and renames the file accordingly.
 * - does not match, it logs an error message.
 * @param {string} src_abs_path - The absolute path of the source file.
 * @param {RegExp} named_capturing_rx - The regular expression pattern to match the base name of the file.
 * @returns {Promise<void>} - A promise that resolves when the file has been renamed.
 */
export async function renameFile(src_abs_path, named_capturing_rx) {
  param_validator.validateString(src_abs_path);
  param_validator.validateRegExp(named_capturing_rx);

  const { base: base_name, ext: file_ext } = path.parse(src_abs_path);
  const match = base_name.match(named_capturing_rx);

  if (match) {
    // deconstruct the base name
    const { iso_timestamp, length, uuid } = match.groups;

    // reconstruct the base name
    const new_base_name = `from-${iso_timestamp}-nested-normalized-${length}-profiles`;
    // const new_base_name = `from-file-${iso_timestamp}-inherent-tagged-${length}-profiles-${uuid}`;

    // rename the file
    const old_path = src_abs_path;
    const new_path = path.join(
      path.dirname(src_abs_path),
      `${new_base_name}${file_ext}`,
    );
    await fs.promises.rename(old_path, new_path);
  } else {
    console.error(
      `Failed to match the base name pattern of file: ${base_name}.`,
    );
  }
}
