import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { Readable } from "stream";
import { createBatchStream } from "../../streaming/modules/create-batch-stream.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Writes data to a file. If the data is too large, it streams the data and writes it in batches.
 * @param {string} directory - The directory where the file will be written.
 * @param {string} file_name - The name of the file.
 * @param {string} extension - The file extension.
 * @param {Array|Object} data - The data to be written to the file.
 */
export async function tryWriteFile(directory, file_name, extension, data) {
  param_validator.validateString(directory);
  param_validator.validateString(file_name);
  param_validator.validateString(extension);

  try {
    const file_path = path.resolve(directory, `${file_name}${extension}`);
    switch (extension.toLowerCase()) {
      case ".json":
        await fs.promises.writeFile(file_path, JSON.stringify(data, null, 2));
        break;

      case ".xlsx": {
        param_validator.validateJsonArr(data);
        if (!fs.existsSync(directory)) {
          throw new Error(`Directory does not exist: ${directory}`);
        }
        // create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const buffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "buffer",
        }); // in Node.js, `XLSX.writeFile` didn't work with neither an absolute path, nor a filename (https://docs.sheetjs.com/docs/api/write-options/).
        fs.writeFileSync(file_path, buffer);
        break;
      }

      case ".csv": {
        const csvContent = data.map((row) => row.join(",")).join("\n");
        await fs.promises.writeFile(file_path, csvContent);
        break;
      }

      case ".txt": {
        const txtContent = data.map((row) => row.join(" ")).join("\n");
        await fs.promises.writeFile(file_path, txtContent);
        break;
      }

      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }

    console.log("Successfully wrote file: ", file_name);
  } catch (error) {
    if (error instanceof RangeError) {
      console.warn("Data is too large, streaming in batches...");
      await tryWriteInBatches(directory, file_name, extension, data);
    } else {
      // Preserve stack trace while adding context
      error.message = `Whilst processing tryWriteFile(), Error: ${error.message}`;
      throw error;
    }
  }
}

/**
 * Streams data in batches and writes each batch to a separate file.
 * @param {string} directory - The directory where the file will be written.
 * @param {string} file_name - The name of the file.
 * @param {string} extension - The file extension.
 * @param {Array|Object} data - The data to be written to the file.
 */
export async function tryWriteInBatches(directory, file_name, extension, data) {
  console.log("Streaming data in batches...");
  const CHUNK_SIZE = 20 * 1024 * 1024; // 100MB. 512 MB is the max size for a single file in S3, MS Word.
  try {
    const data_stream = Readable.from(data);
    const batch_stream = createBatchStream(CHUNK_SIZE);

    data_stream.pipe(batch_stream);

    let i = 0;
    for await (const batch of batch_stream) {
      const batch_file_path = path.resolve(
        directory,
        `${file_name}-batch-${i++}${extension}`,
      );
      const write_stream = fs.createWriteStream(batch_file_path, {
        encoding: "utf-8",
      });

      write_stream.write(JSON.stringify(batch, null, 2), "utf-8");
      write_stream.end();
    }

    console.log("Successfully wrote file in batches: ", file_name);
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing tryWriteInBatches(), Error: ${error.message}`;
    throw error;
  }
}

export function tryWriteFileSync(directory, file_name, extension, data) {
  try {
    const file_path = path.resolve(directory, `${file_name}${extension}`);
    const file_content =
      extension === ".json" ? JSON.stringify(data, null, 2) : data;
    fs.writeFileSync(file_path, file_content);
    console.log("Successfully wrote file: ", file_name);
  } catch (error) {
    // preserve stack trace whilst adding context
    error.message = `Whilst processing tryWriteFileSync(), Error: ${error.message}`;
    throw error;
  }
}
