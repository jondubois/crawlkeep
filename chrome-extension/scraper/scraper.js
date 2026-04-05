import {
  fetchCompanyIdFromUniversalName,
  fetchCompanyIdFromName,
  fetchSpecificCompanyEmployees,
  fetchCompanyProfile,
  fetchEmployeeFullProfile,
  fetchIndustryIds,
  fetchEmployeeProfile,
  fetchAIRatePerson,
  fetchAIRateCompany,
  fetchAIComputeCategoryEmbeddings,
  computeFromTemplate
} from "../scraping-utils.js";

import {
  countryCodeNames
} from "../country-codes.js";

console.log("Extension scraper is ready.");

let scrapeId = 0;
let isCrawlReset = false;
let companyCacheMap = new Map();
let employeeCacheMap = new Map();
let companyFringeList = [];
let seedCompanyCategoryEmbeddings = null;
let companyAIPromptEmbeddings = null;

const actions = {
  startScrape: async (args) => {
    isCrawlReset = false;
    let currentScrapeId = ++scrapeId;
    console.log("Scrape started!", args);

    let parserConfig = args.parserConfig || {};
    let iterationPauseDuration = args.iterationPauseDuration ?? 1000;
    let iterationPauseRandomness = args.iterationPauseRandomness ?? 1000;
    let pauseProbability = args.pauseProbability ?? .1;

    (async () => {
      if (args.scrapeType === "employees") {
        let options = {
          profileIds: args.profileIds,
          iterationPauseDuration,
          iterationPauseRandomness
        };
        try {
          let employees = await scrapeEmployees(options, parserConfig);
          await flushData({
            flushToFile: true,
            data: {
              employees,
              companies: []
            }
          });
          console.log("Done scraping!");
        } catch (error) {
          let errorMessage = `Failed to fetch employees because of error: ${error.message}`;
          console.error(errorMessage);
          await flushError(errorMessage);
        }
        return;
      }

      try {
        let depth = args.depth ?? 1;
        let breadth = args.breadth ?? 30;
        let maxFringeListSize = args.maxFringeListSize ?? 1000;

        let industry = args.industry || null;
        let companyIds = args.companyIds || [];

        let cleanCompanyIds = [];

        for (let rawCompanyIdentifier of companyIds) {
          if (Number(rawCompanyIdentifier).toString() === rawCompanyIdentifier) {
            cleanCompanyIds.push(rawCompanyIdentifier);
            continue;
          }

          let companyName;
          let urlMatches = rawCompanyIdentifier.match(/^https?:\/\/.*\/company\/([^\/]+)/);

          if (urlMatches) {
            companyName = urlMatches[1];
          } else {
            companyName = rawCompanyIdentifier;
          }

          let companyNameMatches = rawCompanyIdentifier.match(/^["'](.+)["']$/);
          if (companyNameMatches) {
            let companyNameText = companyNameMatches[1];
            let cleanId = await fetchCompanyIdFromName({ company_name: companyNameText }, parserConfig);
            cleanCompanyIds.push(cleanId);
          } else {
            let universalName = companyName;
            let cleanId = await fetchCompanyIdFromUniversalName({ universal_name: universalName }, parserConfig);
            cleanCompanyIds.push(cleanId);
          }

          if (currentScrapeId !== scrapeId) return;

          if (Math.random() < pauseProbability) {
            await new Promise(resolve => setTimeout(resolve, iterationPauseDuration + Math.round(Math.random() * iterationPauseRandomness)));
          }
        }

        companyIds = ([ ...new Set(cleanCompanyIds) ])
          .filter(companyId => companyId && (typeof companyId === "string" || typeof companyId === "number"));
        console.log(`Starting crawl from company IDs: ${companyIds.join(', ')}`);

        // Store the original seed company IDs for onlyEmployees filtering
        let seedCompanyIds = new Set(companyIds);

        if (args.crawlResume) {
          console.log("Resuming crawl...");
          // Compute embeddings if not already cached
          if (!seedCompanyCategoryEmbeddings) {
            let seedCompanies = [];
            for (let seedCompanyId of seedCompanyIds) {
              let seedCompany = companyCacheMap.get(seedCompanyId);
              if (seedCompany && seedCompany.company_name) {
                seedCompanies.push(seedCompany);
              }
            }
            if (seedCompanies.length > 0) {
              try {
                let categories = seedCompanies.map(seedCompany => {
                  let companyName = seedCompany.company_name || '';
                  let description = seedCompany.company_description || '';
                  let specialities = seedCompany.specialities || '';
                  return {
                    name: companyName,
                    category: `${companyName} ${description} ${specialities}`.trim()
                  };
                });
                console.log(`Computing embeddings for ${categories.length} seed companies...`);
                seedCompanyCategoryEmbeddings = await fetchAIComputeCategoryEmbeddings(parserConfig.aiComputeCategoryEmbeddingsURL, categories);
                console.log(`Computed ${seedCompanyCategoryEmbeddings.length} category embeddings`);
              } catch (error) {
                console.error(`Failed to compute seed company embeddings: ${error.message}`);
              }
            }
          }
        } else {
          companyCacheMap = new Map();
          employeeCacheMap = new Map();

          // Pre-populate companyCacheMap with provided company data
          if (args.companyCache && typeof args.companyCache === 'object') {
            for (let [ companyId, companyData ] of Object.entries(args.companyCache)) {
              companyCacheMap.set(companyId, companyData);
              console.log(`Pre-loaded company ${companyId} into cache:`, companyData);
            }
          }

          // Pre-populate employeeCacheMap with provided employee data
          if (args.employeeCache && typeof args.employeeCache === 'object') {
            for (let [ profileUrn, employeeData ] of Object.entries(args.employeeCache)) {
              employeeCacheMap.set(profileUrn, employeeData);
              console.log(`Pre-loaded employee ${employeeData.public_id} into cache:`, employeeData);
            }
          }

          companyFringeList = companyIds.map((companyId) => {
            let companyInfo = {
              company_id: companyId,
              discoveryRounds: 0,
              pastEmployees: new Map(),
              potentialEmployees: new Map(),
              matchedEmployees: new Map()
            };

            // Extend with cached company data if available
            let cachedCompany = companyCacheMap.get(companyId);
            if (cachedCompany) {
              for (let [ key, value ] of Object.entries(cachedCompany)) {
                companyInfo[key] = value;
              }
            }

            return companyInfo;
          });
          await flushCrawlData([], [], false, true);
          
          // Pre-scrape seed companies if this is a 'From companies' crawl
          if (args.scrapeSeeds && companyIds.length > 0) {
            console.log(`Pre-scraping ${companyIds.length} seed companies...`);
            await scrapeSeedCompanies(companyIds, parserConfig, currentScrapeId, iterationPauseDuration, iterationPauseRandomness, pauseProbability, args);
            if (currentScrapeId !== scrapeId) return;
          }

          // Compute category embeddings once from seed companies
          seedCompanyCategoryEmbeddings = null;
          let seedCompanies = [];
          for (let seedCompanyId of seedCompanyIds) {
            let seedCompany = companyCacheMap.get(seedCompanyId);
            if (seedCompany && seedCompany.company_name) {
              seedCompanies.push(seedCompany);
            }
          }
          if (seedCompanies.length > 0) {
            try {
              let categories = seedCompanies.map(seedCompany => {
                let companyName = seedCompany.company_name || '';
                let description = seedCompany.company_description || '';
                let specialities = seedCompany.specialities || '';
                return {
                  name: companyName,
                  category: `${companyName} ${description} ${specialities}`.trim()
                };
              });
              console.log(`Computing embeddings for ${categories.length} seed companies...`);
              seedCompanyCategoryEmbeddings = await fetchAIComputeCategoryEmbeddings(parserConfig.aiComputeCategoryEmbeddingsURL, categories);
              console.log(`Computed ${seedCompanyCategoryEmbeddings.length} category embeddings`, seedCompanyCategoryEmbeddings);
            } catch (error) {
              console.error(`Failed to compute seed company embeddings: ${error.message}`);
            }
          }
        }

        // Compute category embeddings for company AI prompts
        companyAIPromptEmbeddings = null;
        if (args.companyAIPrompts && args.companyAIPrompts.length > 0) {
          try {
            console.log(`Computing embeddings for ${args.companyAIPrompts.length} company AI prompts...`);
            companyAIPromptEmbeddings = await fetchAIComputeCategoryEmbeddings(parserConfig.aiComputeCategoryEmbeddingsURL, args.companyAIPrompts);
            console.log(`Computed ${companyAIPromptEmbeddings.length} company AI prompt embeddings`, companyAIPromptEmbeddings);
          } catch (error) {
            console.error(`Failed to compute company AI prompt embeddings: ${error.message}`);
          }
        }

        // Score seed companies if we have any embeddings
        if (companyFringeList.length > 0 && (seedCompanyCategoryEmbeddings || companyAIPromptEmbeddings)) {
          try {
            console.log(`Scoring ${companyFringeList.length} seed companies...`);
            await updateCompanyAIScores(companyFringeList, seedCompanyCategoryEmbeddings, args);
            console.log(`Scored seed companies`);
          } catch (error) {
            console.error(`Failed to score seed companies: ${error.message}`);
          }
        }

        let industryIds;
        if (industry) {
          industryIds = await fetchIndustryIds({ keywords: industry }, parserConfig);
          if (!industryIds?.length) {
            throw new Error(`Could not find any valid industry for the query: ${industry}`);
          }
        } else {
          industryIds = [];
        }
        // Do not allow more than 10 industries at once.
        industryIds = industryIds
          .slice(0, 10)
          .filter(industryId => typeof industryId === "string" || typeof industryId === "number");

        let rawCombinedRegexes = [ ...args.tagRegexes ];
        if (args.primaryKeyword) {
          rawCombinedRegexes.push(args.primaryKeyword);
        }
        let headlineRegExpList = rawCombinedRegexes.map(regex => new RegExp(regex, "i"));
        // TODO: Apply locations regexes before sending back data.
        // let locationRegExpList = (args.locationRegexes || []).map(regex => new RegExp(regex, "i"));

        for (let i = 0; i < depth; i++) {
          sortCompanyList(companyFringeList, args);
          companyFringeList = companyFringeList.slice(0, maxFringeListSize);

          let topCompanies = companyFringeList.slice(0, breadth);

          let topCompanyIds = topCompanies.map(companyInfo => companyInfo.company_id);
          console.log(`Round #${i} - Fetching employees for ${topCompanyIds.length} companies: ${topCompanyIds.join(", ")}`);

          console.log('Fringe list:', companyFringeList);

          if (topCompanies.length) {
            let topScore = computeCompanyScore(topCompanies[0], args);
            let bottomScore = computeCompanyScore(topCompanies[topCompanies.length - 1], args);
            console.log(`Top scores are between ${topScore} and ${bottomScore}`);
          }

          let employees = [];

          for (let topCompany of topCompanies) {
            
            if (currentScrapeId !== scrapeId) break;

            try {
              let companyName = topCompany.company_name || companyCacheMap.get(topCompany.company_id)?.company_name || "Unknown";
              console.log(`Fetching page ${topCompany.discoveryRounds} of employees for company ${topCompany.company_id} with name ${companyName}`);

              let aiScoreThreshold = args.aiScoreThreshold ?? 0.5;
              let employeeFetchCount = (topCompany.aiScore != null && topCompany.aiScore >= aiScoreThreshold) ? 5 : 1;

              let result = await fetchSpecificCompanyEmployees({
                keywords: args.primaryKeyword || "",
                company_ids: [ topCompany.company_id ],
                industry_ids: industryIds,
                start: topCompany.discoveryRounds * employeeFetchCount,
                count: employeeFetchCount
              }, parserConfig);

              let companyEmployees = result?.data || [];
              
              // TODO 0: Enforce size limits on all maps and lists.
              for (let employee of companyEmployees) {
                topCompany.potentialEmployees.set(employee.profile_urn, employee);
              }
              topCompany.discoveryRounds++;
              employees.push(...companyEmployees);
              
              console.log(`Fetched ${companyEmployees.length} employees for company ${topCompany.company_id} with name ${companyName}`);
            } catch (error) {
              console.error(`Failed to fetch company employees for company ${topCompany.company_id} because of error: ${error.message}`);
              continue;
            }

            if (Math.random() < pauseProbability) {
              await new Promise(resolve => setTimeout(resolve, iterationPauseDuration + Math.round(Math.random() * iterationPauseRandomness)));
            }
          }

          employees = employees.filter(getValidEmployeeFilter());

          if (currentScrapeId !== scrapeId) break;

          try {
            await updateEmployeeAIScores(employees, args);
          } catch (error) {
            console.error(`Failed to update employee minicard scores because of error: ${error.message}`);
            continue;
          }

          if (currentScrapeId !== scrapeId) break;
          
          sortEmployeeList(employees, args);
          employees = employees.slice(0, breadth);

          if (currentScrapeId !== scrapeId) break;
          if (!employees.length) break;

          let qualifiedEmployees;
          if (headlineRegExpList.length) {
            qualifiedEmployees = employees.filter(
              employee => headlineRegExpList.some(regExp => employee?.headline?.match(regExp)) || employee.aiScore >= (args.aiScoreThreshold ?? 0.5)
            );
          } else {
            qualifiedEmployees = employees;
          }

          if (qualifiedEmployees.length) {
            let companyPastEmployees = {};
            let roundJobs = [];
            let roundMatchedEmployees = {};
            let companyDataMap = {};

            console.log(`Matched ${qualifiedEmployees.length} employees: ${qualifiedEmployees.map(employee => employee.public_id).join(", ")}`);

            try {
              for (let employee of qualifiedEmployees) {
                await extendEmployeeDetails(employee, parserConfig);
                let jobs = employee.jobs || [];
                roundJobs.push(...jobs);

                for (let job of jobs) {
                  let companyId = job.job_company_id;
                  // Extract all available company information from the job
                  if (companyId && !companyDataMap[companyId]) {
                    companyDataMap[companyId] = {
                      company_id: companyId,
                      company_name: job.job_company_name,
                      company_description: job.job_company_description,
                      hq_region: job.job_company_hq_region,
                      company_linkedin_url: job.job_company_linkedin_url
                    };
                    // Add to cache if not already present, but mark as partial data
                    if (!companyCacheMap.has(companyId)) {
                      companyCacheMap.set(companyId, {
                        ...companyDataMap[companyId],
                        isPartial: true  // Flag to indicate this is from job data, not full profile
                      });
                    }
                  }
                  if (job.job_is_current) {
                    if (!roundMatchedEmployees[companyId]) {
                      roundMatchedEmployees[companyId] = {};
                    }
                    roundMatchedEmployees[companyId][employee.profile_urn] = employee;
                  } else {
                    if (!companyPastEmployees[companyId]) {
                      companyPastEmployees[companyId] = {};
                    }
                    companyPastEmployees[companyId][employee.profile_urn] = employee;
                  }
                }
              }
            } catch (error) {
              console.error(`Failed to fetch details of employees because of error: ${error.message}`);
              continue;
            }

            try {
              await updateEmployeeAIScores(qualifiedEmployees, args);
            } catch (error) {
              console.error(`Failed to update employee profile scores because of error: ${error.message}`);
              continue;
            }

            let fringeCompanyIdSet = new Set();

            // Update existing companies in the fringe list.
            for (let companyInfo of companyFringeList) {
              fringeCompanyIdSet.add(companyInfo.company_id);
              let employeeEntries = Object.entries(roundMatchedEmployees[companyInfo.company_id] || {});
              for (let [ employeeURN, employee ] of employeeEntries) {
                companyInfo.matchedEmployees.set(employeeURN, employee);
              }
            }

            let untraversedCompanyIds = [
              ...new Set(
                roundJobs
                  .filter(job => !job.job_is_current)
                  .map(job => job.job_company_id)
                  .filter(
                    (companyId) => companyId && (typeof companyId === "string" || typeof companyId === "number") && !fringeCompanyIdSet.has(companyId)
                  )
              )
            ];

            // Only add new companies to fringe list if onlyEmployees is not enabled
            if (!args.onlyEmployees) {
              console.log(`Identified ${untraversedCompanyIds.length} new companies to traverse`);
              let newCompanies = [];
              for (let newCompanyId of untraversedCompanyIds) {
                let employeeEntries = Object.entries(companyPastEmployees[newCompanyId] || {});
                let companyData = companyDataMap[newCompanyId] || {};

                let newCompany = {
                  company_id: newCompanyId,
                  company_name: companyData.company_name,
                  company_description: companyData.company_description,
                  hq_region: companyData.hq_region,
                  company_linkedin_url: companyData.company_linkedin_url,
                  discoveryRounds: 0,
                  pastEmployees: new Map(employeeEntries),
                  potentialEmployees: new Map(),
                  matchedEmployees: new Map()
                };
                newCompanies.push(newCompany);
                companyFringeList.push(newCompany);
              }

              // Score newly added companies with partial data if we have scoring available
              if (newCompanies.length > 0 && (seedCompanyCategoryEmbeddings || companyAIPromptEmbeddings)) {
                try {
                  await updateCompanyAIScores(newCompanies, seedCompanyCategoryEmbeddings, args);
                  console.log(`Scored ${newCompanies.length} newly discovered companies with partial data`);
                } catch (error) {
                  console.error(`Failed to score newly discovered companies: ${error.message}`);
                }
              }
            } else {
              console.log(`Skipping adding new companies to fringe list because onlyEmployees is enabled`);
            }

            let unprofiledCurrentCompanyIds = [
              ...new Set(
                roundJobs
                  .filter(job => job.job_is_current)
                  .map(job => job.job_company_id)
                  .filter(companyId => {
                    if (typeof companyId !== "string" && typeof companyId !== "number") return false;
                    // Allow fetching if company is not in cache OR if it only has partial data
                    let cachedCompany = companyCacheMap.get(companyId);
                    if (cachedCompany && !cachedCompany.isPartial) return false;
                    // When onlyEmployees is true, only fetch profiles for seed companies
                    if (args.onlyEmployees && !seedCompanyIds.has(companyId)) return false;
                    return true;
                  })
              )
            ];

            let discoveredCompanies = [];

            try {
              for (let companyId of unprofiledCurrentCompanyIds) {
                if (currentScrapeId !== scrapeId && isCrawlReset) break;
                console.log(`Fetching profile of company ${companyId}...`);
                let company = await fetchCompanyProfile({ company_id: companyId }, parserConfig);
                sanitizeCompanyProfile(company);
                let companyCacheItem = {
                  ...company,
                  company_id: companyId
                };
                discoveredCompanies.push(companyCacheItem);
                console.log(`Fetched profile for company with ID ${companyId}`, companyCacheItem);
                companyCacheMap.set(companyId, companyCacheItem);
              }
            } catch (error) {
              console.error(`Failed to fetch company profiles because of error: ${error.message}`);
              continue;
            }

            // Score discovered companies using pre-computed embeddings
            if (discoveredCompanies.length > 0 && (seedCompanyCategoryEmbeddings || companyAIPromptEmbeddings)) {
              try {
                await updateCompanyAIScores(discoveredCompanies, seedCompanyCategoryEmbeddings, args);
                console.log(`Updated AI scores for ${discoveredCompanies.length} companies`);
              } catch (error) {
                console.error(`Failed to update company AI scores because of error: ${error.message}`);
              }
            }

            for (let companyInfo of companyFringeList) {
              let companyCacheItem = companyCacheMap.get(companyInfo.company_id);
              if (companyCacheItem) {
                for (let [ key, value ] of Object.entries(companyCacheItem)) {
                  companyInfo[key] = value;
                }
              }
            }

            for (let employee of qualifiedEmployees) {
              for (let job of employee.jobs) {
                if (job.job_start_timestamp != null && job.job_end_timestamp != null) {
                  job.millseconds_in_job = Number(job.job_end_timestamp) - Number(job.job_start_timestamp);
                }
                let companyId = job.job_company_id;
                let company = companyCacheMap.get(companyId);
                if (company) {
                  extendJobWithCompanyData(job, company, parserConfig);
                } else if (companyId && job.job_is_current) {
                  console.warn(`Could not find company details for company ${companyId} of employee ${employee.public_id}`);
                }
              }
              employeeCacheMap.set(employee.profile_urn, employee);
            }

            if (currentScrapeId !== scrapeId && isCrawlReset) break;

            await flushCrawlData(qualifiedEmployees, discoveredCompanies);

            console.log("Flushed employee data.", qualifiedEmployees);
          }

          if (currentScrapeId !== scrapeId && isCrawlReset) break;

          let matchingEmployeeIdSet = new Set(qualifiedEmployees.map(employee => employee.public_id));

          let matchingHeadlines = qualifiedEmployees.map(employee => employee.headline);
          let nonMatchingHeadlines = employees
            .filter(employee => !matchingEmployeeIdSet.has(employee.public_id))
            .map(employee => employee.headline);

          console.log(`Found ${qualifiedEmployees.length} matching employees out of ${employees.length}`, matchingHeadlines, nonMatchingHeadlines);

          if (currentScrapeId !== scrapeId) break;

          await new Promise(resolve => setTimeout(resolve, iterationPauseDuration + Math.round(Math.random() * iterationPauseRandomness)));

          if (currentScrapeId !== scrapeId) break;
        }

        await flushCrawlData([], [], true);
        console.log("Done crawling!", isCrawlReset);

      } catch (error) {
        let errorMessage = `Failed to crawl network because of error: ${error.message}`;
        console.error(errorMessage);
        await flushError(errorMessage);
      }
    })();

    return scrapeId;
  },

  stopScrape: async (args) => {
    scrapeId++;
    isCrawlReset = args?.reset || false;
    let noLog = args?.noLog || false;
    if (!noLog) {
      console.log("Scrape stopped!", args);
    }
  }
};

async function flushCrawlData(employees, companies, done, reset) {
  try {
    await chrome.runtime.sendMessage({
      cmd: "flushData",
      args: {
        employees,
        companies,
        done: done || false,
        reset: reset || false
      }
    });
  } catch (error) {
    console.error(`Failed to flush crawl data because of error: ${error.message}`);
  }
}

async function flushData(args) {
  try {
    await chrome.runtime.sendMessage({
      cmd: "flushData",
      args: args || {}
    });
  } catch (error) {
    console.error(`Failed to flush data because of error: ${error.message}`);
  }
}

async function flushError(errorMessage) {
  try {
    await chrome.runtime.sendMessage({
      cmd: "flushError",
      args: {
        error: errorMessage
      }
    });
  } catch (error) {
    console.error(`Failed to flush error because of error: ${error.message}`);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    let currentAction = actions[message.cmd];
    if (currentAction) {
      try {
        let result = await currentAction(message.args || {});
        sendResponse({ success: true, result });
      } catch (error) {
        let errorMessage = `Scraper action failed because of error: ${error.message}`;
        sendResponse({ success: false, error: errorMessage });
      }
    }
  })();
  return true;
});

