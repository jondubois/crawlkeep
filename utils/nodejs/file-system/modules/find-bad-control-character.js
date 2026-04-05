import fs from "fs";

export function findBadControlCharacter(filePath, position) {
  const jsonString = fs.readFileSync(filePath, "utf8");
  // Extract a substring around the problematic position
  const substring = jsonString.substring(position - 50, position + 50);
  return substring;
}
// // Usage:
// const DIR_PATH = "C:/Users/username/path/to/your/target/directory/file.js";
// const position = 22037600;
// console.log(findBadControlCharacter(DIR_PATH, position));
