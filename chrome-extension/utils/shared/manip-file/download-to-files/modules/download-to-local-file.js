export function downloadToLocalFile(data, type, file_name) {
  // there are two parts to a file name: the name and the extension (https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files)
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob) {
    // Internet Explorer compatibility
    window.navigator.msSaveOrOpenBlob(file, file_name);
  } else {
    // downloaded to the default download directory configured in the user's browser settings
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