function computeCompanySizeScore(companyInfo, options) {
  let { companySizeTarget, companySizeFactor } = options;
  if (companyInfo.employee_count == null) return .5;
  let scaleFactor = 1000;
  return companySizeFactor * Math.min(
    (scaleFactor - Math.abs(companySizeTarget - companyInfo.employee_count)) / scaleFactor,
    1
  );
}

function computeRegexScore(value, regexes) {
  value = value || "";
  regexes = regexes || [];
  let scoreSum = regexes.reduce((sum, regex) => sum + (value.match(regex) ? 1 : 0), 0);
  return regexes.length ? scoreSum / regexes.length : 0;
}

async function updateEmployeeAIScores(employees, options) {
  let { parserConfig, aiPrompts } = options;

  if (!aiPrompts || !aiPrompts.length) {
    return;
  }

  for (let employee of employees) {
    let employeePromptScores = await fetchAIRatePerson(parserConfig.aiRatePersonURL, employee, aiPrompts);
    let scoreSum = 0;
    for (let promptScore of employeePromptScores) {
      scoreSum += promptScore.score;
    }
    let scoreAvg = employeePromptScores.length ? scoreSum / employeePromptScores.length : 0;
    employee.aiScore = scoreAvg;
  }
}

function softmax(arr, temperature = 1) {
  let exponentials = arr.map(x => Math.exp(x / temperature));
  let sum = exponentials.reduce((acc, val) => acc + val, 0);
  let probabilities = exponentials.map(exp => exp / sum);
  return probabilities.reduce((acc, prob, i) => acc + prob * arr[i], 0);
}

