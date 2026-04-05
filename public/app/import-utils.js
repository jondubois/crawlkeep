import { config } from './config.js';
import { verifyPersonTags, getCompanyEmployees } from './analytics-utils.js';
import { getRecordIds, getRecords, getRecord, getBatches, DATA_MINER_ADD_TAGS_URL } from './utils.js';
import { countryCodeNames } from './country-codes.js';

const { seniorities, educations } = config;
const ONE_YEAR_MILLIS = 1000 * 60 * 60 * 24 * 366;
const FIVE_YEARS_MILLIS = ONE_YEAR_MILLIS * 5;
const TEN_YEARS_MILLIS = ONE_YEAR_MILLIS * 10;
const MIN_VERIFIED_TAG_SCORE = 2;
const MAX_SEED_COMPANY_PAGES = 10;
const VERIFIED_TAG_SAMPLE_SIZE = MIN_VERIFIED_TAG_SCORE + 1; // Must be greater than MIN_VERIFIED_TAG_SCORE
const ROOT_TAG_ID = 'ac26f98a-6415-43db-ac21-1f83c80122d8';

let importIndex = 0;
let lastUploadedCompanyFileIds = null;

let processedCrawledPersonData = [];
let importedCrawledCompanyMap = new Map();

let fullCompanyProfiles = {};

async function getDataGroupAccountId(serviceSocket, dataGroupId) {
  if (!dataGroupId) {
    throw new Error('Cannot get DataGroup accountId without a dataGroupId');
  }
  let accountId = await serviceSocket.invoke('crud', {
    action: 'read',
    type: 'DataGroup',
    id: dataGroupId,
    field: 'accountId'
  });
  if (!accountId) {
    throw new Error(`DataGroup ${dataGroupId} does not have an accountId`);
  }
  return accountId;
}

export function resetCrawledDataImport() {
  processedCrawledPersonData = [];
  fullCompanyProfiles = {};
  importedCrawledCompanyMap = new Map();
  importIndex++;
}

function resetImportStream() {
  window.dispatchEvent(
    new CustomEvent('reset-crawl-import-stream')
  );
}

export async function importCrawledData(rawData, dataGroupId, serviceSocket, importSettings, loaderSelector) {
  let currentImportIndex = ++importIndex;
  let { importEmptyCompanies } = importSettings || {};

  if (!dataGroupId) {
    updateElementText(loaderSelector, 'Cannot import crawled data without specifying a dataGroupId', 'error');
    return;
  }

  let accountId;
  try {
    accountId = await getDataGroupAccountId(serviceSocket, dataGroupId);
  } catch (error) {
    updateElementText(loaderSelector, `Failed to fetch DataGroup accountId: ${error.message}`, 'error');
    return;
  }

  updateElementStyle(loaderSelector, 'display', 'block');
  updateElementText(loaderSelector, 'Processing crawled data...');

  let companyData = rawData?.companies || [];
  let rawEmployeeBatches = getBatches(rawData?.employees || [], 3);
  let rawEmployeeBatchCount = rawEmployeeBatches.length;

  let personData = [];

  for (let i = 0; i < rawEmployeeBatchCount; i++) {
    let rawBatch = rawEmployeeBatches[i];
    try {
      let processedDataChunk = await processWithDataMiner(rawBatch);
      personData.push(...processedDataChunk);
    } catch (error) {
      let errorMessage = 'Failed to process file due to a formatting issue';
      updateElementText(loaderSelector, errorMessage, 'error');
      return;
    }
  }

  if (importIndex !== currentImportIndex) return;

  await importRecords(
    serviceSocket,
    dataGroupId,
    accountId,
    personData,
    companyData,
    processedCrawledPersonData,
    importedCrawledCompanyMap,
    loaderSelector,
    importEmptyCompanies,
    currentImportIndex,
    false
  );
}

export async function finishImportingCrawledData(serviceSocket, tags, loaderSelector, appRouterSelector) {
  await finalizeImport(serviceSocket, processedCrawledPersonData, importedCrawledCompanyMap, tags, loaderSelector, appRouterSelector, importIndex);
}

export async function importFiles(files, dataGroupId, serviceSocket, importSettings, loaderSelector, appRouterSelector) {
  resetImportStream();
  let currentImportIndex = ++importIndex;
  let { importEmptyCompanies } = importSettings || {};
  let processedPersonData = [];

  if (!dataGroupId) {
    updateElementText(loaderSelector, 'Cannot import files without specifying a dataGroupId', 'error');
    return;
  }

  let accountId;
  try {
    accountId = await getDataGroupAccountId(serviceSocket, dataGroupId);
  } catch (error) {
    updateElementText(loaderSelector, `Failed to fetch DataGroup accountId: ${error.message}`, 'error');
    return;
  }

  if (!isElementVisible(loaderSelector)) return;

  let fileList = Array.from(files);

  if (!fileList.length) return;

  updateElementStyle(loaderSelector, 'display', 'block');
  updateElementText(loaderSelector, 'Pre-processing...');

  let importedCompanyMap = new Map();
  let fileFormats = [];

  for (let file of fileList) {
    let isRawText = false;
    let rawData = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (event) => {
        try {
          let jsonData = JSON.parse(event.target.result);
          resolve(jsonData);
        } catch (error) {
          isRawText = true;
          resolve(event.target.result);
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsText(file);
    });

    if (isRawText) {
      let personProfileURLs = rawData.replace(/\r/g, '').split('\n');
      fetchPersonProfiles(personProfileURLs);
      return;
    }

    let rawDataBatches = getBatches(rawData, 3);
    let rawDataBatchCount = rawDataBatches.length;
    let firstBatch = rawDataBatches[0] || [];

    let isQLIFile = !rawDataBatchCount || firstBatch.every(
      item => item.public_id != null && item.headline != null && item.skills != null
    );
    let isCompanyFile = !isQLIFile && firstBatch.every(item => item.id != null && item.company_name != null);
    let isCompanyIdFile = isCompanyFile && firstBatch.every(item => item.company_name == null);
    if (isCompanyFile) {
      if (isCompanyIdFile) {
        fileFormats.push('cid');
      } else {
        fileFormats.push('cpn');
      }
    } else {
      fileFormats.push('qli');
    }

    let data = [];

    for (let i = 0; i < rawDataBatchCount; i++) {
      let rawBatch = rawDataBatches[i];
      try {
        if (isCompanyIdFile) {
          data.push(...rawBatch.map(item => item.id));
          updateElementText(loaderSelector, `Extracting company IDs: ${Math.round((i + 1) * 100 / rawDataBatchCount)}%`);
        } else if (isCompanyFile) {
          data.push(...rawBatch);
          updateElementText(loaderSelector, `Extracting company data: ${Math.round((i + 1) * 100 / rawDataBatchCount)}%`);
        } else {
          let processedDataChunk = await processWithDataMiner(rawBatch);
          data.push(...processedDataChunk);
          updateElementText(loaderSelector, `Pre-processing: ${Math.round((i + 1) * 100 / rawDataBatchCount)}%`);
        }
      } catch (error) {
        let errorMessage = 'Failed to process file due to a formatting issue';
        updateElementText(loaderSelector, errorMessage, 'error');
        return;
      }
    }

    if (importIndex !== currentImportIndex) return;
    if (!isElementVisible(loaderSelector)) return;

    let personData = [];
    let companyData = [];

    if (isCompanyIdFile) {
      for (let companyId of data) {
        importedCompanyMap.set(companyId, {
          id: companyId,
          publicId: companyId,
          employees: []
        });
      }
      continue;
    } else if (isCompanyFile) {
      companyData = data;
    } else {
      personData = data;
    }

    await importRecords(
      serviceSocket,
      dataGroupId,
      accountId,
      personData,
      companyData,
      processedPersonData,
      importedCompanyMap,
      loaderSelector,
      importEmptyCompanies,
      currentImportIndex,
      true
    );
  }

  let companyData = [ ...importedCompanyMap.values() ];

  if (fileFormats.every(format => format === 'cid')) {
    lastUploadedCompanyFileIds = companyData.map(company => company.publicId);
    await crawlWebFromCompanies(dataGroupId, [ ...lastUploadedCompanyFileIds ], serviceSocket, importSettings, loaderSelector);
    return;
  }
  lastUploadedCompanyFileIds = null;

  let areFileFormatsConsistent = true;
  let firstFormat = fileFormats[0];
  for (let format of fileFormats) {
    if (format !== firstFormat) {
      areFileFormatsConsistent = false;
      break;
    }
  }
  if (!areFileFormatsConsistent) {
    updateElementText(
      loaderSelector,
      'Some files were in a different format and may be skipped.',
      'error'
    );
    return;
  }

  let { tags } = importSettings || {};
  await finalizeImport(serviceSocket, processedPersonData, importedCompanyMap, tags, loaderSelector, appRouterSelector, currentImportIndex);
}

