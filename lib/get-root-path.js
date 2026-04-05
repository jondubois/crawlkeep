/**
 * in ES5
 */
// const appDir = pt.dirname(require.main.filename);
// const appDir = pt.resolve(__dirname + __filename);
// console.log(process.argv[1]);

/**
 * in ES6 module, an equivalent to __dirname to identify the root directory of the current working directory (cwd)
 */
// https://stackoverflow.com/questions/76168024/how-can-i-produce-dirname-pointing-to-the-root-directory-from-within-an-ejs-mo
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
import path from "path";
import * as url from "url";

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
console.log(dirname);
// console.log(__dirname);
// Node.js version 16.9.0 and above
const meta = import.meta;
const dirname1 = url.fileURLToPath(new URL(".", import.meta.url));
const dirname2 = import.meta.dirname;
const filename2 = import.meta.filename;

// process.cwd() returns current working directory
const targetDir = process.argv[2] ?? process.cwd();
debugger;
