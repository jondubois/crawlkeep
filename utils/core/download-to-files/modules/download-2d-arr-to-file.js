import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Downloads 2D Array to a file.
 * @param {Array} arr2D - two dimensional Array.
 * @param {string} file_name - The name of the file to be downloaded.
 * @returns {void}
 */
export function download2DarrToFile(arr2D, file_name) {
  param_validator.validateArray(arr2D);
  param_validator.validateArray(arr2D[0]); // 2D array
  param_validator.validateStringIsNotEmpty(file_name);

  let is_json_bourne = /.json$|.js$/.test(file_name);
  var data = is_json_bourne
    ? JSON.stringify(arr2D, null, 2)
    : arr2D
        .map((el) => el.reduce((a, b) => a + "    " + b))
        .reduce((a, b) => a + "" + b);
  var type = is_json_bourne
    ? "data:application/json;charset=utf-8,"
    : "data:text/plain;charset=utf-8,"; // // {MIMEType} aka "media type", aka "content type" (https://www.iana.org/assignments/media-types/media-types.xhtml)
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, file_name);
  } else {
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 10);
  }
}

/**
 * @description Downloads the prepared data to the local directory as a file.
 * @param {{data: string, type: string, filename: string}} file - The object returned by `toPrepedForDownload`.
 */
export function downloadToLocal(file) {
  const { data, type, filename } = file;

  // upload content to download link
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(
    new Blob([data], { type: type.split(",")[0] }),
  );
  downloadLink.download = filename;

  // trigger the download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}