function extendCompanyProfile(company, fullCompanyProfile) {
  fullCompanyProfile = fullCompanyProfile || {};
  company.companyEmployeeCountLow = company.companyEmployeeCountLow ?? fullCompanyProfile.company_employee_count_low ?? undefined;
  company.companyEmployeeCountHigh = company.companyEmployeeCountHigh ?? fullCompanyProfile.company_employee_count_high ?? undefined;
  company.companyName = company.companyName ?? fullCompanyProfile.company_name;
  company.companyDescription = company.companyDescription ?? fullCompanyProfile.company_description ?? undefined;
  company.type = company.type ?? fullCompanyProfile.company_type ?? undefined;
  company.industries = company.industries ?? fullCompanyProfile.industries ?? undefined;
  company.specialities = company.specialities ?? fullCompanyProfile.specialities ?? undefined;
  company.tagline = company.tagline ?? fullCompanyProfile.tagline ?? undefined;
  company.employeeCount = company.employeeCount ?? fullCompanyProfile.employee_count ?? undefined;
  company.parentCompany = company.parentCompany ?? fullCompanyProfile.parent_company ?? undefined;
  company.officeLocations = company.officeLocations ?? fullCompanyProfile.office_locations ?? undefined;
  company.officeCoords = company.officeCoords ?? fullCompanyProfile.office_coords ?? undefined;
  company.hqAddressLine1 = company.hqAddressLine1 ?? fullCompanyProfile.hq_address_line1 ?? undefined;
  company.hqAddressLine2 = company.hqAddressLine2 ?? fullCompanyProfile.hq_address_line2 ?? undefined;
  company.hqCity = company.hqCity ?? fullCompanyProfile.hq_city ?? undefined;
  company.hqGeoArea = company.hqGeoArea ?? fullCompanyProfile.hq_geo_area ?? undefined;
  company.hqPostalCode = company.hqPostalCode ?? fullCompanyProfile.hq_postal_code ?? undefined;
  company.hqCountry = company.hqCountry ?? fullCompanyProfile.hq_country ?? undefined;
  company.universalName = company.universalName ?? fullCompanyProfile.universal_name ?? undefined;
  company.websiteUrl = company.websiteUrl ?? fullCompanyProfile.website_url ?? undefined;
  company.foundedYear = company.foundedYear ?? fullCompanyProfile.founded_year ?? undefined;
  company.aiScore = company.aiScore ?? fullCompanyProfile.aiScore ?? undefined;
  company.crawlScore = company.crawlScore ?? fullCompanyProfile.crawlScore ?? undefined;

  let companyEntries = Object.entries(company);
  for (let [ key, value ] of companyEntries) {
    if (value === undefined) {
      delete company[key];
    }
  }

  if (company.companyEmployeeCountLow !== undefined) {
    company.companyEmployeeCountLow = Number(company.companyEmployeeCountLow);
  }
  if (company.companyEmployeeCountHigh !== undefined) {
    company.companyEmployeeCountHigh = Number(company.companyEmployeeCountHigh);
  }
}

function getEducationLevel(person) {
  for (let { name, regex } of educations) {
    let personEdus = person.edus || [];
    for (let edu of personEdus) {
      if (
        (edu.degree_name && edu.degree_name.match(regex)) ||
        (edu.degree && edu.degree.match(regex))
      ) {
        return name;
      }
    }
  }
  return 'Other';
}

let snakeCaseRegExp = /_(.)/g;

function toCamelCase(string) {
  return string.replace(snakeCaseRegExp, (text, firstChar) => {
    return firstChar.toUpperCase();
  });
}

function flattenValue(value) {
  if (Array.isArray(value)) {
    return value.join('\t');
  }
  return value;
}

function sanitizeResource(resource) {
  return Object.fromEntries(
    Object.entries(resource).map(([key, value]) => [
      toCamelCase(key),
      flattenValue(value),
    ]),
  );
}

function formatOfficeLocations(locations) {
  return (locations || [])
    .map((location) => {
      let countryName = countryCodeNames[location.country];
      if (countryName == null) {
        console.log(`Unknown country code: ${location.country}`);
        return null;
      }
      if (typeof location.city !== 'string') return null;
      return `${countryName}.${location.city.replace(/,/g, '')}`;
    })
    .filter(Boolean)
    .join(', ');
}

export async function importRecords(
  serviceSocket,
  dataGroupId,
  accountId,
  personData,
  companyData,
  processedPersonData,
  importedCompanyMap,
  loaderSelector,
  importEmptyCompanies,
  currentImportIndex,
  showProgressPercent
) {
  let now = Date.now();

  if (!personData.length) {
    let companyBatches = getBatches(companyData, 10);

    for (let companyBatch of companyBatches) {
      if (importIndex !== currentImportIndex) return;
      await Promise.all(
        companyBatch.map(async (company) => {
          let rawCompany = { ...company };

          let cleanOfficeLocations = Array.isArray(rawCompany.locations) ? formatOfficeLocations(rawCompany.locations) : undefined;

          let {
            id: company_id,
            universal_name,
            company_name,
            website,
            description,
            employee_count,
            industries,
            type,
            linkedin_url,
            specialities,
            num_followers,
            staff_count_high,
            staff_count_low,
            country,
            state_name,
            city
          } = rawCompany;

          company = {
            universalName: universal_name ?? undefined,
            companyName: company_name,
            websiteUrl: website ?? undefined,
            companyDescription: description,
            employeeCount: employee_count ?? undefined,
            industries: industries ?? undefined,
            id: await convertStringToId(`${dataGroupId},${company_id || company_name}`),
            companyId: company_id ?? undefined,
            type: type ?? undefined,
            hqGeoArea: state_name ?? undefined,
            companyLinkedinUrl: linkedin_url ?? undefined,
            specialities: specialities ?? undefined,
            companyFollowerCount: num_followers ?? undefined,
            companyEmployeeCountHigh: staff_count_high ?? undefined,
            companyEmployeeCountLow: staff_count_low ?? undefined,
            officeLocations: cleanOfficeLocations,
            hqCity: city ?? undefined,
            companyHqRegion: state_name ?? countryCodeNames[country] ?? undefined,
            dataGroupId,
            accountId,
            mainCompanyId: await convertStringToId(company_id || company_name)
          };

          extendCompanyProfile(company, rawCompany);

          let importedCompany = importedCompanyMap.get(company.id);
          if (importedCompany) return;
          importedCompanyMap.set(company.id, {
            id: company.id,
            publicId: company.companyId,
            employees: {}
          });

          if (!company.companyName) return;

          console.log(`Importing company with ID ${company.companyId}...`, company);
          await upsertIntoCollection(serviceSocket, 'Company', company);
        })
      );
    }
  }

  for (let companyProfile of companyData) {
    if (companyProfile.company_id) {
      fullCompanyProfiles[companyProfile.company_id] = companyProfile;
    }
  }
    
  // Compute stats for charts.
  for (let person of personData) {
    if (!person) continue;
    let headline = person.headline || '';
    let currentJob = (person.jobs || []).find(job => job.is_current) || {};
    let currentJobTitle = currentJob.title || '';
    let currentJobDesc = currentJob.description || '';

    // TODO: Consider using tags from data miner, but keep generic tags like
    // director, exec, senior specialist, specialist...
    // To ensure maximum consistency with DataMiner tags.
    for (let { name, regex, minExp, maxExp } of seniorities) {
      if (regex) {
        if (headline.match(regex) || currentJobTitle.match(regex) || currentJobDesc.match(regex)) {
          person.seniority = name;
          break;
        }
      } else if (minExp || maxExp) {
        let exp = (person.jobs || []).reduce((sum, job) => {
          let jobStartTimestamp = job.start_timestamp ?? now;
          let jobEndTimestamp = job.end_timestamp ?? now;
          return sum + (jobEndTimestamp - jobStartTimestamp);
        }, 0);
        if ((!minExp || exp >= minExp) && (!maxExp || exp <= maxExp)) {
          person.seniority = name;
          break;
        }
      }
    }

    person.education = getEducationLevel(person);
  }

  let processedCount = 0;
  let personBatches = getBatches(personData, 10);

  for (let personBatch of personBatches) {

    if (importIndex !== currentImportIndex) return;
    if (!isElementVisible(loaderSelector)) return;

    await Promise.all(
      personBatch.map(async (personRaw) => {
        let [ companies, person, jobs, educations ] = await Promise.all([
          extractCompanies(personRaw, dataGroupId, accountId, importEmptyCompanies),
          extractPerson(personRaw, dataGroupId, accountId),
          extractJobs(personRaw, dataGroupId, accountId),
          extractEducations(personRaw, dataGroupId, accountId)
        ]);

        if (!person.publicId) return;

        let companyBatches = getBatches(companies, 10);
        for (let companyBatch of companyBatches) {
          if (importIndex !== currentImportIndex) return;
          await Promise.all(
            companyBatch.map(async (company) => {
              extendCompanyProfile(company, fullCompanyProfiles[company.companyId]);

              let importedCompany = importedCompanyMap.get(company.id);
              if (importedCompany) {
                importedCompany.employees[person.id] = person;
                return;
              };
              importedCompanyMap.set(company.id, {
                id: company.id,
                publicId: company.companyId,
                employees: {
                  [person.id]: person
                }
              });

              if (!company.companyName) return;
              
              console.log(`Importing company with ID ${company.companyId}...`, company);
              await upsertIntoCollection(serviceSocket, 'Company', company);
            })
          );
        }

        if (importIndex !== currentImportIndex) return;
        await upsertIntoCollection(serviceSocket, 'Person', person);
        if (importIndex !== currentImportIndex) return;

        let jobBatches = getBatches(jobs, 10);
        for (let jobBatch of jobBatches) {
          await Promise.all(
            jobBatch.map(async (job) => {
              await upsertIntoCollection(serviceSocket, 'Job', job);
            })
          );
        }
        if (importIndex !== currentImportIndex) return;

        let educationBatches = getBatches(educations, 10);
        for (let educationBatch of educationBatches) {
          await Promise.all(
            educationBatch.map(async (education) => {
              await upsertIntoCollection(serviceSocket, 'Education', education);
            })
          );
        }
        if (importIndex !== currentImportIndex) return;

        processedPersonData.push({
          person,
          jobs
        });
      })
    );

    if (importIndex !== currentImportIndex) return;

    let processedPercentage = Math.round(++processedCount * 100 / personBatches.length);
    if (showProgressPercent) {
      let progressText = `Importing: ${processedPercentage}%`;
      updateElementText(loaderSelector, progressText);
    } else {
      updateElementText(loaderSelector, 'Importing...');
    }
  }
}

