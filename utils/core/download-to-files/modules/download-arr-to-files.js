import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Breaks an array of Objects into chunks based on a maximum byte size and writes them to separate files.
 * @param {Array} json_arr - An array of Objects
 * @param {number} max_size - The maximum size in bytes for each chunk
 * @param {string} folder_path - The destination folder path where to download sub-files to
 */
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export async function downloadArrBySize(json_arr, max_size, folder_path) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateNumber(max_size);
  param_validator.validateStringIsNotEmpty(folder_path);

  let acc = Buffer.alloc(0); // initialise an empty Buffer (https://nodejs.org/api/buffer.html#class-buffer)
  const ENCODING = "utf-8";
  const delimiter = Buffer.from(",", ENCODING);

  for (const obj_curr of json_arr) {
    const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);

    if (
      Buffer.byteLength(acc) +
        Buffer.byteLength(delimiter) +
        Buffer.byteLength(curr) >
      max_size
    ) {
      writeBufferToFile(folder_path, uuidv4(), acc);
      acc = curr; // reset, yet keep current record
    } else {
      // add a comma between each record
      acc = acc.byteLength > 0 ? Buffer.concat([acc, delimiter, curr]) : curr;
    }
  }
  // for json_arr not meeting the `max_size` threshold,
  // and for collecting left-over
  if (Buffer.byteLength(acc) > 0) {
    writeBufferToFile(folder_path, uuidv4(), acc);
  }
}

function writeByHandlingBackPressure(writable, data, ENCODING, offset = 0) {
  const chunk = data.slice(offset);
  // Write the data and check if it was accepted
  if (!writable.write(chunk, ENCODING)) {
    // If the data was not accepted, wait for the 'drain' event
    writable.once("drain", () =>
      writeByHandlingBackPressure(
        writable,
        data,
        ENCODING,
        offset + chunk.length,
      ),
    );
  } else {
    // If the data was accepted, we're done
    writable.end();
  }
}

function writeBufferToFile(folder_path, uuid, buffer) {
  try {
    let json_arr = JSON.parse(`[${buffer.toString()}]`);
    const write_stream = fs.createWriteStream(
      `${folder_path}/${uuid}-merged-${json_arr.length}-recs.json`,
    );

    // https://nodejs.org/api/stream.html#event-drain
    const data = JSON.stringify(json_arr);

    let ENCODING = "utf-8";

    writeByHandlingBackPressure(write_stream, data, ENCODING);

    write_stream.on("error", (err) => {
      console.error(
        "writeBufferToFile - An error occurred on the stream:",
        err,
      );
    });
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing writeBufferToFile(), Error: ${error.message}`;
    throw error;
  }
}

//************************************************************************** */
// this takes `` on the upstream to output a JSON Array,
// passes on as the `json_arr` parameter

// import { v4 as uuidv4 } from "uuid";

export async function writeBufferToFile1(folder_path, json_arr) {
  try {
    for (const batch of json_arr) {
      await new Promise((resolve, reject) => {
        const write_stream = fs.createWriteStream(
          `${folder_path}/${uuidv4()}-deduped-${batch.length}-recs.json`,
        );
        writeByHandlingBackPressure(write_stream, JSON.stringify(batch));
        write_stream.on("error", (err) => {
          console.error(
            "writeBufferToFile1 - An error occurred on the stream: ",
            err,
          );
          reject(err);
        });
        write_stream.end(resolve);
      });
    }
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing writeBufferToFile1(), Error: ${error.message}`;
    throw error;
  }
}
