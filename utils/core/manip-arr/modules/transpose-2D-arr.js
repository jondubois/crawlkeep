/**
 * @description Transposes a 2D array.
 * callback is invoked only for indexes of the array which have assigned values; it is not invoked for indexes which have been deleted or which have never been assigned values.
 * https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
 * @param {Array<Array>} matrix - The 2D array to be transposed.
 * @returns {Array<Array>} - The transposed 2D array.
 */
export function transpose2Darr(matrix_or_jagged) {
  return matrix_or_jagged[0].map((_, column_i) =>
    matrix_or_jagged.map((row) => row[column_i]),
  ); // `_` used as a placeholder for the current element, to allow access to the second argument `Column_i`
}

export function merge2DarrVertically(matrix_or_jagged) {
  return matrix_or_jagged[0].map((_, column_i) =>
    matrix_or_jagged.reduce((acc, row) => acc.concat(row[column_i]), []),
  ); // `_` used as a placeholder for the current element, to allow access to the second argument `Column_i`
}
/* let output = input[0]
  .map((_, column_i) => input.map((row) => row[column_i]))
  .map((row) => row.flat());
//   .reduce((acc, curr) => acc.concat(curr), []); */