export function downloadDataAsFile(data, fileName) {
  let blob = new Blob([ JSON.stringify(data) ], { type: 'application/json' });
  let fileDataURL = URL.createObjectURL(blob);
  let downloadElement = document.createElement('a');
  downloadElement.style.display = 'none';
  downloadElement.setAttribute('href', fileDataURL);
  downloadElement.setAttribute('download', fileName);
  document.body.appendChild(downloadElement);
  downloadElement.click();
  downloadElement.remove();
  URL.revokeObjectURL(fileDataURL);
};

export function downloadTextAsFile(text, fileName) {
  let blob = new Blob([ text ], { type: 'text/plain' });
  let fileDataURL = URL.createObjectURL(blob);
  let downloadElement = document.createElement('a');
  downloadElement.style.display = 'none';
  downloadElement.setAttribute('href', fileDataURL);
  downloadElement.setAttribute('download', fileName);
  document.body.appendChild(downloadElement);
  downloadElement.click();
  downloadElement.remove();
  URL.revokeObjectURL(fileDataURL);
};

export async function finalizeImport(serviceSocket, processedPersonData, importedCompanyMap, tags, loaderSelector, appRouterSelector, currentImportIndex) {
  updateElementText(loaderSelector, 'Computing employee tags... Please keep the modal open and this tab active.');

  let tagNames = (tags || []).map(({ tagName }) => tagName);
  if (tagNames.length) {
    await computeEmployeeTags(serviceSocket, processedPersonData, tagNames, loaderSelector, currentImportIndex);
  }

  // TODO 0: This was commented out because it is relatively expensive and should be done separately from import.
  // updateElementText(loaderSelector, 'Computing statistics... Please keep the modal open.');
  // await computeCompanyStats(serviceSocket, [ ...importedCompanyMap.keys() ], loaderSelector, currentImportIndex);

  updateElementText(loaderSelector, 'Finished importing!');

  window.dispatchEvent(new CustomEvent('crawlkeep-import-complete'));

  document.querySelector(appRouterSelector).refreshCurrentPage();
}

export async function processWithDataMiner(rawBatch) {
  let response = await fetch(DATA_MINER_ADD_TAGS_URL, {
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(rawBatch)
  });
  return response.json();
}

export async function startCrawl(dataGroupId, serviceSocket, crawlSettings, loaderSelector) {
  resetCrawledDataImport();
  if (!crawlSettings?.crawlExtensionExists) {
    updateElementStyle(loaderSelector, 'display', 'block');
    updateElementText(loaderSelector, 'Cannot crawl without browser extension.', 'error');
    return;
  }
  if (crawlSettings?.crawlType === 'project') {
    await crawlWebFromProject(dataGroupId, serviceSocket, crawlSettings, loaderSelector);
  } else if (crawlSettings?.crawlType === 'subset') {
    await crawlWebFromDataGroup(dataGroupId, serviceSocket, crawlSettings, loaderSelector);
  } else {
    resetImportStream();
    updateElementStyle(loaderSelector, 'display', 'block');
    if (!crawlSettings?.crawlCompanyIds || crawlSettings?.crawlCompanyIds.length <= 0) {
      let errorMessage = 'Cannot start crawl without company IDs, names or URLs.';
      updateElementText(loaderSelector, errorMessage, 'error');
      return;
    }
    updateElementText(loaderSelector, 'Crawling web from provided company IDs... Please keep your tabs open.');
    await crawlWebFromCompanies(dataGroupId, crawlSettings.crawlCompanyIds, serviceSocket, crawlSettings, loaderSelector);
  }
}

export async function crawlWebFromProject(dataGroupId, serviceSocket, crawlSettings, loaderSelector) {
  resetImportStream();
  updateElementStyle(loaderSelector, 'display', 'block');

  if (!crawlSettings?.crawlSeedLonglistId) {
    let errorMessage = 'Cannot start crawl without selecting a project.';
    updateElementText(loaderSelector, errorMessage, 'error');
    return;
  }

  updateElementText(loaderSelector, 'Crawling web, starting from project seed... Please keep your tabs open.');

  let batchSize = 10;

  let {
    crawlResume,
    crawlSeedLonglistId,
    crawlSeedIncludeCompanies
  } = crawlSettings || {};

  try {
    if (crawlResume) {
      await crawlWebFromCompanies(dataGroupId, [], serviceSocket, crawlSettings, loaderSelector);
      return;
    }

    let viewParams = {
      longlistId: crawlSeedLonglistId,
      query: crawlSeedIncludeCompanies ? `status = ${crawlSeedIncludeCompanies}` : ''
    };
    let employerIds = await getRecordIds(serviceSocket, 'Employer', 'longlistSearchView', viewParams, 0, MAX_SEED_COMPANY_PAGES, 100);

    let employerIdBatches = getBatches(employerIds, batchSize);
    let companyPublicIdSet = new Set();

    for (let employerBatch of employerIdBatches) {
      let companies = await Promise.all(
        employerBatch.map(async (employerId) => {
          let companyId = await serviceSocket.invoke('crud', {
            action: 'read',
            type: 'Employer',
            id: employerId,
            field: 'companyId'
          });
          let companyData = await Promise.all([
            serviceSocket.invoke('crud', {
              action: 'read',
              type: 'Company',
              id: companyId,
              field: 'companyId'
            })
          ]);
          return {
            publicId: companyData[0] || null
          };
        })
      );

      for (let { publicId } of companies) {
        if (publicId) {
          companyPublicIdSet.add(publicId);
        }
      }
    }

    let targetCompanyIds = [ ...companyPublicIdSet ];
    await crawlWebFromCompanies(dataGroupId, targetCompanyIds, serviceSocket, crawlSettings, loaderSelector);

  } catch (error) {
    let errorMessage = `Failed to crawl web from project because of error: ${error.message}`;
    console.error(errorMessage);
    updateElementText(loaderSelector, errorMessage, 'error');
  }
}

