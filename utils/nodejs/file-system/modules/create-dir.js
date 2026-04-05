import fs from "fs";
import path from "path";

export function createDir(abs_path) {
  if (!path.isAbsolute(abs_path)) {
    throw new TypeError(
      `createDir - Invalid input. Expected ${abs_path} to be an absolute path. Instead, was passed ${typeof abs_path}`,
    );
  } // if `abs_path` is a zero-length string, false will be returned (https://nodejs.org/api/path.html#pathisabsolutepath)
  if (!fs.existsSync(abs_path)) {
    fs.mkdirSync(abs_path);
  }
}