async function updateCompanyAIScores(companies, seedCompanyEmbeddings, options) {
  let { parserConfig } = options;

  let hasSeedEmbeddings = seedCompanyEmbeddings && seedCompanyEmbeddings.length > 0;
  let hasPromptEmbeddings = companyAIPromptEmbeddings && companyAIPromptEmbeddings.length > 0;

  if (!hasSeedEmbeddings && !hasPromptEmbeddings) {
    return;
  }

  let companyScores = {};

  for (let company of companies) {
    let seedAIScore = 0;
    let promptAIScore = 0;

    // Compute seed company similarity scores
    if (hasSeedEmbeddings) {
      let companyScores = await fetchAIRateCompany(parserConfig.aiRateCompanyURL, company, seedCompanyEmbeddings);
      let scores = companyScores.map(s => s.score);
      seedAIScore = scores.length ? softmax(scores) : 0;
    }

    // Compute company AI prompt scores
    if (hasPromptEmbeddings) {
      let promptScores = await fetchAIRateCompany(parserConfig.aiRateCompanyURL, company, companyAIPromptEmbeddings);
      let promptScoreValues = promptScores.map(s => s.score);
      promptAIScore = promptScoreValues.length ? softmax(promptScoreValues) : 0;
    }

    // Combine scores (average them if both exist, otherwise use whichever is available)
    let combinedAIScore;
    if (hasSeedEmbeddings && hasPromptEmbeddings) {
      combinedAIScore = (seedAIScore + promptAIScore) / 2;
    } else {
      combinedAIScore = seedAIScore + promptAIScore;
    }

    company.aiScore = combinedAIScore;
    if (company.company_id) {
      companyScores[company.company_id] = combinedAIScore;
    }
  }

  return companyScores;
}