export async function crawlWebFromDataGroup(dataGroupId, serviceSocket, crawlSettings, loaderSelector) {
  resetImportStream();
  updateElementStyle(loaderSelector, 'display', 'block');
  updateElementText(loaderSelector, 'Crawling web for data... Please keep your tabs open.');

  let batchSize = 10;

  let { crawlStartSampleSize, crawlResume } = crawlSettings || {};

  try {
    if (crawlResume) {
      await crawlWebFromCompanies(dataGroupId, [], serviceSocket, crawlSettings, loaderSelector);
      return;
    }

    let companyResult = await serviceSocket.invoke('crud', {
      action: 'read',
      type: 'Company',
      offset: 0,
      view: 'groupIdQuerySortView',
      viewParams: {
        dataGroupId,
        query: '',
        sortBy: 'updatedAt desc'
      },
      pageSize: 100
    });
    
    updateElementText(
      loaderSelector,
      'Loading companies from data group to start the crawl...'
    );

    if (!companyResult.data.length) {
      let errorMessage = 'Current data group does not contain any companies to start the crawl from.';
      updateElementText(loaderSelector, errorMessage, 'error');
      return;
    }

    let companyBatches = getBatches(companyResult.data, batchSize);
    let targetCompanyIds = [];

    for (let companyBatch of companyBatches) {
      let companyIds = await Promise.all(
        companyBatch.map(async (companyId) => {
          return serviceSocket.invoke('crud', {
            action: 'read',
            type: 'Company',
            id: companyId,
            field: 'companyId'
          });
        })
      );
      targetCompanyIds.push(...companyIds.filter(Boolean));
    }

    targetCompanyIds = targetCompanyIds.slice(0, crawlStartSampleSize);

    await crawlWebFromCompanies(dataGroupId, targetCompanyIds, serviceSocket, crawlSettings, loaderSelector);
    
  } catch (error) {
    let errorMessage = `Failed to crawl the web because of error: ${error.message}`;
    console.error(errorMessage);
    updateElementText(loaderSelector, errorMessage, 'error');
  }
}

export async function fetchPersonProfiles(profileURLs) {
  let profileIdRegExp = /([^\/]*)\/?$/;
  let profileIds = profileURLs
    .map((profileURL) => {
      let matches = profileURL.match(profileIdRegExp);
      return matches[1];
    })
    .filter(Boolean);

  window.dispatchEvent(
    new CustomEvent('crawlkeep-fetch-persons', {
      detail: {
        scrapeOptions: {
          scrapeType: 'employees',
          profileIds,
          parserConfig: config.extensionParsing || {}
        }
      }
    })
  );
}

// Convert from HTML-escaped regex format to usable regex string format.
function sanitizeRegExp(rawRegExp, separator) {
  return rawRegExp.replace(/\t/g, separator).replace(/\\\\/g, '\\');
}

async function getTaxonomyChildTags(socket, parentId, maxDepth = 100, currentDepth = 0) {
  let taxonomyChildren = await getRecords({
    socket,
    type: 'Taxonomy',
    viewName: 'parentView',
    viewParams: { parentId },
    fields: [ 'id', 'tagName', 'regexPattern', 'isExperienceTag' ],
    startPage: 0,
    maxPages: 100,
    pageSize: 100
  });
  
  if (currentDepth > maxDepth) {
    throw new Error('Taxonomy max depth was exceeded');
  }
  if (!taxonomyChildren.length) {
    return [];
  }
  let grandChildrenList = await Promise.all(
    taxonomyChildren.map(async (item) => {
      return getTaxonomyChildTags(socket, item.id, maxDepth, currentDepth + 1);
    })
  );
  let childrenTags = taxonomyChildren.map(({ tagName, regexPattern, isExperienceTag }) => {
    return {
      tagName,
      regexPattern: regexPattern ? sanitizeRegExp(regexPattern, '|') : null,
      isExperienceTag: isExperienceTag || false
    };
  });
  return [ ...childrenTags, ...grandChildrenList.flatMap(itemList => itemList) ].filter(item => item.regexPattern);
}

