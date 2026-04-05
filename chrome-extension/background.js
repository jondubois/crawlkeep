import { main_app_colors } from "./color-palette.js";
import { messageLocalStorage } from "./utils/web/message-passing/modules/message-local-storage.js";
import { addRecBy } from "./utils/shared/manip-json/modules/add-rec-by.js";
import { create as createAppSocket } from "./node_modules/socketcluster-client/socketcluster-client.min.js";

import SearchManager from "./classes/search-manager.js";
const IS_SEARCH_CRITERIUM_KEY = SearchManager.IS_SEARCH_CRITERIUM_KEY;
const NAME_KEY = SearchManager.NAME_KEY;
const SEARCH_EXP_KEY = SearchManager.SEARCH_EXPRESSION_KEY;
const TIMESTAMP_KEY = SearchManager.TIMESTAMP_KEY;
const TYPE_KEY = SearchManager.TYPE_KEY;
const DEFAULT_THICKNESS = 12;

// // Clear all data from chrome.storage.local
// chrome.storage.local.clear(function () {
//   if (chrome.runtime.lastError) {
//     console.error(chrome.runtime.lastError);
//   } else {
//     console.log("Local storage cleared.");
//   }
// });

// // Clear all data from chrome.storage.sync
// chrome.storage.sync.clear(function () {
//   if (chrome.runtime.lastError) {
//     console.error(chrome.runtime.lastError);
//   } else {
//     console.log("Sync storage cleared.");
//   }
// });

let capturedSampleHeaders = {};

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    for (let header of details.requestHeaders) {
      if (header.name === "x-li-track") {
        if (
          header.value && header.value.indexOf("displayWidth") !== -1 && header.value.indexOf("displayHeight") !== -1
        ) {
          capturedSampleHeaders[header.name] = header.value;
        }
      } else {
        capturedSampleHeaders[header.name] = header.value;
      }
    }
    return details;
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

const template_container_config = {
  // application_label,
  background: main_app_colors.bg_rgba_purple,
  // background_color,
  // border_px,
  border_radius_px: 10,
  // close_action,
  close_btn_px: DEFAULT_THICKNESS,
  container_id: "template_main_cont",
  footer_height_px: DEFAULT_THICKNESS,
  // force_left,
  // force_top,
  // gradient_bg,
  header_height_px: DEFAULT_THICKNESS,
  left: 1,
  left_panel_width_px: DEFAULT_THICKNESS,
  moveable_head: true,
  movable_footer: true,
  movable_left: true,
  movable_right: true,
  // open_action,
  // parent_elm: document.body,
  // ref_elm,
  resizeable: true,
  right_panel_width_px: DEFAULT_THICKNESS,
  // shadow,
  shift_col_px: 10,
  top: 1,
};

let appSocket = null;

// init Chrome extension
chrome.action.onClicked.addListener((tab) => {
  /* check if the active tab is fully loaded,
   which is a side-way of ensuring that the content script was loaded by the extension (from `manifest.json`)
   (https://stackoverflow.com/questions/69296754/chrome-extension-action-onclicked).
   chrome.tabs.onUpdated.addListener((tab_id, update_info, tab) => {
    if (update_info.status === "complete" && tab.active) { would set it as always on */
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    /* `tab` will either be a `tabs.Tab` instance or `undefined`. Instead of `tabs[0]`, we use `tab` for the activeTab.
    https://developer.chrome.com/docs/extensions/reference/api/tabs#get_the_current_tab */
    if (tab) {
      chrome.tabs
        .sendMessage(tab.id, {
          cmd: "initRecorCurator",// TODO 0: Fix event name
        })
        .then((response) => {
          if (response && response.result === "RecordCurator container built") {
            console.log(
              "Confirmation received from content script:",
              response.result,
            );
          }
        })
        .catch((err) => {
          console.error(`Failed to inject main container: ${err.message}`);
        });
    }
  });
});

function patternToRegExp(pattern) {
  return new RegExp(
    "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
  );
}

const appDomains = [
  "https://www.crawlkeep.com/*", 
  "https://crawlkeep.com/*", 
  "http://localhost:8081/app/*"
];

const appRegexPatterns = appDomains.map(patternToRegExp);

function isAppURL(url) {
  return appRegexPatterns.some(regex => url.match(regex));
}

async function checkForRemainingAppTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, function (tabs) {
      const relevantTabsRemain = tabs.some(tab => isAppURL(tab.url));
      resolve(relevantTabsRemain);
    });
  });
}

