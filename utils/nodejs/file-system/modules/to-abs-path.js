import path from "path";

export function getAbsPathCwd(rel_path) {
  return path.resolve(process.cwd() ?? process.argv[2], rel_path);
}

export function getAbsPathHome(rel_path) {
  return path.resolve(process.env.HOME || process.env.USERPROFILE, rel_path);
}