export async function crawlWebFromCompanies(dataGroupId, companyPublicIds, serviceSocket, crawlSettings, loaderSelector) {
  updateElementText(loaderSelector, 'Crawling web for data... Please keep your tabs open.');

  let {
    tags,
    crawlTagTaxonomyParentId,
    crawlPrimaryKeyword,
    crawlSecondaryKeyword,
    crawlLocation,
    crawlIndustry,
    crawlAIPrompt,
    crawlCompanyAIPrompt,
    crawlEmployeeAIFactor,
    crawlCompanyAIFactor,
    crawlAIScoreThreshold,
    crawlDepth,
    crawlBreadth,
    crawlPause,
    crawlPauseProbability,
    crawlRandomness,
    crawlResume,
    crawlFindDirectEmployeesOnly,
    crawlOnlyEmployees,
    crawlCompanySizeTarget,
    crawlSeedEmployeesCount,
    crawlExplorationFactor,
    crawlSkillFactor,
    crawlCurrentJobFactor,
    crawlPastJobFactor,
    crawlLocationFactor
  } = crawlSettings || {};

  let allTags = [ ...tags ];

  if (crawlTagTaxonomyParentId && crawlTagTaxonomyParentId !== ROOT_TAG_ID) {
    let childTags = await getTaxonomyChildTags(serviceSocket, crawlTagTaxonomyParentId);
    for (let tag of childTags) {
      allTags.push(tag);
    }
  }

  if (crawlResume) {
    console.log('Resuming crawl...');
  } else {
    console.log(`Crawling web for data starting from companies: ${companyPublicIds.join(', ')}`);
  }

  // Determine if this is a 'From companies' crawl by checking if crawlCompanyIds were manually provided
  let isFromCompaniesCrawl = crawlSettings.crawlCompanyIds && crawlSettings.crawlCompanyIds.length > 0 && !crawlResume;

  let tagRegexes = (allTags || []).map(({ regexPattern }) => regexPattern);
  // let token = localStorage.getItem('socketcluster.authToken.saasufy.com');

  // Fetch full Company records to pre-populate the company cache
  let companyCache = {};
  let employeeCache = {};
  if (companyPublicIds && companyPublicIds.length > 0 && !crawlResume) {
    updateElementText(loaderSelector, 'Loading company data... Please keep your tabs open.');

    if (dataGroupId) {
      try {
        let companyRecordBatches = getBatches(companyPublicIds, 10);
        for (let companyBatch of companyRecordBatches) {
          let companyRecords = await Promise.all(
            companyBatch.map(async (companyPublicId) => {
              try {
                let companyId = await convertStringToId(`${dataGroupId},${companyPublicId}`);
                let company = await getRecord({
                  socket: serviceSocket,
                  type: 'Company',
                  id: companyId
                });
                return { companyPublicId, company };
              } catch (error) {
                console.warn(`Failed to fetch Company record for ${companyPublicId}:`, error);
                return null;
              }
            })
          );

          for (let record of companyRecords) {
            if (record && record.company) {
              companyCache[record.companyPublicId] = {
                company_id: record.companyPublicId,
                company_name: record.company.companyName,
                company_description: record.company.companyDescription,
                company_employee_count_low: record.company.companyEmployeeCountLow,
                company_employee_count_high: record.company.companyEmployeeCountHigh,
                employee_count: record.company.employeeCount,
                industries: record.company.industries,
                specialities: record.company.specialities,
                tagline: record.company.tagline,
                parent_company: record.company.parentCompany,
                office_locations: record.company.officeLocations,
                office_coords: record.company.officeCoords,
                hq_address_line1: record.company.hqAddressLine1,
                hq_address_line2: record.company.hqAddressLine2,
                hq_city: record.company.hqCity,
                hq_geo_area: record.company.hqGeoArea,
                hq_postal_code: record.company.hqPostalCode,
                hq_country: record.company.hqCountry,
                hq_region: record.company.hqCountry,
                universal_name: record.company.universalName,
                website_url: record.company.websiteUrl,
                founded_year: record.company.foundedYear
              };
            }
          }
        }
        console.log(`Loaded ${Object.keys(companyCache).length} company records for pre-population`);
      } catch (error) {
        console.error(`Failed to fetch company records: ${error.message}`);
      }

      // Fetch employees for the companies
      try {
        updateElementText(loaderSelector, 'Loading employee data... Please keep your tabs open.');

        for (let companyPublicId of companyPublicIds) {
          let companyId = await convertStringToId(`${dataGroupId},${companyPublicId}`);

          // Fetch all persons for this company
          let personIds = await getRecordIds(
            serviceSocket,
            'Person',
            'companySearchView',
            { currentCompanyId: companyId },
            0,
            100, // maxPages
            100 // pageSize
          );

          let personBatches = getBatches(personIds, 10);
          for (let personBatch of personBatches) {
            let persons = await Promise.all(
              personBatch.map(async (personId) => {
                try {
                  let person = await getRecord({
                    socket: serviceSocket,
                    type: 'Person',
                    id: personId
                  });
                  return person;
                } catch (error) {
                  console.warn(`Failed to fetch Person ${personId}:`, error);
                  return null;
                }
              })
            );

            for (let person of persons) {
              if (!person || !person.publicId) continue;

              // Fetch jobs for this person
              let jobRecords = await getRecords({
                socket: serviceSocket,
                type: 'Job',
                viewName: 'personView',
                viewParams: { personId: person.id },
                startPage: 0,
                maxPages: 10,
                pageSize: 100
              });

              // Transform jobs to scraper format
              let jobs = jobRecords.map(job => ({
                job_is_current: job.jobIsCurrent,
                job_company_id: job.companyPublicId,
                job_company_name: job.companyName,
                job_company_description: job.companyDescription,
                job_company_hq_region: job.companyHqRegion,
                job_company_linkedin_url: job.companyLinkedinUrl,
                job_start_timestamp: job.jobStartTimestamp,
                job_end_timestamp: job.jobEndTimestamp,
                millseconds_in_job: job.jobMillsecondsInJob,
                job_title: job.jobTitle,
                job_industries: job.jobIndustries,
                job_description: job.jobDescription,
                job_country: job.jobCountry,
                job_display_location: job.jobDisplayLocation,
                job_skills: job.jobSkills,
                company: {
                  id: job.companyPublicId,
                  name: job.companyName,
                  description: job.companyDescription,
                  employee_count_low: job.companyEmployeeCountLow,
                  employee_count_high: job.companyEmployeeCountHigh,
                  linkedin_url: job.companyLinkedinUrl,
                  hq_region: job.companyHqRegion,
                  follower_count: job.companyFollowerCount
                }
              }));

              // Create profile_urn from publicId (assuming format urn:li:fsd_profile:publicId)
              let profileUrn = `urn:li:fsd_profile:${person.publicId}`;

              employeeCache[profileUrn] = {
                profile_urn: profileUrn,
                public_id: person.publicId,
                first_name: person.firstName,
                last_name: person.lastName,
                headline: person.headline,
                location: person.location,
                city: person.city,
                state: person.state,
                country: person.location, // Use location as fallback for country
                summary: person.summary,
                skills: person.skills || [],
                jobs,
                edus: [], // Education records could be fetched similarly if needed
                can_send_inmail: person.canSendInmail,
                network_distance: person.networkDistance,
                number_of_connections: person.numberOfConnections,
                profile_img: person.profileImg,
                public_url: person.publicUrl
              };
            }
          }
        }
        console.log(`Loaded ${Object.keys(employeeCache).length} employee records for pre-population`);
      } catch (error) {
        console.error(`Failed to fetch employee records: ${error.message}`);
      }
    }

    updateElementText(loaderSelector, 'Crawling web for data... Please keep your tabs open.');
  }

  window.dispatchEvent(
    new CustomEvent('crawlkeep-start-crawl', {
      detail: {
        // socketOptions: {
        //   hostname: serviceSocket.options.hostname,
        //   port: serviceSocket.options.port,
        //   protocolScheme: serviceSocket.options.protocolScheme,
        //   path: serviceSocket.options.path,
        //   token
        // },
        crawlSettings,
        scrapeOptions: {
          scrapeType: 'crawl',
          crawlResume: crawlResume || false,
          findDirectEmployeesOnly: crawlFindDirectEmployeesOnly || false,
          onlyEmployees: crawlOnlyEmployees || false,
          scrapeSeeds: isFromCompaniesCrawl,
          seedEmployeesCount: crawlSeedEmployeesCount ?? 1,
          companyIds: companyPublicIds.filter(Boolean),
          companyCache,
          employeeCache,
          depth: crawlDepth ?? 10,
          breadth: crawlBreadth ?? 30,
          iterationPauseDuration: crawlPause ?? 300,
          iterationPauseRandomness: crawlRandomness ?? 1000,
          pauseProbability: crawlPauseProbability ?? .1,
          maxFringeListSize: 1000,
          industry: crawlIndustry,
          tagRegexes,
          locationRegexes: crawlLocation ? [ crawlLocation ] : [],
          aiPrompts: crawlAIPrompt ? [ crawlAIPrompt ] : [],
          companyAIPrompts: crawlCompanyAIPrompt ? [ crawlCompanyAIPrompt ] : [],
          employeeAIFactor: crawlEmployeeAIFactor ?? 1,
          companyAIFactor: crawlCompanyAIFactor ?? 1,
          aiScoreThreshold: crawlAIScoreThreshold ?? 0.5,
          primaryKeyword: crawlPrimaryKeyword || '',
          secondaryKeyword: crawlSecondaryKeyword || '',
          companySizeTarget: (crawlCompanySizeTarget ?? 10),
          companySizeFactor: 1,
          explorationFactor: 2 * (crawlExplorationFactor ?? 50) / 100,
          currentJobFactor: (crawlCurrentJobFactor ?? 50) / 100,
          pastJobFactor: (crawlPastJobFactor ?? 50) / 100,
          skillFactor: (crawlSkillFactor ?? 50) / 100,
          locationFactor: (crawlLocationFactor ?? 50) / 100,
          parserConfig: config.extensionParsing || {}
        }
      }
    })
  );
}

export async function stopCrawl(options) {
  window.dispatchEvent(
    new CustomEvent('crawlkeep-stop-crawl', {
      detail: options || {}
    })
  );
}

function updateElementText(selector, text, type) {
  let element = document.querySelector(selector);
  if (element) {
    element.innerHTML = `<span class="${type || 'regular'}">${text}</span>`;
  }

  // If this is an error message, dispatch an event to reset crawl state
  if (type === 'error') {
    window.dispatchEvent(new CustomEvent('crawl-error', { detail: { message: text } }));
  }
}

function isElementVisible(selector) {
  return !!document.querySelector(selector);
}

function updateElementStyle(selector, property, value) {
  let element = document.querySelector(selector);
  if (element) {
    element.style[property] = value;
  }
}

function serializeError(error) {
  if (error.fieldErrors) {
    return `${error.message} - ${Object.entries(error.fieldErrors).map(([ field, message ]) => `${field}: ${message}`).join(', ')}`
  }
  return error.message;
}

async function upsertIntoCollection(serviceSocket, collectionName, data) {
  let record = Object.fromEntries(
    Object.entries(data).map(([ key, value ]) => {
      if (Array.isArray(value)) {
        return [ key, value.join('\t') ];
      }
      return [ key, value ];
    })
  );
  try {
    await serviceSocket.invoke('crud', {
      action: 'create',
      type: collectionName,
      value: record
    });
  } catch (createError) {
    if (createError.name !== 'DuplicatePrimaryKeyError') {
      console.warn(
        `Failed to create record ${
          record.id
        } in ${
          collectionName
        } collection because of error: ${
          serializeError(createError)
        }`
      );
      return;
    }
    try {
      await serviceSocket.invoke('crud', {
        action: 'update',
        type: collectionName,
        id: record.id,
        value: record
      });
    } catch (updateError) {
      console.warn(
        `Failed to update record ${
          record.id
        } in ${
          collectionName
        } collection because of error: ${
          serializeError(updateError)
        }`
      );
    }
  }
}

