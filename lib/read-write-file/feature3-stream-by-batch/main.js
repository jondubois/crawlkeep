import fs from "fs";
import path from "path";
import JSONStream from "JSONStream";
import { Transform } from "stream";
import { v4 as uuidv4 } from "uuid";
import { toValidJson, isEmptyObj } from "../../../utils/index.js";

const FOLDER_PATH = "";
const FILE_EXT = ".json"; // doesn't support .xlsx
const PEOPLE_IDS = ["public_id", "lir_niid", "member_id"];
const DEDUP_RELATIVE_PATH = "deduped-json";
const FILE_SIZE = 40000000; // 40MB. 512 MB is the max size for a single file in S3 / Word
const ENCODING = "utf-8";
// console.log(`Current PID: ${process.pid}`);
function isDuplicate(obj, uniq_set, props) {
  let ini_size = uniq_set.size;
  // isolate ID properties into a new object that serves as a key for the Set()
  const curr_identifiers = props.reduce((acc, prop) => {
    if (obj[prop]) {
      acc[prop] = obj[prop];
    }
    return acc;
  }, {});

  // abort if `curr_identifiers` is empty
  if (isEmptyObj(curr_identifiers)) {
    return;
  }

  // check if a key exists in the Set() that shares at least one property with `curr_identifiers`
  // Set.has() can't perform a partial match on the properties of the key objects. It's based on SameValueZero algorithm, which is similar to strict equality (===).
  const existing_identifier = Array.from(uniq_set.keys()).find((key) =>
    props.some((prop) => key[prop] === curr_identifiers[prop]),
  );

  if (existing_identifier) {
    // merge eventual ID properties into `existing_identifier`
    Object.assign(
      existing_identifier,
      curr_identifiers,
    ); /* mutates `existing_identifier` in place ByRef. Object is the only mutable value in JavaScript,
        which means their properties can be changed without changing their reference in memory.
        Object.assign() static method copies all enumerable own properties from one or more source objects to a target object, mutating it.
        Properties in the target object are overwritten by properties in the sources if they have the same key.
        It returns the mutated target object */
  } else {
    uniq_set.add(curr_identifiers); // Set() stores a reference to both, `curr_identifiers` and `obj`. So, if `obj` is modified, the changes will be reflected in the Set()
  }
  return ini_size === uniq_set.size;
}

const DEST_ABS_PATH = path.resolve(FOLDER_PATH, DEDUP_RELATIVE_PATH);
if (!fs.existsSync(DEST_ABS_PATH)) {
  fs.mkdirSync(DEST_ABS_PATH);
}

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
        // emit current batch and start a new once with current record
        if (batch.length > 0) {
          this.push(batch);
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
        this.push(batch);
        batch = [];
      }
      callback();
    },
  });
}

async function streamFromFiles(DIR_PATH, FILE_EXT) {
  const dirents = await fs.promises.readdir(DIR_PATH, {
    withFileTypes: true,
    recursive: true,
  });
  const file_dirents = dirents.filter(
    (dirent) => dirent.isFile() && path.extname(dirent.name) === FILE_EXT,
  );

  if (file_dirents.length === 0)
    throw new Error(`No file of extension ${FILE_EXT} in directory`);

  let set_ids = new Set();

  for (const dirent of file_dirents) {
    const parent_path = dirent.parentPath ?? dirent.path;
    const input_abs_path = path.resolve(parent_path, dirent.name);
    const read_stream = fs.createReadStream(input_abs_path, {
      encoding: ENCODING,
    });
    const valid_uniq_stream = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          let json_obj = toValidJson(JSON.stringify(chunk));
          if (json_obj && !isDuplicate(json_obj, set_ids, PEOPLE_IDS)) {
            /* When a function is called as a method of an object, `this` is set to the object the method is called on.
            In this case, the `transform` method is defined inside an object, which is passed to the Transform constructor, to form `valid_uniq_stream`.
            Hence why `this` is set to `valid_uniq_stream`, and .push() is a method of the Transform stream.
            The arrow function does not have its own `this` value. Instead, `this` is lexically bound and refers to the surrounding scope.
            If the `transform` method was to be an arrow function, `this` would be lexically bound to the surrounding scope; hence `transform`. */
            this.push(json_obj);
          }
          callback();
        } catch (err) {
          callback(err);
        }
      },
    });
    const json_stream = JSONStream.parse("*");
    const batch_stream = createBatchStream(FILE_SIZE);

    read_stream.pipe(json_stream).pipe(valid_uniq_stream).pipe(batch_stream);

    // no need for back pressure handling.
    // because `batch_stream` is an async iterable object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of#iterating_over_async_generators)
    // it waits for each write operation to end before releasing the next batch
    for await (const batch of batch_stream) {
      const output_file_path = `${DEST_ABS_PATH}/${uuidv4()}-deduped-${
        batch.length
      }-recs.json`;
      const write_stream = fs.createWriteStream(output_file_path, {
        encoding: ENCODING,
      });

      write_stream.write(JSON.stringify(batch), ENCODING);
      write_stream.end();
    }
  } /* `for..of` loop allows async operations to be executed sequentially as,
  it waits for Promise in its body to resolve before proceeding to the next iteration */
}
streamFromFiles(FOLDER_PATH, FILE_EXT);