function computeEmployeeScore(employee, options) {
  let aiFactor = options.employeeAIFactor ?? 1;
  let regexScore = computeEmployeeRegexScore(employee, options);
  employee.crawlScore = regexScore + (employee.aiScore || 0) * aiFactor;
  return employee.crawlScore;
}

function computeEmployeeRegexScore(employee, options) {
  let {
    tagRegexes,
    locationRegexes,
    primaryKeyword,
    secondaryKeyword,
    currentJobFactor,
    pastJobFactor,
    skillFactor,
    locationFactor
  } = options;
  currentJobFactor = currentJobFactor ?? .5;
  pastJobFactor = pastJobFactor ?? .5;
  skillFactor = skillFactor ?? .5;
  locationFactor = locationFactor ?? .5;

  tagRegexes = tagRegexes.map(regex => new RegExp(regex, "i"));
  locationRegexes = locationRegexes.map(regex => new RegExp(regex, "i"));

  let combinedRegexes = [ ...tagRegexes ];
  if (primaryKeyword) {
    combinedRegexes.push(
      new RegExp(primaryKeyword, "i")
    );
  }
  if (secondaryKeyword) {
    combinedRegexes.push(
      new RegExp(secondaryKeyword, "i")
    );
  }

  let headlineScore = currentJobFactor * computeRegexScore(employee.headline, combinedRegexes);
  let pastJobsString = (employee.jobs || [])
    .filter(job => !job.job_is_current && typeof job.job_title === "string")
    .map(job => job.job_title).join(", ");
  let pastJobsScore = pastJobFactor * computeRegexScore(pastJobsString, combinedRegexes);
  let skillsScore = skillFactor * computeRegexScore((employee.skills || []).join(", "), combinedRegexes);
  let locationString = ([ employee.location, employee.country ]).filter(Boolean).join(", ");
  let locationScore = locationFactor * computeRegexScore(locationString, locationRegexes);

  return headlineScore + pastJobsScore + skillsScore + locationScore;
}

