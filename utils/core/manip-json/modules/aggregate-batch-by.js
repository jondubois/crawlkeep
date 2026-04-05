import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Aggregates an array of JSON objects into batches based on a maximum byte size.
 * @param {Array<Object>} json_arr - The array of JSON objects to be batched.
 * @param {number} max_size - The maximum size in bytes for each batch.
 * @returns {Array<Array<Object>>} An array of batches, where each batch is an array of JSON objects.
 */
export function aggregateBatchBy(json_arr, max_size) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateNumber(max_size);

  if (!json_arr.length || max_size <= 0) {
    return json_arr;
  }
  let batch = []; // initialise an empty array
  let batches = [];
  const ENCODING = "utf-8";
  const DELIMITER = Buffer.from(",", ENCODING);

  for (const obj_curr of json_arr) {
    const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);

    if (
      Buffer.byteLength(Buffer.from(JSON.stringify(batch), ENCODING)) +
        Buffer.byteLength(DELIMITER) +
        Buffer.byteLength(curr) >
      max_size
    ) {
      // start a new batch
      batches.push(batch);
      batch = [obj_curr]; // reset, yet keep current record
    } else {
      batch = [...batch, obj_curr];
    }
  }
  // for `json_arr` not meeting the `max_size` threshold,
  // and left-over collection
  if (batch.length > 0) {
    batches.push(batch);
  }
  return batches;
}

//********************************************** */
// function aggregateBatchBy1(json_arr, max_size) {
//   let acc = Buffer.alloc(0); // initialise an empty Buffer
//   const ENCODING = "utf-8";
//   const DELIMITER = Buffer.from(",", ENCODING);
//   let batches = [];

//   for (const obj_curr of json_arr) {
//     const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);

//     if (
//       Buffer.byteLength(acc) +
//         Buffer.byteLength(DELIMITER) +
//         Buffer.byteLength(curr) >
//       max_size
//     ) {
//       // start a new batch
//       batches.push(acc);
//       acc = curr; // reset, yet keep current record
//     } else {
//       // add a comma between each record
//       acc = acc.byteLength > 0 ? Buffer.concat([acc, DELIMITER, curr]) : curr;
//     }
//   }
//   // for `json_arr` not meeting the `max_size` threshold,
//   // and left-over collection
//   if (Buffer.byteLength(acc) > 0) {
//     batches.push(acc);
//   }
//   return batches;
// }
// export { aggregateBatchBy1 };

//********************************************** */
// function aggregateBatchBy2(json_arr, max_size) {
//   const ENCODING = "utf-8";
//   const DELIMITER = Buffer.from(",", ENCODING);

//   const [lastAcc, batches] = json_arr.reduce(
//     ([acc, batches], obj_curr) => {
//       const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);
//       const newSize =
//         Buffer.byteLength(acc) +
//         Buffer.byteLength(DELIMITER) +
//         Buffer.byteLength(curr);

//       if (newSize > max_size) {
//         // start a new batch
//         batches.push(acc);
//         return [curr, batches]; // reset, yet keep current record
//       } else {
//         // add a comma between each record
//         acc = acc.byteLength > 0 ? Buffer.concat([acc, DELIMITER, curr]) : curr;
//         return [acc, batches];
//       }
//     },
//     [Buffer.alloc(0), []],
//   );
//   // for json_arr not meeting the `max_size` threshold, and for collecting left-over
//   if (Buffer.byteLength(lastAcc) > 0) {
//     batches.push(lastAcc);
//   }

//   return batches;
// }
// export { aggregateBatchBy2 };

//********************************************** */
// function aggregateBatchBy3(json_arr, max_size) {
//   const ENCODING = "utf-8";
//   const delimiter = Buffer.from(",", ENCODING);

//   return json_arr.reduce((acc, obj_curr) => {
//     const curr = Buffer.from(JSON.stringify(obj_curr), ENCODING);
//     const lastBatchIndex = acc.length - 1;
//     const lastBatch = acc[lastBatchIndex];

//     if (
//       !lastBatch ||
//       Buffer.byteLength(lastBatch) +
//         Buffer.byteLength(curr) +
//         Buffer.byteLength(delimiter) >
//         max_size
//     ) {
//       // start a new batch
//       acc.push(curr);
//     } else {
//       // stack ontop of the existing batch, by adding a comma between each record
//       acc[lastBatchIndex] = Buffer.concat([lastBatch, delimiter, curr]);
//     }

//     return acc;
//   }, []);
// }
// export { aggregateBatchBy3 };
