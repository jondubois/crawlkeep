/* async dynamic ESM module import (https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#importing_on-demand_in_response_to_user_action ) */
export async function importModules() {
  try {
    const init_src = chrome.runtime.getURL("init/index.js"); // TODO - refactor to `init`
    const web_src = chrome.runtime.getURL("utils/page-monitoring/index.js");

    return await Promise.all([
      import(init_src), // Promise fulfills to a module namespace object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object)
      import(web_src),
    ]); /* the fulfillment value is an array of fulfillment values, in the order of the promises passed, regardless of completion order (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#return_value) */
  } catch (error) {
    console.error(
      `Whilst processing ${importModules.name} - Error importing modules:`,
      error,
    );
  }
}