function computeCompanyEmployeesScore(companyInfo, options) {
  let { pastEmployees, potentialEmployees, matchedEmployees } = companyInfo;
  let employeeList = [ ...matchedEmployees.values() ];
  let potentialEmployeeList = [ ...potentialEmployees.values() ];
  let pastEmployeeList = [ ...pastEmployees.values() ];
  let potScoreSum = 0;
  for (let potEmployee of potentialEmployeeList) {
    if (potEmployee.profile_urn && !matchedEmployees.has(potEmployee.profile_urn)) {
      potScoreSum += computeEmployeeScore(potEmployee, options);
    }
  }
  let potScore = potentialEmployeeList.length ? potScoreSum / potentialEmployeeList.length : 0;
  let employeeScoreSum = employeeList.reduce((sum, employee) => {
    return sum + computeEmployeeScore(employee, options);
  }, 0);
  let employeeScore = employeeList.length ? employeeScoreSum / employeeList.length : 0;

  let pastEmployeeScoreSum = pastEmployeeList.reduce((sum, employee) => {
    return sum + computeEmployeeScore(employee, options);
  }, 0);
  let pastEmployeeScore = pastEmployeeList.length ? pastEmployeeScoreSum / pastEmployeeList.length : 0;

  return (employeeScore * 4 + potScore + pastEmployeeScore * 2) / 7;
}

