const ext_id = "eamlmlmhnpcoiddbjjfnfanoojcfcoan";

/* Warning: Do not prepend async to the `handleEvent()` function. 
  Prepending async changes the meaning to sending an asynchronous response using a promise.
  However, `Promise` as a return value is not supported in Chrome until Chrome bug 1185241 is resolved.
  As an alternative, use `sendResponse(true)`, which is effectively the same ( https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addlistener_syntax ) */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script: ", message);
  switch (message.cmd) {
    case "initRecorCurator":
      (async () => {
        try {
          /* async dynamic ESM module import (https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#importing_on-demand_in_response_to_user_action ) */
          const init_url = chrome.runtime.getURL(
            "init/modules/init-advanced-highlighter-html.js",
          );
          const monitoring_url = chrome.runtime.getURL(
            "utils/web/page-monitoring/modules/page-observer.js",
          );
          const [{ initAdvancedHighlighterHTML }, { pageObserver }] =
            await Promise.all([
              import(init_url), // Promise fulfills to a module namespace object (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object)
              import(monitoring_url),
            ]); /* the fulfillment value is an array of fulfillment values.
            It maps the order of the promises passed, regardless of completion order (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#return_value) */

          initAdvancedHighlighterHTML();

          sendResponse({ result: "RecordCurator container built" });
          /* `sendResponse()` callback is only valid if used synchronously,
          or if the event handler returns true to indicate that it will respond asynchronously (https://developer.chrome.com/docs/extensions/develop/concepts/messaging#simple) */
          window.addEventListener("load", pageObserver);
        } catch (error) {
          console.error("Failed to build RecordCurator", error);
          sendResponse({ result: "Failed to build RecordCurator" });
        }
      })();
      return true; /* The listener function can return either a Boolean or a Promise.
      For an async response, the listener needs to synchronously return `true` to indicate that it will respond asynchronously,
      thereby keeping the `sendResponse()` callback function both:
      - valid after the listener returns
      - active, until it's ready to be called aka telling Chrome to not garbage collect it */
    case "getPrefix":
      (async () => {
        try {
          const { ComponentManager } = await import(
            chrome.runtime.getURL("./classes/component-manager.js")
          );
          sendResponse({ result: ComponentManager.XH_PREFIX });
        } catch (error) {
          sendResponse({ result: "Failed to get prefix" });
        }
      })();
      return true;
  }
}); // event listener should be registered outside the async function, not the other way around
