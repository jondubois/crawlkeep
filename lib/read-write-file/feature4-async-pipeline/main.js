import fs from "fs";
import path from "path";
import JSONStream from "JSONStream";
import { Readable, Transform } from "stream";
import { pipeline as pipelineAsync } from "stream/promises";
import { v4 as uuidv4 } from "uuid";
import {
  isEmptyObj,
  isDuplicateObj,
  toValidJson,
} from "../../../utils/index.js";

const SRC_FOLDER_PATH = "";
const DEST_FOLDER_PATH = SRC_FOLDER_PATH;
const DEDUP_RELATIVE_PATH = "deduped-json";
const DEST_ABS_PATH = path.resolve(DEST_FOLDER_PATH, DEDUP_RELATIVE_PATH); // .resolve() turns sequences of paths into an absolute path
if (!fs.existsSync(DEST_ABS_PATH)) {
  fs.mkdirSync(DEST_ABS_PATH);
}
const FILE_EXT = ".json"; // doesn't support .xlsx
const ENCODING = "utf-8";
const PEOPLE_IDS = ["public_id", "lir_niid", "member_id"];
const FILE_SIZE = 50000000; // 50MB

console.log(`Current PID: ${process.pid}`);

function createBatchStream(max_size) {
  let batch = [];
  const ENCODING = "utf-8";
  const DELIMITER = Buffer.from(",", ENCODING);
  // `_` is a placeholder to a non-optional parameter that we don't intend to use.
  // In fact, `encoding` is left undefined, as in our case we transform objects, not strings or buffers
  return new Transform({
    objectMode: true,
    transform(obj_curr, _, callback) {
      const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);
      if (
        Buffer.byteLength(Buffer.from(JSON.stringify(batch), ENCODING)) +
          Buffer.byteLength(DELIMITER) +
          Buffer.byteLength(curr) >
        max_size
      ) {
        // emit current batch and start a new one with current record
        if (batch.length > 0) {
          this.push(JSON.stringify(batch));
          batch = [];
        }
      }
      batch.push(obj_curr);
      callback();
    },
    // clean up left-over records
    // OR
    // in case `max_size` is not reached, still emit a batch with the aggregated records
    flush(callback) {
      if (batch.length > 0) {
        this.push(JSON.stringify(batch));
        batch = [];
      }
      callback();
    },
  });
}

// async generator that  sequentially reads each file's content, one file at a time,
// and yields chunks
// returns async generator objects, which are async iterable iterators https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator
async function* createReadStreams(DIR_PATH, FILE_EXT) {
  const dirents = await fs.promises.readdir(DIR_PATH, {
    withFileTypes: true,
    recursive: true,
  });
  const file_dirents = dirents.filter(
    (dirent) => dirent.isFile() && path.extname(dirent.name) === FILE_EXT,
  );

  if (!file_dirents.length)
    throw new Error(`No file of extension ${FILE_EXT} in directory`);

  for (const dirent of file_dirents) {
    // https://nodejs.org/api/fs.html#direntparentpath
    const parent_path = dirent.parentPath ?? dirent.path;
    const stream = fs.createReadStream(path.resolve(parent_path, dirent.name), {
      encoding: ENCODING,
    });
    /* for await...of loop automatically manages the flow of data:
    it calls stream.read(), which switches the stream to flowing mode,
    Readable stream automatically switches back to paused mode when there is no more data to read */
    for await (const chunk of stream) {
      yield chunk;
    }
  } /* for await...of is used to iterate over an asynchronous iterable.
  yield is used to produce a value from the generator function.
  yield itself is not blocking. However,  the combination of for await...of and yield allows
  the generator to asynchronously yield values over a collection of Promises.
  The for await...of loop will wait for each Promise to resolve
  before proceeding to the next iteration */
}

async function main() {
  let set_ids = new Set();
  const streams = await createReadStreams(SRC_FOLDER_PATH, FILE_EXT);
  const read_stream = Readable.from(streams);
  const json_stream = JSONStream.parse("*");
  const valid_stream = new Transform({
    objectMode: true,
    transform(obj, encoding, callback) {
      try {
        let json_obj = toValidJson(JSON.stringify(obj));
        if (!isEmptyObj(json_obj)) {
          /* When a function is called as a method of an object, `this` is set to the object the method is called on.
          In this case, the `transform` method is defined inside an object, which is passed to the Transform constructor, to form `valid_uniq_stream`.
          Hence why `this` is set to `valid_uniq_stream`, and .push() is a method of the Transform stream.
          The arrow function does not have its own `this` value. Instead, `this` is lexically bound and refers to the surrounding scope.
          If the `transform` method was to be an arrow function, `this` would be lexically bound to the surrounding scope; hence `transform`. */
          // pushes `json_obj` into the stream's internal buffer. The pipe() method then reads this data and writes it to `write_stream`
          this.push(json_obj);
        }
        callback();
      } catch (err) {
        callback(err);
      }
    },
  });
  const uniq_stream = new Transform({
    objectMode: true,
    transform(json_obj, encoding, callback) {
      try {
        if (json_obj && !isDuplicateObj(json_obj, set_ids, PEOPLE_IDS)) {
          this.push(json_obj);
        }
        callback();
      } catch (err) {
        callback(err);
      }
    },
  });
  const batch_stream = createBatchStream(FILE_SIZE);
  const output_file_path = path.join(DEST_ABS_PATH, `${uuidv4()}-deduped.json`); // .join() concatenates only
  // final destination of the stream aka "data sink"
  const write_stream = fs.createWriteStream(output_file_path, {
    encoding: ENCODING,
  });

  await pipelineAsync(
    read_stream,
    json_stream,
    valid_stream,
    uniq_stream,
    batch_stream,
    write_stream,
  );
}

main().catch(console.error);
