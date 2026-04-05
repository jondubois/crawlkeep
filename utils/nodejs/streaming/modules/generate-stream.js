import fs from "fs";
import path from "path";
import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Asynchronous generator that sequentially reads each file's content, one file at a time, and yields chunks.
 * Returns async generator objects, which are async iterable iterators
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
 * @param {string} dir_path - The directory path to read files from.
 * @param {string} file_ext - The file extension to filter files by.
 * @param {string} encoding - The encoding to use when reading the file.
 * @returns {AsyncGenerator<string>} - An async generator that yields chunks of file content.
 */
export async function* generateStream(dir_path, file_ext, char_encoding) {
  param_validator.validateString(dir_path);
  param_validator.validateString(file_ext);
  param_validator.validateString(char_encoding);

  try {
    const dirents = await fs.promises.readdir(dir_path, {
      withFileTypes: true,
      recursive: true,
    });
    const file_dirents = dirents.filter(
      (dirent) => dirent.isFile() && path.extname(dirent.name) === file_ext,
    );

    if (!file_dirents.length)
      throw new Error(`No file of extension ${file_ext} in directory`);

    // for..of allows the use of `await` inside the loop
    for (const dirent of file_dirents) {
      // https://nodejs.org/api/fs.html#direntparentpath
      const parent_path = dirent.parentPath ?? dirent.path;
      const stream = fs.createReadStream(
        path.resolve(parent_path, dirent.name),
        {
          encoding: char_encoding,
        },
      );
      /* for await...of loop automatically manages the flow of data:
      it calls stream.read(), which switches the stream to flowing mode,
      Readable stream automatically switches back to paused mode when there is no more data to read */
      for await (const chunk of stream) {
        yield chunk;
      } /* for await...of is used to iterate over an asynchronous iterable.
      yield is used to produce a value from the generator function.
      yield itself is not blocking. However,  the combination of for await...of and yield allows
      the generator to asynchronously yield values over a collection of Promises.
      The for await...of loop will wait for each Promise to resolve
      before proceeding to the next iteration */
    }
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing generateStream(), Error: ${error.message}`;
    throw error;
  }
}
