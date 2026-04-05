import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Downloads data to a local file.
 * @param {string|Blob|Buffer} data - The data to be downloaded.
 * @param {string} mime_type - The MIME type of the file to be downloaded.
 * @param {string} file_name - The file name to be used when downloading.
 * @returns {void}
 */
export function downloadToLocalFile(data, mime_type, file_name) {
  param_validator.validateStringIsNotEmpty(mime_type);
  param_validator.validateStringIsNotEmpty(file_name);

  // there are two parts to a file name: the name and the extension (https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files)
  var file = new Blob([data], { type: mime_type });
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