function computeCompanyDiscoveryScore(companyInfo, options) {
  let { explorationFactor } = options;
  explorationFactor = explorationFactor ?? .5;
  return -explorationFactor * (companyInfo.discoveryRounds || 0);
}

function computeCompanyScore(companyInfo, options) {
  let companyAIFactor = options.companyAIFactor ?? 1;
  let companyUndiscoveredScore = computeCompanyDiscoveryScore(companyInfo, options);
  let companyRegexScore = computeCompanyEmployeesScore(companyInfo, options);
  let companySizeScore = computeCompanySizeScore(companyInfo, options);
  let companyAIScore = (companyInfo.aiScore || 0) * companyAIFactor;
  companyInfo.crawlScore = companyRegexScore + companySizeScore + companyAIScore;
  companyInfo.currentCrawlScore = companyUndiscoveredScore + companyInfo.crawlScore;
  return companyInfo.currentCrawlScore;
}

function sortCompanyList(companyList, options) {
  companyList.sort((companyInfoA, companyInfoB) => {
    let companyScoreA = computeCompanyScore(companyInfoA, options);
    let companyScoreB = computeCompanyScore(companyInfoB, options)
    return companyScoreB - companyScoreA;
  });
}

function sortEmployeeList(employeeList, options) {
  let { explorationFactor } = options;
  explorationFactor = explorationFactor ?? .5;
  // TODO 0: Take company score into account when scoring employees as the list of employees for
  // any given iteration may include employees from multiple top companies.
  employeeList.sort((employeeA, employeeB) => {
    let employeeUndiscoveredScoreA = employeeA.jobs == null ? explorationFactor : 0;
    let employeeRegexScoreA = computeEmployeeScore(employeeA, options);
    let employeeScoreA = employeeUndiscoveredScoreA + employeeRegexScoreA;
    
    let employeeUndiscoveredScoreB = employeeB.jobs == null ? explorationFactor : 0;
    let employeeRegexScoreB = computeEmployeeScore(employeeB, options);
    let employeeScoreB = employeeUndiscoveredScoreB + employeeRegexScoreB;

    return employeeScoreB - employeeScoreA;
  });
}