// TODO 0: Add a property to specify which employees have been processed after import so that the processedPersonData array
// does not need to be provided.
async function computeEmployeeTags(clientSocket, processedPersonData, restrictToTags, loaderSelector, currentImportIndex) {
  let batchSize = 10;
  let personBatches = getBatches(processedPersonData, batchSize);
  let totalBatches = personBatches.length;

  for (let i = 0; i < totalBatches; i++) {

    if (importIndex !== currentImportIndex) return;
    if (!isElementVisible(loaderSelector)) return;

    let batch = personBatches[i];
    try {
      let employeeInfo = await Promise.all(
        batch.map(async ({ person, jobs }) => {
          try {
            return await verifyPersonTags({ socket: clientSocket, person, jobs, restrictToTags, tagPrefixes: [ 'position', 'skill' ] });
          } catch (error) {
            updateElementText(loaderSelector, error.message, 'error');
            throw error;
          }
        })
      );
  
      await Promise.all(
        employeeInfo.map(async ({ personId, tags }) => {
          try {
            await clientSocket.invoke('crud', {
              action: 'update',
              type: 'Person',
              id: personId,
              field: 'tags',
              value: tags || ''
            });
          } catch (error) {
            let errorMessage = `Failed to update employee tags because of error: ${error.message}`;
            updateElementText(loaderSelector, errorMessage, 'error');
            throw new Error(errorMessage);
          }
        })
      );
    } catch (error) {
      console.error(error);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      i--;
      continue;
    }

    let progressMessage = `Computing employee tags: ${Math.round((i + 1) * 100 / totalBatches)}%`;
    updateElementText(loaderSelector, progressMessage);
  }
}