chrome.tabs.onRemoved.addListener(async () => {
  const isAppOpen = await checkForRemainingAppTabs();
  if (!isAppOpen && appSocket) {
    appSocket.disconnect();
    appSocket = null;
    console.log('Extension disconnected from CrawlKeep');
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details && details.reason === "update") {
    console.log('Extension was updated; refreshing affected tabs...');
    const contentScripts = chrome.runtime.getManifest().content_scripts;
    for (let contentScript of contentScripts) {
      chrome.tabs.query({ url: contentScript.matches }, (tabs) => {
        for (const tab of tabs) {
          chrome.tabs.reload(tab.id);
        }
      });
    }
  }
});

/**
 * @todo - add a button to delete all searches in saved-search-viewer
 */
// Handle keep-alive connections
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "keepalive") {
    console.log("Keep-alive connection established");
    port.onDisconnect.addListener(() => {
      console.log("Keep-alive connection closed");
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      switch (msg.cmd) {
        case "keepAlive":
          // Simple acknowledgment for keep-alive messages
          sendResponse({ success: true });
          break;
        case "openTab":
          {
            chrome.tabs.create({ url: msg.url });
          }
          break;
        case "getKeepActiveState":
          {
            await messageLocalStorage({
              crud_op: "getLocalStorage",
              key: `${msg.key}_current_state`,
            }).then(sendResponse);
          }
          break;
        case "setKeepActiveState":
          {
            await messageLocalStorage({
              crud_op: "setLocalStorage",
              key: `${msg.key}_current_state`,
              data: msg.status,
            }).then(sendResponse);
          }
          break;
        case "getLatestRect":
          await messageLocalStorage({
            crud_op: "getLocalStorage",
            key: `${msg.id}_saved_rect`,
          }).then(sendResponse);
          break;
        case "setLatestRect":
          await messageLocalStorage({
            crud_op: "setLocalStorage",
            key: `${msg.id}_saved_rect`,
            data: msg.rect,
          }).then(sendResponse);
          break;
        case "saveSearch":
          {
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_saved_searches`,
              update_function: (saved_searches, params) => {
                const { rec, max_size_kb } = params;
                let updated_records = [];
                if (!saved_searches?.length) {
                  updated_records.push(rec);
                } else {
                  updated_records = addRecBy(saved_searches, rec, "timestamp");
                }

                // prune to size
                const kb = JSON.stringify(updated_records).length / 1040;
                if (kb > max_size_kb) {
                  updated_records.pop(); // LIFO
                }

                return updated_records;
              },
              params: {
                rec: {
                  [NAME_KEY]: msg[NAME_KEY],
                  [SEARCH_EXP_KEY]: msg[SEARCH_EXP_KEY],
                  [TIMESTAMP_KEY]: new Date().getTime(), // serves as an ID
                  [TYPE_KEY]: msg[TYPE_KEY],
                  [IS_SEARCH_CRITERIUM_KEY]: false, // state stored to persist over sessions
                },
                max_size_kb: 10000, // 10485760/1040 (https://developer.chrome.com/docs/extensions/reference/api/storage#properties_2)
              },
            }).then(sendResponse);
          }
          break;
        case "deleteSearch":
          {
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_saved_searches`,
              update_function: (saved_searches, params) => {
                const { timestamp } = params;
                const latest_search_i = saved_searches.findIndex(
                  (search) => search && search.timestamp === timestamp,
                );
                if (latest_search_i !== -1) {
                  saved_searches.splice(latest_search_i, 1); // mutates in-place
                }
                return saved_searches;
              },
              params: { timestamp: msg[TIMESTAMP_KEY] },
            }).then(sendResponse);
          }
          break;
        case "setSearchExpression":
          {
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_saved_searches`,
              update_function: (saved_searches, params) => {
                const { search_expression, timestamp } = params; // cf. SearchManager
                const search_rec = saved_searches.find(
                  (rec) => rec.timestamp === timestamp,
                );

                if (!search_rec) {
                  throw new Error(
                    `setSearchExpression - a search record of timestamp ${timestamp} could not be found.`,
                  );
                }

                search_rec[SEARCH_EXP_KEY] = search_expression;
                return saved_searches;
              },
              params: {
                [SEARCH_EXP_KEY]: msg[SEARCH_EXP_KEY],
                [TIMESTAMP_KEY]: msg[TIMESTAMP_KEY],
              },
            }).then(sendResponse);
          }
          break;
        case "getAllSavedSearches":
          {
            await messageLocalStorage({
              crud_op: "getLocalStorage",
              key: `${msg.prefix}_saved_searches`,
            }).then(sendResponse);
          }
          break;
        case "deleteAllSavedSearches":
          {
            await messageLocalStorage({
              crud_op: "deleteFromLocalStorage",
              key: `${msg.key}_saved_searches`,
            });
          }
          break; // TODO - add a button to delete all searches in saved-search-viewer
        case "saveCuratedSelection":
          {
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_curated_selections`,
              update_function: (curated_selections, params) => {
                const { rec, max_size_kb } = params;
                let updated_records = [];
                if (!curated_selections?.length) {
                  updated_records.push(rec);
                } else {
                  updated_records = addRecBy(curated_selections, rec, "index"); // TODO - `index` should reflect the position in the array
                }

                // prune to size
                const kb = JSON.stringify(updated_records).length / 1040;
                if (kb > max_size_kb) {
                  updated_records.pop(); // LIFO
                }

                return updated_records;
              },
              params: {
                rec: {
                  index: msg.i,
                  cpy_id: msg.cpy_id,
                  curated_labels: msg.curated_labels,
                },
                max_size_kb: 10000, // 10485760/1040 (https://developer.chrome.com/docs/extensions/reference/api/storage#properties_2)
              },
            }).then(sendResponse);
          }
          break;
        case "getCuratedSelection":
          {
            await messageLocalStorage({
              crud_op: "getLocalStorage",
              key: `${msg.prefix}_curated_selections`,
            }).then((curated_selections) => {
              const record = curated_selections?.find(
                (rec) => rec.index === msg.i,
              );
              sendResponse(record);
            });
          }
          break;
        case "getAllCuratedSelections":
          await messageLocalStorage({
            crud_op: "getLocalStorage",
            key: `${msg.prefix}_curated_selections`,
          }).then(sendResponse);
          break;
        case "deleteAllCuratedSelections":
          await messageLocalStorage({
            crud_op: "deleteFromLocalStorage",
            key: `${msg.prefix}_curated_selections`,
          }).then(sendResponse);
          break;
        case "toggleSearchCriteriumState":
          try {
            const saved_searches = await messageLocalStorage({
              crud_op: "getLocalStorage",
              key: `${msg.prefix}_saved_searches`,
            });
            const search_rec = saved_searches.find(
              (search) => search && search.timestamp === msg[TIMESTAMP_KEY],
            );

            if (!search_rec) {
              throw new Error(
                "toggleSearchCriteriumState - search_rec is undefined",
              );
            }

            search_rec[SearchManager.IS_SEARCH_CRITERIUM_KEY] = msg.state;
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_saved_searches`,
              update_function: (saved_searches, params) => {
                const { rec } = params;
                let updated_records = [];
                if (!saved_searches?.length) {
                  updated_records.push(rec);
                } else {
                  updated_records = addRecBy(saved_searches, rec, "timestamp");
                }
                return updated_records;
              },
              params: { rec: search_rec },
            }).then(sendResponse);
          } catch (error) {
            sendResponse({ error: error.message });
          }
          break;
        // case "getAllSearchCriteria":
        //   {
        //     const saved_searches = await messageLocalStorage({
        //       crud_op: "getLocalStorage",
        //       key: `${msg.key}_saved_searches`,
        //     });
        //     const selected_criteria = saved_searches.filter(
        //       (search) => search[SearchManager.IS_SEARCH_CRITERIUM_KEY],
        //     );
        //     sendResponse(selected_criteria);
        //   }
        //   break;
        case "toggleAllSearchCriteriaState":
          {
            await messageLocalStorage({
              crud_op: "updateLocalStorage",
              key: `${msg.prefix}_saved_searches`,
              update_function: (saved_searches, params) => {
                const { state } = params;
                saved_searches.forEach((search) => {
                  search[SearchManager.IS_SEARCH_CRITERIUM_KEY] = state;
                });
                return saved_searches;
              },
              params: { state: msg.state },
            }).then(sendResponse);
          }
          break;
        case "getTemplateConfig":
          sendResponse(template_container_config);
          break;
        case "connectToCrawlKeep":
          const {
            hostname,
            port,
            protocolScheme,
            path,
            ackTimeout,
            token
           } = msg?.args || {};
          try {
            if (appSocket) {
              appSocket.disconnect();
            }
            appSocket = createAppSocket({
              hostname,
              port: port || 443,
              protocolScheme: protocolScheme || "wss",
              path,
              ackTimeout: ackTimeout || 60000,
              ...msg?.args        
            });
            await appSocket.authenticate(token);
            sendResponse({ success: true });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          break;
        case "startScrape":
          (async () => {
            let extraHeaderValues = msg?.args?.parserConfig?.headers?.values;
            if (extraHeaderValues) {
              let finalHeaders = {};
              for (let [ key, value ] of Object.entries(extraHeaderValues)) {
                if (value.charAt(0) === "$") {
                  let sourceKey = value.slice(1);
                  finalHeaders[key] = capturedSampleHeaders[sourceKey];
                  if (finalHeaders[key] == null) {
                    delete finalHeaders[key];
                  }
                } else {
                  finalHeaders[key] = value;
                }
              }
              msg.args.parserConfig.headers.values = finalHeaders;
            }

            // Forward the message packet to the scraper script running in the target tab.
            let packet = {
              cmd: "startScrape",
              args: msg?.args
            };

            chrome.tabs.query({ url: "https://*.linkedin.com/*" }, (tabs) => {
              let tab = tabs[0];
              if (tab) {
                chrome.tabs.sendMessage(tab.id, packet, (response) => {
                  if (chrome.runtime.lastError) {
                    console.warn(`Failed to send message to tab ${tab.id}`, chrome.runtime.lastError);
                  } else {
                    sendResponse(response);
                  }
                });
              } else {
                sendResponse({ success: false, error: 'You need to be logged into LinkedIn in a separate tab' });
              }
            });
          })();
          break;
        case "stopScrape":
          (async () => {
            // Forward the message packet to the scraper script running in the target tab.
            let packet = {
              cmd: "stopScrape",
              args: msg?.args
            };
            chrome.tabs.query({ url: "https://*.linkedin.com/*" }, (tabs) => {
              if (!tabs.length) {
                sendResponse({ success: true });
                return;
              }
              for (let tab of tabs) {
                if (tab) {
                  chrome.tabs.sendMessage(tab.id, packet, (response) => {
                    if (chrome.runtime.lastError) {
                      console.warn(`Failed to send message to tab ${tab.id}`, chrome.runtime.lastError);
                    } else {
                      sendResponse(response);
                    }
                  });
                }
              }
            });
          })();
          break;
        case "flushData":
          (async () => {
            // Forward the message packet to the scraper script running in the target tab.
            let packet = {
              cmd: "flushData",
              args: msg?.args
            };
            chrome.tabs.query({ url: [ "https://*.crawlkeep.com/*", "http://localhost:8081/*" ] }, (tabs) => {
              for (let tab of tabs) {
                if (tab) {
                  chrome.tabs.sendMessage(tab.id, packet, (response) => {
                    if (chrome.runtime.lastError) {
                      console.warn(`Failed to send message to tab ${tab.id}`, chrome.runtime.lastError);
                    } else {
                      sendResponse(response);
                    }
                  });
                } else {
                  sendResponse({ success: false, error: 'You need to be logged into LinkedIn in a separate tab' });
                }
              }
            });
          })();
          break;
        default:
          sendResponse(`Received invalid message command: ${msg}`);
      }
    } catch (error) {
      console.error("Error in message receiver of background.js:", error);
      sendResponse({ error: error.message });
    }
  })();
  return true; /* keeps the message channel open for async response.
  `sendResponse()` and `return true`, which is effectively the same as returning a `Promise` (https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#sending_an_asynchronous_response_using_sendresponse) */
});

// when "Always on" is toggled, the extension is launched according to its state
chrome.tabs.onUpdated.addListener(async (tab_id, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    try {
      // check if tab still exists
      try {
        await chrome.tabs.get(tab_id);
      } catch (error) {
        console.log("Tab no longer exists, skipping message");
        return;
      }

      const resp = await chrome.tabs
        .sendMessage(tab_id, {
          cmd: "getPrefix",
        })
        .catch((err) => {
          console.log("onUpdated - Content script not ready yet");
          return null;
        });

      if (!resp) return;

      const xh_always_on_state = await messageLocalStorage({
        crud_op: "getLocalStorage",
        key: `${resp.result}_current_state`, // ${ComponentManager.XH_PREFIX}
      });
      if (xh_always_on_state === "on") {
        try {
          const resp = await chrome.tabs.sendMessage(tab_id, {
            cmd: "initRecorCurator",
          });
          if (resp && resp.result === "RecordCurator container built") {
            console.log("Confirmation received from content script:", resp);
          }
        } catch (err) {
          console.error(`Failed to build main container: ${err}`);
        }
      }
    } catch (err) {
      console.error(`Failed to get prefix: ${err}`);
    }
  }
});