async function extendEmployeeDetails(employee, parserConfig) {
  let employeeDetails = await fetchEmployeeFullProfile(employee, parserConfig);
  let { summary } = employeeDetails.filter(info => info.type === "summary").map((info) => {
    let { type, ...otherFields } = info || {};
    return otherFields;
  })[0] || {};
  let jobs = employeeDetails.filter(info => info.type === "experience").map((info) => {
    let { type, ...otherFields } = info || {};
    return otherFields;
  });
  let educations = employeeDetails.filter(info => info.type === "education").map((info) => {
    let { type, ...otherFields } = info || {};
    if (otherFields.edu_start_timestamp != null) {
      otherFields.edu_start_year = (new Date(Number(otherFields.edu_start_timestamp))).getFullYear();
      delete otherFields.edu_start_timestamp;
    }
    if (otherFields.edu_end_timestamp != null) {
      otherFields.edu_end_year = (new Date(Number(otherFields.edu_end_timestamp))).getFullYear();
      delete otherFields.edu_end_timestamp;
    }
    return otherFields;
  });
  let skillsList = employeeDetails.filter(info => info.type === "skills").map((info) => {
    let { type, ...otherFields } = info || {};
    return otherFields;
  });
  let skills = skillsList.flatMap(info => (info?.skills || "").split(" • "));
  employee.skills = skills.map(skillInfo => skillInfo.skill) || [];
  employee.edus = educations || [];
  employee.jobs = jobs || [];
  if (summary) {
    employee.summary = summary;
  }
}

function extendJobWithCompanyData(job, company, parserConfig) {
  if (!job) return;
  job.job_company_name = company.company_name;
  job.job_company_description = company.company_description;
  job.job_company_hq_region = company.hq_region;
  job.job_company_linkedin_url = computeFromTemplate(parserConfig.params.companyURL, { company_id: job.job_company_id });
}

function sanitizeCompanyProfile(company) {
  if (company) {
    company.hq_country = countryCodeNames[company.hq_country] || company.hq_country;
    company.hq_region = company.hq_country;
  }
}

async function scrapeEmployees(options, parserConfig) {
  let {
    profileIds,
    iterationPauseDuration,
    iterationPauseRandomness
  } = options;

  let employeeList = [];

  for (let id of profileIds) {
    let employees = await fetchEmployeeProfile({ public_id: id }, parserConfig);
    let employee = employees?.[0];
    if (!employee) {
      console.warn(`Failed to fetch employee with ID ${id}`);
      continue;
    };
    await extendEmployeeDetails(employee, parserConfig);
    let jobs = employee.jobs || [];
    for (let job of jobs) {
      let companyId = job.job_company_id;
      if (!companyId) continue;
      let company = companyCacheMap.get(companyId);
      if (!company) {
        company = await fetchCompanyProfile({ company_id: companyId }, parserConfig);
        if (company) {
          sanitizeCompanyProfile(company);
          companyCacheMap.set(companyId, company);
        } else {
          companyCacheMap.set(companyId, {});
        }
      }
      if (job && company) {
        extendJobWithCompanyData(job, company, parserConfig);
      }
    }
    employeeList.push(employee);

    await new Promise(resolve => setTimeout(resolve, iterationPauseDuration + Math.round(Math.random() * iterationPauseRandomness)));
  }
  return employeeList;
}

function getValidEmployeeFilter() {
  return (employee) => (
    employee &&
    typeof employee.profile_urn === "string" &&
    ((typeof employee.public_id === "string" || typeof employee.public_id === "number") && employee.public_id) &&
    !employeeCacheMap.has(employee.profile_urn)
  );
}

