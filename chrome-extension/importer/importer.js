console.log("Extension importer is ready.");

let importerDiv = document.createElement("div");
importerDiv.style.display = "none";
importerDiv.setAttribute("id", "crawlkeep-importer-extension-container");
document.body.appendChild(importerDiv);

let employeeList = [];
let companyList = [];

let currentCrawlSettings = {};

// Keep-alive connection
let keepAlivePort = null;

function startKeepAlive() {
  if (!keepAlivePort) {
    keepAlivePort = chrome.runtime.connect({ name: "keepalive" });
    console.log('Keep-alive connection established');
  }
}

function stopKeepAlive() {
  if (keepAlivePort) {
    keepAlivePort.disconnect();
    keepAlivePort = null;
    console.log('Keep-alive connection closed');
  }
}

window.addEventListener("crawlkeep-import-complete", () => {
  console.log("Import completed, stopping keep-alive");
  stopKeepAlive();
});

window.addEventListener("crawlkeep-start-crawl", async (event) => {
  let detail = event.detail || {};
  currentCrawlSettings = detail.crawlSettings || {};
  let scrapeOptions = detail.scrapeOptions || {};

  // Start keep-alive to prevent tab from becoming inactive
  startKeepAlive();

  // Stop any existing active crawl on any tab.
  await sendCommand("stopScrape", { noLog: true });

  let scrapeResponse = await sendCommand("startScrape", scrapeOptions);

  if (scrapeResponse.error) {
    showError(`Failed to crawl because of error: ${scrapeResponse.error}`);
    stopKeepAlive();
    return;
  }
});

window.addEventListener("crawlkeep-stop-crawl", async (event) => {
  let detail = event.detail || {};

  let stopScrapeResponse = await sendCommand("stopScrape", detail);

  if (stopScrapeResponse.error) {
    showError(`Failed to stop crawl because of error: ${stopScrapeResponse.error}`);
    stopKeepAlive();
    return;
  }

  if (detail.reset) {
    showMessage("Crawling was stopped and reset!");
    stopKeepAlive();
  } else {
    showMessage("Crawling stopped! Please wait while data is imported.");
  }
});

window.addEventListener("crawlkeep-fetch-persons", async (event) => {
  let detail = event.detail || {};
  let scrapeOptions = detail.scrapeOptions || {};

  // Stop any existing active crawl on any tab.
  await sendCommand("stopScrape", {});

  let scrapeResponse = await sendCommand("startScrape", scrapeOptions);

  if (scrapeResponse.error) {
    showError(`Failed to scrape because of error: ${scrapeResponse.error}`);
    return;
  }
});

function showError(errorMessage) {
  let loaderContainer = document.querySelector(".file-import-loader");
  if (loaderContainer) {
    loaderContainer.innerHTML = `<div class="error">${errorMessage}</div>`;
  }
}

function showMessage(message) {
  let loaderContainer = document.querySelector(".file-import-loader");
  if (loaderContainer) {
    loaderContainer.innerHTML = message;
  }
}

async function sendCommand(cmd, args) {
  try {
    return await chrome.runtime.sendMessage({ cmd, args });
  } catch (error) {
    return {
      success: false,
      error: `Failed to process command because of error: ${error.message}`
    };
  }
}

const actions = {
  flushData: async (args) => {
    args = args || {};

    if (args.flushToFile) {
      window.dispatchEvent(
        new CustomEvent("download-scraped-data", {
          detail: {
            data: args.data
          }
        })
      );
      showMessage("Done scraping profiles.");
      return;
    }

    if (args.reset) {
      employeeList = [];
      companyList = [];
    }

    let crawlResultContainer = document.querySelector(".crawl-result-container");
    let newCompanyList = args.companies || [];
    let newEmployeeList = args.employees || [];

    for (let employee of newEmployeeList) {
      if (employee?.public_url && employee?.public_id) {
        employeeList.push(employee);
      } else {
        console.log(`Employee with ID ${employee?.public_id || "undefined"} was missing a public_url`);
      }
    }

    for (let company of newCompanyList) {
      if (company?.company_id && company?.company_name) {
        // Create LinkedIn URL for the company using universal_name if available, otherwise company_id
        let urlPath = company.universal_name || company.company_id;
        let companyUrl = `https://www.linkedin.com/company/${urlPath}`;
        let companyWithUrl = {
          ...company,
          company_url: companyUrl
        };
        companyList.push(companyWithUrl);
      } else {
        console.log(`Company with ID ${company?.company_id || "undefined"} was missing company_name`);
      }
    }

    if (!employeeList.length && !companyList.length && (args.reset || !args.done)) {
      return;
    }

    window.appEmployeeList = [ ...employeeList ];
    window.appCompanyList = [ ...companyList ];

    console.log("Discovered companies:", newCompanyList);
    console.log("Discovered employees:", newEmployeeList);

    window.dispatchEvent(
      new CustomEvent("import-crawled-data", {
        detail: {
          data: {
            companies: newCompanyList,
            employees: newEmployeeList
          },
          crawlSettings: currentCrawlSettings,
          done: args.done
        }
      })
    );
    
    if (crawlResultContainer) {
      crawlResultContainer.innerHTML = `
        <b>Discovered employees (${employeeList.length}) [<a href="javascript: textToCopy = document.querySelector('.importer-discovered-employees-raw')?.textContent; if (textToCopy != null) { navigator.clipboard.writeText(textToCopy).catch(err => console.error('Failed to copy: ' + err.message)); }">copy</a>]:</b>
        <div class="importer-discovered-employees-container">
          <div class="importer-discovered-employees">
            ${
              employeeList.length ? employeeList.map(employee => `<a href="${employee.public_url}" target="_blank">${employee.public_url}</a>`).join("<br>") : "None found."
            }
          </div>
        </div>
        <div class="importer-discovered-employees-raw" style="display: none;">${employeeList.length ? employeeList.map(employee => employee.public_url).join("\n") : ""}</div>

        <b>Discovered companies (${companyList.length}) [<a href="javascript: textToCopy = document.querySelector('.importer-discovered-companies-raw')?.textContent; if (textToCopy != null) { navigator.clipboard.writeText(textToCopy).catch(err => console.error('Failed to copy: ' + err.message)); }">copy</a>]:</b>
        <div class="importer-discovered-companies-container">
          <div class="importer-discovered-companies">
            ${
              companyList.length ? companyList.map(company => `<a href="${company.company_url}" target="_blank">${company.company_name}</a>`).join("<br>") : "None found."
            }
          </div>
        </div>
        <div class="importer-discovered-companies-raw" style="display: none;">${companyList.length ? companyList.map(company => company.company_url).join("\n") : ""}</div>
      `;
    }

    if (args.done) {
      showMessage("Done crawling. Please keep the modal open and this tab active while the data is imported...");
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    let currentAction = actions[message.cmd];
    if (currentAction) {
      try {
        let result = await currentAction(message.args || {});
        sendResponse({ success: true, result });
      } catch (error) {
        let errorMessage = `Importer action failed because of error: ${error.message}`;
        sendResponse({ success: false, error: errorMessage });
      }
    }
  })();
  return true;
});