async function computeCompanyStats(clientSocket, companyIds, loaderSelector, currentImportIndex) {
  let batchSize = 10;
  let companyIdBatches = getBatches(companyIds, batchSize);
  let totalBatches = companyIdBatches.length;

  for (let i = 0; i < totalBatches; i++) {

    if (importIndex !== currentImportIndex) return;
    if (!isElementVisible(loaderSelector)) return;

    let batch = companyIdBatches[i];
    console.log('Computing stats for companies...', batch);
    try {
      let companyInfo = await Promise.all(
        batch.map(async (companyId) => {
          try {
            let companyPersonInfoList = await getCompanyEmployees(clientSocket, companyId);
            return {
              companyId,
              persons: companyPersonInfoList
            };
          } catch (error) {
            let errorMessage = `Failed to fetch company employees because of error: ${error.message}`;
            updateElementText(loaderSelector, errorMessage, 'error');
            throw new Error(errorMessage);
          }
        })
      );

      let combinedCompanyInfo = companyInfo
        .filter(company => company)
        .map(company => {
          let employees = company.persons;
          let employeeCityMap = {};
          let employeeSeniorityMap = {};
          let employeeEducationMap = {};
          for (let person of employees) {
            if (person.country && person.city) {
              let locationString = `${person.country}.${person.city}`;
              if (!employeeCityMap[locationString]) {
                employeeCityMap[locationString] = 0;
              }
              employeeCityMap[locationString]++;
            }
            if (person.seniority) {
              if (!employeeSeniorityMap[person.seniority]) {
                employeeSeniorityMap[person.seniority] = 0;
              }
              employeeSeniorityMap[person.seniority]++;
            }
            if (person.education) {
              if (!employeeEducationMap[person.education]) {
                employeeEducationMap[person.education] = 0;
              }
              employeeEducationMap[person.education]++;
            }
          }
          return {
            id: company.companyId,
            employeeLocations: Object.entries(employeeCityMap).map(([city, count]) => `${city}=${count}`),
            employeeSeniorities: Object.entries(employeeSeniorityMap).sort(compareSeniorityEntries).map(([seniority, count]) => `${seniority}=${count}`),
            employeeEducations: Object.entries(employeeEducationMap).sort(compareEducationEntries).map(([education, count]) => `${education}=${count}`)
          };
        });

      await Promise.all(
        combinedCompanyInfo.map(async (record) => {
          let value = {};
          if (record.employeeLocations.length) {
            value.employeeLocations = record.employeeLocations.join(', ');
          }
          if (record.employeeSeniorities.length) {
            value.employeeSeniorities = record.employeeSeniorities.join(', ');
          }
          if (record.employeeEducations.length) {
            value.employeeEducations = record.employeeEducations.join(', ');
          }
          await clientSocket.invoke('crud', {
            action: 'update',
            type: 'Company',
            id: record.id,
            value
          });
        })
      );
    } catch (error) {
      console.error(`Failed to update some company records because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      i--;
      continue;
    }

    let progressMessage = `Computing stats: ${Math.round((i + 1) * 100 / totalBatches)}%`;
    updateElementText(loaderSelector, progressMessage);
  }
}

function getSeniorityPoints(title) {
  if (title.startsWith('Executive')) {
    return 5;
  }
  if (title.startsWith('Director')) {
    return 4;
  }
  if (title.startsWith('Founder')) {
    return 3;
  }
  if (title.startsWith('Senior')) {
    return 2;
  }
  if (title.startsWith('Junior')) {
    return 0;
  }
  return 1;
}

function compareSeniorityEntries([seniorityA], [seniorityB]) {
  let pointsA = getSeniorityPoints(seniorityA);
  let pointsB = getSeniorityPoints(seniorityB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (seniorityA > seniorityB) {
    return 1;
  }
  if (seniorityA < seniorityB) {
    return -1;
  }
  return 0;
}

function getEducationPoints(educationTitle) {
  if (educationTitle.startsWith('PhD')) {
    return 3;
  }
  if (educationTitle.startsWith('Master')) {
    return 2;
  }
  if (educationTitle.startsWith('Bachelor')) {
    return 1;
  }
  return 0;
}

function compareEducationEntries([educationA], [educationB]) {
  let pointsA = getEducationPoints(educationA);
  let pointsB = getEducationPoints(educationB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (educationA > educationB) {
    return 1;
  }
  if (educationA < educationB) {
    return -1;
  }
  return 0;
}

export async function sha256(text) {
  let textBuffer = new TextEncoder().encode(text);
  let hashBuffer = await crypto.subtle.digest('SHA-256', textBuffer);
  let hashList = Array.from(new Uint8Array(hashBuffer));
  return hashList.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function convertStringToId(string) {
  if (string == null) {
    return undefined;
  }
  let idHex = (await sha256(string)).slice(0, 32);

  let third = (
    (parseInt(idHex.slice(12, 16), 16) & 0x0fff) | 0x4000
  ).toString(16);

  let fourth = (
    (parseInt(idHex.slice(16, 20), 16) & 0x3fff) | 0x8000
  ).toString(16);

  return `${idHex.slice(0, 8)}-${idHex.slice(8, 12)}-${third}-${fourth}-${idHex.slice(20, 32)}`;
}

export async function extractCompanies(person, dataGroupId, accountId, importEmptyCompanies) {
  let personJobs = person.jobs || [];
  if (!importEmptyCompanies) {
    personJobs = personJobs.filter(job => job?.is_current);
  }
  let companies = await Promise.all(
    personJobs.map(async (job) => {
      if (!job) return null;
      let resource = job.company;
      if (!resource) {
        resource = {
          id: job.company_id,
          name: job.company_name,
          type: job.company_type ?? undefined,
          employee_count_low: job.company_employee_count_low,
          employee_count_high: job.company_employee_count_high,
          description: job.company_description,
          linkedin_url: job.company_linkedin_url,
          hq_region: job.company_hq_region,
          follower_count: job.company_follower_count != null ? Number(job.company_follower_count) : undefined,
          specialities: Array.isArray(job.company_specialties) ? job.company_specialties.join(', ') : job.company_specialties
        };
      }
      if (!resource || resource.id == null || resource.name == null) return null;
      let [ id, mainCompanyId ] = await Promise.all([
        convertStringToId(`${dataGroupId},${resource.id || resource.name}`),
        convertStringToId(resource.id || resource.name)
      ]);
      return {
        id,
        accountId,
        mainCompanyId,
        dataGroupId,
        companyEmployeeCountLow: resource.employee_count_low != null ? Number(resource.employee_count_low) : undefined,
        companyEmployeeCountHigh: resource.employee_count_high != null ? Number(resource.employee_count_high) : undefined,
        companyDescription: resource.description,
        companyName: resource.name,
        companyId: resource.id,
        type: resource.type ?? undefined,
        companyLinkedinUrl: resource.linkedin_url,
        companyHqRegion: resource.hq_region,
        companyFollowerCount: resource.follower_count,
        specialities: Array.isArray(resource.specialities) ? resource.specialities.join(', ') : resource.specialities
      };
    })
  );
  return companies.filter(Boolean);
}

export let specializationMap = {
  mechanical_engineering: 'mechanical-engineering',
  electronics_engineering: 'electronics-engineering',
  systems_engineering: 'systems-engineering',
  optical_engineering: 'optical-engineering',
  middle_management: 'middle-manager'
};

function jobMatchesRegExp(job, regex) {
  let jobIndustries = Array.isArray(job.industries) ? job.industries.join(', ') : '';
  let jobSkills = Array.isArray(job.skills) ? job.skills.join(', ') : '';
  return (
    (typeof job.title === 'string' && job.title.match(regex)) ||
    (typeof job.description === 'string' && job.description.match(regex)) ||
    jobIndustries.match(regex) ||
    jobSkills.match(regex)
  );
}

export function getExpTagSuffix(expMillis) {
  if (expMillis >= TEN_YEARS_MILLIS) {
    return '.years-10';
  }
  if (expMillis >= FIVE_YEARS_MILLIS) {
    return '.years-5';
  }
  if (expMillis >= ONE_YEAR_MILLIS) {
    return '.years-1';
  }
  return '.years-0';
}

export async function extractPerson(resource, dataGroupId, accountId, tags) {
  let jobs = resource.jobs || [];
  let currentJobs = jobs.filter(job => job?.is_current);
  let [ id, mainPersonId, currentCompanyId, recommendations ] = await Promise.all([
    convertStringToId(`${dataGroupId},${resource.public_id}`),
    convertStringToId(resource.public_id),
    (async () => {
      let companyIds = await Promise.all(
        currentJobs.map(async (currentJob) => {
          return convertStringToId(`${dataGroupId},${currentJob.company?.id || currentJob.company?.name || currentJob.company_id || currentJob.company_name}`);
        })
      );
      return companyIds.join(',');
    })(),
    Promise.all(
      (resource.recommendations || [])
        .filter((rec) => rec && rec.recommender_public_id)
        .map(async (rec) => convertStringToId(rec.recommender_public_id))
    )
  ]);

  let saasufyPositions = resource.added_props?.inferred?.saasufy_seniority || {};
  let positionEntries = Object.entries(saasufyPositions).map(
    ([ key, value ]) => [ key.replace(/_id[0-9]+$/g, ''), value ]
  );

  let saasufyTags = [
    ...positionEntries.map(
      ([ key ]) => `position:${(specializationMap[key] || key).replace(/_/g, '-')}`
    ),
    ...positionEntries.map(
      ([ key, value ]) => `position:${(specializationMap[key] || key).replace(/_/g, '-')}.${value}`
    ),
    ...positionEntries.map(
      ([ key ]) => `skill:${(specializationMap[key] || key).replace(/_/g, '-')}`
    ),
    ...positionEntries.map(
      ([ key, value ]) => `skill:${(specializationMap[key] || key).replace(/_/g, '-')}.${value}`
    )
  ];

  if (resource.education) {
    let eduLevel = resource.education.toLowerCase();
    saasufyTags.push(`edu:${eduLevel}`);
    if (eduLevel === 'phd') {
      saasufyTags.push('edu:master');
    }
    if (eduLevel === 'phd' || eduLevel === 'master') {
      saasufyTags.push('edu:bachelor');
    }
  } else {
    saasufyTags.push('edu:other');
  }

  let currentSkills = Array.isArray(resource.skills) ?
    resource.skills.map(skill => typeof skill === 'string' ? skill : skill?.name).filter(Boolean).join(', ') : '';

  let computedTagSet = new Set(saasufyTags);

  // TODO: Consider deleting this as it is no longer used.
  if (tags) {
    let now = Date.now();
    for (let { tagName, regexPattern, isExperienceTag } of tags) {
      let regex = new RegExp(regexPattern, 'i');
      if (currentSkills.match(regex) || currentJobs.some(currentJob => jobMatchesRegExp(currentJob, regex))) {
        computedTagSet.add(tagName);
        if (isExperienceTag) {
          let totalExp = 0;
          for (let job of jobs) {
            if (jobMatchesRegExp(job, regex)) {
              let jobDuration = (job.end_timestamp ?? now) - (job.start_timestamp ?? now);
              totalExp += jobDuration;
            }
          }
          let tagSuffix = getExpTagSuffix(totalExp);
          computedTagSet.add(`${tagName}${tagSuffix}`);
        }
      }
    }
  }

  return {
    id,
    accountId,
    mainPersonId,
    dataGroupId,
    firstName: resource.first_name,
    lastName: resource.last_name,
    canSendInmail: resource.can_send_inmail,
    desiredEmploymentTypes: resource.desired_employment_types,
    desiredLocations: resource.desired_locations,
    desiredTitles: resource.desired_titles,
    headline: resource.headline,
    jobSeekingUrgencyLevel: resource.job_seeking_urgency_level,
    lirNiid: resource.lir_niid,
    location: resource.location,
    memberId: resource.member_id,
    networkDistance: resource.network_distance,
    numberOfConnections: resource.number_of_connections,
    openToOpportunities: resource.open_to_opportunities,
    previousLocations: resource.previous_locations,
    profileImg: resource.profile_img,
    publicId: resource.public_id,
    publicUrl: resource.public_url,
    recommendations,
    skills: currentSkills || undefined,
    summary: resource.summary,
    currentJobTitle: currentJobs[0]?.title,
    currentCompanyName: currentJobs[0]?.company?.name || currentJobs[0]?.company_name,
    currentCompanyId,
    city: resource.city,
    state: resource.state,
    minedTags: [ ...computedTagSet ].join(', '),
    tags: saasufyTags.join(', '),
    seniority: resource.seniority,
    education: resource.education,
    aiScore: resource.aiScore ?? undefined,
    crawlScore: resource.crawlScore ?? undefined
  };
}

export async function extractJobs(person, dataGroupId, accountId) {
  let jobs = await Promise.all(
    (person.jobs || []).map(async (resource) => {
      if (resource && !resource.company) {
        resource.company = {
          id: resource.company_id,
          name: resource.company_name,
          employee_count_high: resource.company_employee_count_high != null ? Number(resource.company_employee_count_high) : undefined,
          employee_count_low: resource.company_employee_count_low != null? Number(resource.company_employee_count_low) : undefined,
          linkedin_url: resource.company_linkedin_url,
          description: resource.company_description,
          hq_region: resource.company_hq_region,
          follower_count: resource.company_follower_count != null? Number(resource.company_follower_count) : undefined
        };
      }
      if (
        !resource ||
        !person.public_id ||
        !(resource.company?.id || resource.company?.name) ||
        !resource.start_timestamp ||
        !resource.title
      ) {
        return null;
      }
      let [ id, mainJobId, personId, companyId, mainCompanyId ] = await Promise.all([
        convertStringToId(
          `${dataGroupId},${person.public_id},${resource.company?.id || resource.company?.name},${resource.start_timestamp},${resource.title}`,
        ),
        convertStringToId(
          `${person.public_id},${resource.company?.id || resource.company?.name},${resource.start_timestamp},${resource.title}`,
        ),
        convertStringToId(`${dataGroupId},${person.public_id}`),
        convertStringToId(`${dataGroupId},${resource.company?.id || resource.company?.name}`),
        convertStringToId(resource.company?.id || resource.company?.name)
      ]);
      return {
        id,
        accountId,
        mainJobId,
        dataGroupId,
        personId,
        companyId,
        mainCompanyId,
        companyPublicId: resource.company?.id,
        companyName: resource.company?.name,
        jobIsCurrent: resource.is_current,
        companyEmployeeCountHigh: resource.company?.employee_count_high != null ? Number(resource.company?.employee_count_high) : undefined,
        companyEmployeeCountLow: resource.company?.employee_count_low != null ? Number(resource.company?.employee_count_low) : undefined,
        companyLinkedinUrl: resource.company?.linkedin_url,
        companyDescription: resource.company?.description,
        companyHqRegion: resource.company?.hq_region,
        companyFollowerCount: resource.company?.follower_count,
        jobStartTimestamp: resource.start_timestamp,
        jobEndTimestamp: resource.end_timestamp,
        jobMillsecondsInJob: resource.millseconds_in_job,
        jobEmploymentStatus: resource.employment_status,
        jobTitle: resource.title,
        jobIndustries: resource.industries,
        jobDescription: resource.description,
        jobCountry: resource.country,
        jobDisplayLocation: resource.display_location,
        lirNiid: person.lir_niid,
        memberId: person.member_id,
        jobSkills: resource.skills
      };
    })
  );
  return jobs.filter(Boolean);
}

export async function extractEducations(person, dataGroupId, accountId) {
  let educations = await Promise.all(
    (person.edus || []).map(async (resource) => {
      if (
        !resource ||
        !person.public_id ||
        !(resource.school?.id || resource.school?.name || resource.school_id || resource.school_name)
      ) {
        return null;
      }
      let [ id, mainEducationId, personId ] = await Promise.all([
        convertStringToId(
          `${dataGroupId},${person.public_id},${resource.school?.id || resource.school?.name},${resource.degree_name ? resource.degree_name : ""}`,
        ),
        convertStringToId(
          `${person.public_id},${resource.school?.id || resource.school?.name},${resource.degree_name ? resource.degree_name : ""}`,
        ),
        convertStringToId(`${dataGroupId},${person.public_id}`)
      ]);
      return {
        id,
        accountId,
        mainEducationId,
        dataGroupId,
        personId,
        eduDegreeName: resource.degree_name,
        eduFieldOfStudy: resource.field_of_study,
        eduSchoolId: resource.school?.id || resource.school_id,
        eduSchoolName: resource.school?.name || resource.school_name,
        eduInstitutionName: resource.institution_name,
        eduStartYear: resource.start_year,
        eduEndYear: resource.end_year,
        lirNiid: person.lir_niid,
        memberId: person.member_id
      };
    })
  );
  return educations.filter(Boolean);
}

export async function importFromProject(dataGroupId, loaderSelector = '.file-import-loader') {
  const selectedProject = document.querySelector('input[name="import-project-selection"]:checked');
  if (!selectedProject) {
    return;
  }

  const projectId = selectedProject.parentElement.getAttribute('data-project-id');

  updateElementStyle(loaderSelector, 'display', 'block');
  updateElementText(loaderSelector, 'Loading project data...');

  try {
    const socket = getServiceSocket();

    // Get DataGroup's accountId (which may include multiple comma-separated account IDs)
    let accountId;
    try {
      accountId = await getDataGroupAccountId(socket, dataGroupId);
    } catch (error) {
      updateElementText(loaderSelector, `Failed to fetch DataGroup accountId: ${error.message}`, 'error');
      return;
    }

    // Get all Candidates from the selected project
    updateElementText(loaderSelector, 'Loading candidates...');
    const candidates = await getRecords({
      socket,
      type: 'Candidate',
      viewName: 'longlistView',
      viewParams: { longlistId: projectId },
      fields: ['personId']
    });

    // Get all Employers from the selected project
    updateElementText(loaderSelector, 'Loading employers...');
    const employers = await getRecords({
      socket,
      type: 'Employer',
      viewName: 'longlistView',
      viewParams: { longlistId: projectId },
      fields: ['companyId']
    });

    // Load full Person records for each Candidate
    updateElementText(loaderSelector, 'Loading person records...');
    const personRecords = [];
    for (const candidate of candidates) {
      if (candidate.personId) {
        try {
          const person = await getRecord({
            socket,
            type: 'Person',
            id: candidate.personId
          });
          if (person) {
            personRecords.push(person);
          }
        } catch (error) {
          console.warn(`Failed to load Person ${candidate.personId}:`, error);
        }
      }
    }

    // Load full Company records for each Employer
    updateElementText(loaderSelector, 'Loading company records...');
    const companyRecords = [];
    for (const employer of employers) {
      if (employer.companyId) {
        try {
          const company = await getRecord({
            socket,
            type: 'Company',
            id: employer.companyId
          });
          if (company) {
            companyRecords.push(company);
          }
        } catch (error) {
          console.warn(`Failed to load Company ${employer.companyId}:`, error);
        }
      }
    }

    let updatedCompanyIds = {};

    // Import Company records into the data group in batches
    updateElementText(loaderSelector, 'Importing companies...');
    let companyBatches = getBatches(companyRecords, 10);
    let companyBatchCount = 0;
    for (let companyBatch of companyBatches) {
      await Promise.all(
        companyBatch.map(async (company) => {
          let newCompanyId = await convertStringToId(`${dataGroupId},${company.companyId}`);
          updatedCompanyIds[company.id] = newCompanyId;
          try {
            await socket.invoke('crud', {
              action: 'create',
              type: 'Company',
              publisherId,
              value: {
                ...company,
                id: newCompanyId,
                dataGroupId,
                accountId
              }
            });
          } catch (error) {
            if (error.name !== 'CRUDValidationError' && error.name !== 'DuplicatePrimaryKeyError') {
              throw new Error(`Failed to import company because of error: ${error.message}`);
            }
          }
        })
      );
      companyBatchCount++;
      let companyProgress = Math.round((companyBatchCount * 100) / companyBatches.length);
      updateElementText(loaderSelector, `Importing companies: ${companyProgress}%`);
    }

    // Import Person records into the data group in batches
    updateElementText(loaderSelector, 'Importing persons...');
    let personBatches = getBatches(personRecords, 10);
    let personBatchCount = 0;
    for (let personBatch of personBatches) {
      await Promise.all(
        personBatch.map(async (person) => {
          let newPersonId = await convertStringToId(`${dataGroupId},${person.publicId}`);

          try {
            await socket.invoke('crud', {
              action: 'create',
              type: 'Person',
              publisherId,
              value: {
                ...person,
                id: newPersonId,
                dataGroupId,
                accountId,
                currentCompanyId: person.currentCompanyId ? updatedCompanyIds[person.currentCompanyId] : undefined
              }
            });
          } catch (error) {
            if (error.name === 'CRUDValidationError' || error.name === 'DuplicatePrimaryKeyError') {
              return;
            } else {
              throw new Error(`Failed to import person because of error: ${error.message}`);
            }
          }

          // Get Job records for this Person
          const jobs = await getRecords({
            socket,
            type: 'Job',
            viewName: 'personView',
            viewParams: { personId: person.id }
          });

          // Import Job records in batches
          let jobBatches = getBatches(jobs, 10);
          for (let jobBatch of jobBatches) {
            await Promise.all(
              jobBatch.map(async (job) => {
                try {
                  await socket.invoke('crud', {
                    action: 'create',
                    type: 'Job',
                    publisherId,
                    value: {
                      ...job,
                      id: await convertStringToId(
                        `${dataGroupId},${person.publicId},${job.companyPublicId || job.companyName},${job.jobStartTimestamp},${job.jobTitle}`,
                      ),
                      dataGroupId,
                      accountId,
                      personId: newPersonId,
                      companyId: job.companyId ? updatedCompanyIds[job.companyId] : undefined
                    }
                  });
                } catch (error) {
                  if (error.name !== 'CRUDValidationError' && error.name !== 'DuplicatePrimaryKeyError') {
                    throw new Error(`Failed to import job because of error: ${error.message}`);
                  }
                }
              })
            );
          }

          // Get Education records for this Person
          const educations = await getRecords({
            socket,
            type: 'Education',
            viewName: 'personView',
            viewParams: { personId: person.id }
          });

          // Import Education records in batches
          let educationBatches = getBatches(educations, 10);
          for (let educationBatch of educationBatches) {
            await Promise.all(
              educationBatch.map(async (education) => {
                try {
                  await socket.invoke('crud', {
                    action: 'create',
                    type: 'Education',
                    publisherId,
                    value: {
                      ...education,
                      id: await convertStringToId(
                        `${dataGroupId},${person.publicId},${education.eduSchoolId || education.eduSchoolName},${education.eduDegreeName ? education.eduDegreeName : ""}`,
                      ),
                      dataGroupId,
                      accountId,
                      personId: newPersonId
                    }
                  });
                } catch (error) {
                  if (error.name !== 'CRUDValidationError' && error.name !== 'DuplicatePrimaryKeyError') {
                    throw new Error(`Failed to import education because of error: ${error.message}`);
                  }
                }
              })
            );
          }
        })
      );
      personBatchCount++;
      let personProgress = Math.round((personBatchCount * 100) / personBatches.length);
      updateElementText(loaderSelector, `Importing persons, jobs and educations: ${personProgress}%`);
    }

    updateElementText(loaderSelector, 'Import complete!');
    setTimeout(() => {
      updateElementStyle(loaderSelector, 'display', 'none');
    }, 5000);

  } catch (error) {
    console.error('Error importing from project:', error);
    updateElementText(loaderSelector, 'Import failed. Please check console for details.', 'error');
  }
}
