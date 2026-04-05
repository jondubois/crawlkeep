import path from "path";
import { readdir } from "fs/promises";
import { toPosix } from "../../../core/manip-str/modules/to-posix.js";
// import { getAbsPathCwd } from "./to-abs-path.js";
// import { copyToClipboard } from "../../copy-to-clipboard.js";

export async function listFilePathsIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return listFilePathsIn(fullPath); // Recurse into subdirectories
      } else {
        // Convert to relative path based on CWD and then to POSIX format
        const relativePath = path.relative(process.cwd(), fullPath);
        return toPosix(relativePath);
      }
    }),
  );
  return files.flat(); // Flatten the array of file paths
}

// // Usage
// const DIR_ABS_PATH = getAbsPathCwd("utils");
// listFilePathsIn(DIR_ABS_PATH)
//   .then((filePaths) => {
//     const exportStatements = filePaths.map(
//       (filePath) => `export * from "./${filePath.replace(/^utils\//, "")}";`,
//     );
//     copyToClipboard(exportStatements.join("\n"));
//   })
//   .catch(console.error);
