import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Updates the records by ensuring uniqueness based on the filtering key and
 * replacing existing records with the new one
 * @param {Array<Object>} target_recs - The array of existing records
 * @param {Object} source_rec - The new record to be added or updated
 * @param {String} filtering_key - The key to filter and ensure uniqueness
 * @return {Array<Object>} - The updated array of records with the new record included
 */
export function addRecBy(target_recs, source_rec, filtering_key) {
  param_validator.validateJsonArr(target_recs);
  param_validator.validateKeyedObj(source_rec);
  param_validator.validateStringIsNotEmpty(filtering_key);

  const index = target_recs.findIndex(
    (rec) => rec[filtering_key] === source_rec[filtering_key],
  );
  if (index !== -1) {
    target_recs[index] = source_rec;
  } else {
    target_recs.unshift(source_rec); // FILO
  }
  return target_recs;
}

// /**
//  * @description Updates the records by ensuring uniqueness based on the filtering key and replacing existing records with the new one
//  * @param {Array<Object>} target_recs - The array of existing records
//  * @param {Object} source_rec - The new record to be added or updated
//  * @param {String} filtering_key - The key to filter and ensure uniqueness
//  * @return {Array<Object>} - The updated array of records with the new record included
//  */
// export function addRecBy(target_recs, source_rec, filtering_key) {
//   const map = new Map();
//   for (const rec of target_recs.reverse()) {
//     map.set(rec[filtering_key], rec);
//   } // dedup: last duplicate supersedes. IOW, the most recent record is kept
//   map.set(source_rec[filtering_key], source_rec);
//   return Array.from(map.values()).reverse();
// }
