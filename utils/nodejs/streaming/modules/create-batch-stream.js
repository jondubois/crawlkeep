import { Transform } from "stream";

/**
 * @description Creates a stream that groups chunks received as single Objects,
 * into batches of Objects equal or below a maximum size.
 * @param {number} max_size - The maximum size of each batch.
 * @returns {Transform} - The batch stream transform object.
 */
export function createBatchStream(max_size) {
  let batch = [];
  const ENCODING = "utf-8";
  const DELIMITER = Buffer.from(",", ENCODING);

  return new Transform({
    objectMode: true, // stream doesn't expect to receive or output String or Buffer instance, but rather JavaScript value except `null`
    // `objectMode: false` + `decodeStrings: false` + `transformStream.setEncoding(ENCODING)`= the transform function receives Strings instead of Buffer instances.
    transform(obj_curr, _, callback) {
      try {
        const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);
        if (
          Buffer.byteLength(Buffer.from(JSON.stringify(batch), ENCODING)) +
            Buffer.byteLength(DELIMITER) +
            Buffer.byteLength(curr) >
          max_size
        ) {
          if (batch.length > 0) {
            this.push(batch); // push `obj_curr` into the stream's internal buffer until a consumer reads it
            batch = [];
          }
        }
        // regardless, push `obj_curr` into either the newly created `batch` or the existing one
        batch.push(obj_curr);
        callback();
      } catch (err) {
        callback(err);
      }
    },
    // clean up left-over records
    // OR
    // in case `max_size` is not reached, still emit a batch with the aggregated records
    flush(callback) {
      try {
        if (batch.length > 0) {
          this.push(batch);
          batch = [];
        }
        callback();
      } catch (err) {
        callback(err);
      }
    },
  });
}
