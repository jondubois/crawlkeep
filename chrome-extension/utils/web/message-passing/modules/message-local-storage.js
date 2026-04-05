/**
 * @todo - integrate the Update / Delete logic from background.js
 */
const crud_handler = {
  // Create
  async setLocalStorage(msg) {
    if (msg?.key && msg?.data)
      await chrome.storage.local.set({ [msg.key]: msg.data });
    /* accepts an array of keys and returns an object where
      each key is mapped to its corresponding value in the storage. */ else
      return undefined;
  },
  // Retrieve
  async getLocalStorage(msg) {
    if (msg?.key) {
      const data_obj = await chrome.storage.local.get([msg.key]);
      return data_obj?.[msg.key];
    }
    return undefined;
  },
  // Update
  async updateLocalStorage(msg) {
    if (msg?.key && msg?.update_function && msg?.params) {
      const data_obj = await chrome.storage.local.get([msg.key]);

      const records = data_obj?.[msg.key] ?? [];
      const updated_recs = msg.update_function(records, msg.params);
      await chrome.storage.local.set({ [msg.key]: updated_recs });
      return updated_recs;
    }
    return undefined;
  },
  // Delete
  async deleteFromLocalStorage(msg) {
    try {
      if (!msg?.key) {
        throw new Error("No key provided.");
      }
      await chrome.storage.local.remove(msg.key);
      return { success: true, message: `Key ${msg.key} deleted successfully.` };
    } catch (error) {
      return {
        success: false,
        message: `Error deleting key: ${error.message}`,
      };
    }
  },
}; /* Storage API is asynchronous. Both `chrome.storage.local.get()` and `chrome.storage.local.set()` return a `Promise` (https://developer.chrome.com/docs/extensions/reference/api/storage#property-local) */

export async function messageLocalStorage(msg) {
  const function_to_execute = crud_handler[msg.crud_op]; // if `msg.crud_op` is "getLocalStorage", then `crud_handler[msg.crud_op]` will be `crud_handler.getLocalStorage`
  if (function_to_execute) {
    return await function_to_execute(msg);
  } else {
    throw new Error(
      `${messageLocalStorage.name} - Unknown command: ${msg.crud_op}`,
    );
  }
}
