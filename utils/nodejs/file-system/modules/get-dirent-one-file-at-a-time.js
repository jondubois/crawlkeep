import fs from "fs";
import path from "path";

export async function* getDirentOneFileAtATime(
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

    for await (const dirent of file_dirents) {
      yield { dirent };
    } /* for await...of is used to iterate over an asynchronous iterable.
    yield is used to produce a value from the generator function.
    yield itself is not blocking. However,  the combination of for await...of and yield allows
    the generator to asynchronously yield values over a collection of Promises.
    The for await...of loop will wait for each Promise to resolve
    before proceeding to the next iteration */
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing getDirentOneFileAtATime(), Error: ${error.message}`;
    throw error;
  }
}