async function scrapeSeedCompanies(companyIds, parserConfig, currentScrapeId, iterationPauseDuration, iterationPauseRandomness, pauseProbability, args) {
  let discoveredCompanies = [];
  let discoveredEmployees = [];

  for (let companyId of companyIds) {
    if (currentScrapeId !== scrapeId) break;

    console.log(`Scraping seed company ${companyId} profile and employees...`);

    let companyDiscoveredCompanies = [];
    let companyDiscoveredEmployees = [];

    try {
      // Fetch company profile
      let company = await fetchCompanyProfile({ company_id: companyId }, parserConfig);
      if (company) {
        sanitizeCompanyProfile(company);
        let companyCacheItem = {
          ...company,
          company_id: companyId
        };
        discoveredCompanies.push(companyCacheItem);
        companyDiscoveredCompanies.push(companyCacheItem);
        companyCacheMap.set(companyId, companyCacheItem);
        console.log(`Scraped seed company profile for ${companyId}`, companyCacheItem);
      }

      // Fetch employees for this seed company with pagination loop
      let allEmployees = [];
      let allQualifiedEmployees = [];
      let seedEmployeesCount = args.seedEmployeesCount || 1;
      let breadth = args.breadth || 30;
      let maxPages = 3;

      try {
        for (let page = 0; page < maxPages; page++) {
          if (currentScrapeId !== scrapeId) break;

          // If this is the last iteration and no qualified employees found, try without primaryKeyword
          let useKeywords = (page === maxPages - 1 && allQualifiedEmployees.length === 0) ? "" : (args.primaryKeyword || "");

          if (page === maxPages - 1 && allQualifiedEmployees.length === 0 && args.primaryKeyword) {
            console.log(`No qualified employees found for seed company ${companyId}, trying fallback without primaryKeyword...`);
          }

          let result = await fetchSpecificCompanyEmployees({
            keywords: useKeywords,
            company_ids: [ companyId ],
            industry_ids: [],
            start: page * breadth,
            count: breadth
          }, parserConfig);

          let employees = (result.data || []).filter(getValidEmployeeFilter());

          if (employees.length === 0) {
            console.log(`No employees found for seed company ${companyId} at page ${page}`);
            continue;
          }

          allEmployees.push(...employees);

          // Update AI scores if needed
          if (args.aiPrompts && args.aiPrompts.length > 0) {
            await updateEmployeeAIScores(employees, args);
          }

          // Filter qualified employees
          let headlineRegExpList = (args.tagRegexes || []).map(regex => new RegExp(regex, "i"));
          if (args.primaryKeyword) {
            headlineRegExpList.push(new RegExp(args.primaryKeyword, "i"));
          }

          let qualifiedEmployees;
          if (headlineRegExpList.length) {
            qualifiedEmployees = employees.filter(
              employee => headlineRegExpList.some(regExp => employee?.headline?.match(regExp)) || (employee.aiScore || 0) >= (args.aiScoreThreshold ?? 0.5)
            );
          } else {
            qualifiedEmployees = employees;
          }

          allQualifiedEmployees.push(...qualifiedEmployees);

          console.log(`Page ${page}: Found ${employees.length} employees, ${qualifiedEmployees.length} qualified for seed company ${companyId}`);

          // Check if we have enough best employees
          if (allQualifiedEmployees.length >= seedEmployeesCount) {
            console.log(`Found sufficient qualified employees (${allQualifiedEmployees.length}) for seed company ${companyId}, stopping at page ${page}`);
            break;
          }

          // Add small delay between pages
          if (page < maxPages - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Select the top employees for this seed company based on seedEmployeesCount
        if (allQualifiedEmployees.length > 0) {
          allQualifiedEmployees.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
          let selectedEmployees = allQualifiedEmployees.slice(0, seedEmployeesCount);

          for (let selectedEmployee of selectedEmployees) {
            await extendEmployeeDetails(selectedEmployee, parserConfig);

            let jobs = selectedEmployee.jobs || [];
            for (let job of jobs) {
              if (job.job_start_timestamp != null && job.job_end_timestamp != null) {
                job.millseconds_in_job = Number(job.job_end_timestamp) - Number(job.job_start_timestamp);
              }
              let jobCompanyId = job.job_company_id;
              let jobCompany = companyCacheMap.get(jobCompanyId);
              if (jobCompany) {
                extendJobWithCompanyData(job, jobCompany, parserConfig);
              }
            }
            employeeCacheMap.set(selectedEmployee.profile_urn, selectedEmployee);

            discoveredEmployees.push(selectedEmployee);
            companyDiscoveredEmployees.push(selectedEmployee);
          }
          console.log(`Selected top ${selectedEmployees.length} employees from ${allQualifiedEmployees.length} qualified employees for seed company ${companyId}`);
        }
      } catch (error) {
        console.error(`Failed to fetch employees for seed company ${companyId}: ${error.message}`);
      }

    } catch (error) {
      console.error(`Failed to scrape seed company ${companyId}: ${error.message}`);
    }

    // Flush data for this company and its employees immediately
    if (companyDiscoveredCompanies.length > 0 || companyDiscoveredEmployees.length > 0) {
      console.log(`Flushing ${companyDiscoveredCompanies.length} company profiles and ${companyDiscoveredEmployees.length} employees for seed company ${companyId}...`);
      await flushCrawlData(companyDiscoveredEmployees, companyDiscoveredCompanies, false, false);
    }

    if (currentScrapeId !== scrapeId) break;

    if (Math.random() < pauseProbability) {
      await new Promise(resolve => setTimeout(resolve, iterationPauseDuration + Math.round(Math.random() * iterationPauseRandomness)));
    }
  }

  if (currentScrapeId !== scrapeId) {
    console.log(`Scraping stopped early.`);
    await flushCrawlData([], [], true, false);
  }
}
