/**
 * @description Extracts the file extension from a file name.
 * @param {string} file_name - The name of the file.
 * @return {string} - The file extension in lowercase, or an empty string if none exists.
 */
export function getFileExtension(file_name) {
  const lastDotIndex = file_name.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No dot found or it's a hidden file without an extension
    return "";
  }
  return file_name.slice(lastDotIndex + 1).toLowerCase();
}
