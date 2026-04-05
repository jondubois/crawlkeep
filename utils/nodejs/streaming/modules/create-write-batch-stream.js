import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Transform } from "stream";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Creates a writable stream that writes batches of data to files.
 * @param {string} dest_path - The destination directory where files will be written.
 * @param {string} char_encoding - The character encoding used for writing files.
 * @returns {Transform} A Transform stream in object mode for processing data batches.
 */
export function createWriteBatchStream(dest_path, char_encoding) {
  param_validator.validateString(dest_path);
  param_validator.validateString(char_encoding);

  return new Transform({
    objectMode: true,
    transform(batch, _, callback) {
      const output_file_path = path.join(
        dest_path,
        `${uuidv4()}-deduped-${batch.length}-recs.json`,
      );
      const write_stream = fs.createWriteStream(output_file_path, {
        encoding: char_encoding,
      });

      write_stream.write(JSON.stringify(batch), char_encoding, (err) => {
        if (err) {
          callback(err);
        } else {
          write_stream.end(); // after the data is flushed, emits the 'finish' event.
          // Not a promise-based asynchronous function,
          // yet asynchronous in the sense that it does not block the Node.js event loop
          write_stream.on("finish", callback);
        }
      });
    },
  });
}
