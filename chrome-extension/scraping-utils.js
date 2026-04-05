export async function fetchCompanyIdFromUniversalName(params, config) {
  let endpointConfig = config.endpoints.companyIdFromUniversalName;
  let { universal_name } = params;
  let cleanParams = {
    universal_name: universal_name ?? ""
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'companyIdFromUniversalName');
  let cleanResults = results.map(record => record.company_id).filter(Boolean);
  return cleanResults[0];
}

export async function fetchCompanyIdFromName(params, config) {
  let endpointConfig = config.endpoints.companyIdFromName;
  let { company_name } = params;
  let cleanParams = {
    company_name: encodeURIComponent(company_name ?? "")
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'companyIdFromName');
  let cleanResults = results.map(record => record.company_id).filter(Boolean);
  return cleanResults[0];
}

// Example: await fetchCompanyEmployees({ start: 24, count: 20, company_ids: [3561266] });
export async function fetchCompanyEmployees(params, config) {
  let endpointConfig = config.endpoints.companyEmployees;
  let { start, company_ids, count } = params;
  let cleanParams = {
    start: start ?? 0,
    company_ids: company_ids?.toString() ?? "",
    count: count ?? 20
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.basicRequestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'companyEmployees');
  let meta = results.find(record => record && record.employee_count != null);
  let data = results.filter(record => record && record.profile_urn != null);
  return { meta, data };
}

export async function fetchSpecificCompanyEmployees(params, config) {
  let endpointConfig = config.endpoints.companyEmployees;
  let { start, keywords, company_ids, industry_ids, count } = params;
  let cleanParams = {
    start: start ?? 0,
    keywords: encodeURIComponent(keywords ?? ""),
    company_ids: company_ids?.toString() ?? "",
    industry_ids: industry_ids?.toString() ?? "",
    count: count ?? 20
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let preparedURL = computeFromTemplate(endpointConfig.settings.advancedRequestURL, cleanParams);
  if (endpointConfig.settings.sanitizeURLRegex != null && endpointConfig.settings.sanitizeURLReplaceWith != null) {
    let sanitizeURLRegExp = new RegExp(endpointConfig.settings.sanitizeURLRegex, 'g');
    preparedURL = preparedURL.replace(sanitizeURLRegExp, endpointConfig.settings.sanitizeURLReplaceWith);
  }
  let res = await fetch(
    preparedURL,
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'companyEmployees');
  let meta = results.find(record => record && record.employee_count != null);
  let data = results.filter(record => record && record.profile_urn != null);
  return { meta, data };
}

export async function fetchIndustryIds(params, config) {
  let endpointConfig = config.endpoints.industryIds;
  let { keywords } = params;
  let cleanParams = {
    keywords: encodeURIComponent(keywords ?? "")
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'industryIds');
  return results.map(record => record.industry_id).filter(Boolean);
}

// TODO 0: Use parser instead of hardcoding same pageInstanceId.
export async function fetchGeoIds(keywords) {
  let headers = getHeaders(config?.headers, 'd_flagship3_search_srp_all');
  let res = await fetch(`https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(keywords:${
    encodeURIComponent(keywords || "")
  },query:(typeaheadFilterQuery:(geoSearchTypes:List(MARKET_AREA,COUNTRY_REGION,ADMIN_DIVISION_1,CITY))),type:GEO)&queryId=voyagerSearchDashReusableTypeahead.35c83322e303eeb7ced9eb48e83a165c`, {
    headers,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include"
  });
  let result = await res.json();
  let cleanResult = result.included
    .map((record) => {
      let entityUrnParts = record.entityUrn.split(":");
      return entityUrnParts[entityUrnParts.length - 1];
    })
    .filter(Boolean);
  return cleanResult;
}

// public_id such as john-smith-a3454365
export async function fetchEmployeeProfile(params, config) {
  let endpointConfig = config.endpoints.person;
  let { public_id } = params;
  let cleanParams = {
    public_id: encodeURIComponent(public_id)
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  return parseResponse(config.parseURL, res, endpointConfig, params, 'person');
}

export async function fetchEmployeeFullProfile(params, config) {
  let endpointConfig = config.endpoints.personProfile;
  let { profile_urn } = params;
  let cleanParams = {
    profile_urn: encodeURIComponent(profile_urn)
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  return parseResponse(config.parseURL, res, endpointConfig, params, 'personProfile');
}

export async function fetchEmployeeJobs(params, config) {
  let endpointConfig = config.endpoints.job;
  let { profile_urn } = params;
  let cleanParams = {
    profile_urn: encodeURIComponent(profile_urn)
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  return parseResponse(config.parseURL, res, endpointConfig, params, 'job');
}

export async function fetchEmployeeSkills(params, config) {
  let endpointConfig = config.endpoints.skill;
  let { profile_urn } = params;
  let cleanParams = {
    profile_urn: encodeURIComponent(profile_urn)
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  return parseResponse(config.parseURL, res, endpointConfig, params, 'skill');
}

export async function fetchEmployeeEducations(params, config) {
  let endpointConfig = config.endpoints.education;
  let { profile_urn } = params;
  let cleanParams = {
    profile_urn: encodeURIComponent(profile_urn)
  };
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, cleanParams),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  return parseResponse(config.parseURL, res, endpointConfig, params, 'education');
}

// params must include both the company id as a string and numeric
export async function fetchCompanyProfile(params, config) {
  let endpointConfig = config.endpoints.companyProfile;
  let headers = getHeaders(config?.headers, endpointConfig.settings.pageInstanceId);
  let res = await fetch(
    computeFromTemplate(endpointConfig.settings.requestURL, params),
    {
      headers,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include"
    }
  );
  let results = await parseResponse(config.parseURL, res, endpointConfig, params, 'companyProfile');
  return results[0];
}

function getHeaders(headersConfig, pageInstanceId) {
  return {
    "csrf-token": `ajax:${
      /ajax\:(?<csrf_token>\d+)/.exec(document.cookie).groups.csrf_token
    }`,
    ...getSecurityHeaders(),
    ...getDefaultLIHeaders(headersConfig, pageInstanceId),
    ...headersConfig.values
  };
}

function getSecurityHeaders() {
  let userAgent = navigator.userAgent;
  
  let uaString = "";
  let notABrandVersion = navigator.userAgentData?.brands?.[0]?.version || "8";
  
  if (userAgent.indexOf("Chrome") !== -1) {
    let chromeVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
    uaString = `"Chromium";v="${chromeVersion}", "Google Chrome";v="${chromeVersion}"`;
  } else if (userAgent.indexOf("Firefox") !== -1) {
    let firefoxVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
    uaString = `"Firefox";v="${firefoxVersion}"`;
  } else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) {
    let safariVersion = userAgent.match(/Safari\/(\d+)/)?.[1] || "";
    uaString = `"Safari";v="${safariVersion}"`;
  } else {
    uaString = `"Not A(Brand";v="${notABrandVersion}"`;
  }
  
  uaString = `"Not A(Brand";v="${notABrandVersion}", ${uaString}`;
  
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  let mobileValue = isMobile ? "?1" : "?0";
  
  let platform = "Unknown";
  if (userAgent.indexOf("Win") !== -1) platform = "Windows";
  else if (userAgent.indexOf("Mac") !== -1) platform = "macOS";
  else if (userAgent.indexOf("Linux") !== -1) platform = "Linux";
  else if (userAgent.indexOf("Android") !== -1) platform = "Android";
  else if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) platform = "iOS";

  let secHeaders;

  if (navigator.brave) {
    secHeaders = {};
  } else {
    secHeaders = {
      "sec-ch-ua": uaString,
      "sec-ch-ua-mobile": mobileValue,
      "sec-ch-ua-platform": `"${platform}"`
    };
  }
  
  return {
    ...secHeaders,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  };
}

// TODO 0: Some pages require the instanceID to be in base64-like format, others require UUID.
// Currently, we always pass in Base64 format.
function generatePageInstanceId(pageInstanceId) {
  if (!pageInstanceId) {
    throw new Error("Page instance ID was not specified for an API call");
  }
  let randomStr = () => {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 22; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result + "==";
  };
  
  return `urn:li:page:${pageInstanceId};${randomStr()}`;
}

function getClientVersion(headersConfig) {
  let meta_elm = document.querySelector(
    headersConfig.clientVersionSelector
  );
  let raw = meta_elm?.getAttribute(headersConfig.clientVersionAttributeName)?.trim();
  if (!raw) {
    raw = headersConfig.fallbackClientVersion;
  }
  if (!raw) {
    throw new Error("Failed to extract client version from page because it could not be found");
  };

  let parsed;
  let version;
  try {
    parsed = JSON.parse(raw);
    version = String(parsed?.version || raw);
  } catch (error) {
    version = String(raw);
  }
  
  let versionPattern = /^\d+(?:.\d+)+$/;
  if (!versionPattern.test(version)) {
    throw new Error("Failed to extract client version from page due to format issue");
  }
  return version;
}

function getDefaultLIHeaders(headersConfig, pageInstanceId) {
  let timezoneOffset = new Date().getTimezoneOffset() / -60;
  let timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Brisbane";
  
  let displayDensity = window.devicePixelRatio || 1;
  let displayWidth = window.screen.width || 1920;
  let displayHeight = window.screen.height || 1080;
  
  let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  let deviceFormFactor = isMobile ? "MOBILE" : "DESKTOP";
  
  let clientVersion = getClientVersion(headersConfig);
  
  return {
    "x-li-lang": "en_US",
    "x-li-page-instance": generatePageInstanceId(pageInstanceId),
    "x-li-pem-metadata": "Voyager - Profile=view-experience-details",
    "x-li-track": JSON.stringify({
      "clientVersion": clientVersion,
      "mpVersion": clientVersion,
      "osName": "web",
      "timezoneOffset": timezoneOffset,
      "timezone": timezoneName,
      "deviceFormFactor": deviceFormFactor,
      "mpName": "voyager-web",
      "displayDensity": displayDensity,
      "displayWidth": displayWidth,
      "displayHeight": displayHeight
    })
  };
}

export function computeFromTemplate(template, data) {
  return replaceExpressions(template, (placeholder) => {
    let exprMatches = placeholder.match(/^\{\{(.*)\}\}$/) || [];
    return getDataAtPath(data, exprMatches[1]);
  });
}

function getDataAtPath(data, targetPath) {
  if (typeof targetPath !== 'string') return undefined;
  let pathParts = targetPath.split('/');
  if (pathParts[0] === '') {
    pathParts.shift();
  }
  let currentData = data;
  for (let part of pathParts) {
    currentData = currentData?.[part];
    if (currentData == null) break;
  }
  return currentData;
}

function replaceExpressions(string, replaceFn) {
  let charList = (string || '').split('');
  let matches = [ ...selectExpressions(string) ];
  let charSubs = matches.map(item => String(replaceFn(item.value) ?? '').split(''));
  for (let i = matches.length - 1; i >= 0; i--) {
    let match = matches[i];
    charList.splice(match.startIndex, match.length, ...charSubs[i]);
  }
  return charList.join('');
}

function* selectExpressions(string) {
  let charList = string.split('');
  let isCapturing = false;
  let isTripleBracket = false;
  let captureList = [];
  let captureStartIndex = 0;
  for (let i = 1; i < charList.length; i++) {
    if (charList[i - 1] === '{' && charList[i] === '{') {
      captureList = [];
      captureList.push('{');
      isCapturing = true;
      captureStartIndex = i - 1;
      isTripleBracket = charList[i - 2] === '{';
      if (isTripleBracket) {
        captureList.push('{');
        captureStartIndex--;
      }
    }
    if (isCapturing) {
      captureList.push(charList[i]);
    } else if (captureList.length) {
      captureList.push('}');
      captureList.push('}');
      let closeBrackets = 2;
      if (isTripleBracket) {
        captureList.push('}');
        closeBrackets++;
      }
      yield {
        startIndex: captureStartIndex,
        length: (i + closeBrackets) - captureStartIndex,
        value: captureList.join('')
      };
      captureList = [];
    }
    if (
      charList[i + 1] === '}' && charList[i + 2] === '}' &&
      (!isTripleBracket || charList[i + 3] === '}')
    ) {
      isCapturing = false;
    }
  }
}

async function parseResponse(parseURL, response, endpointConfig, params, endpointName) {
  let text;
  if (endpointConfig.type === 'html-object') {
    text = await response.text();
  } else if (endpointConfig.type === 'html-json-array') {
    text = await response.text();
  } else {
    text = await response.json();
  }
  let res = await fetch(
    parseURL,
    {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        endpoint: endpointName,
        params
      }),
      method: "POST",
      mode: "cors"
    }
  );
  let result = await res.json();
  return result.data;
}

let snakeCaseRegExp = /_(.)/g;

export function toCamelCase(string) {
  return string.replace(snakeCaseRegExp, (text, firstChar) => {
    return firstChar.toUpperCase();
  });
}

export function flattenValue(value) {
  if (Array.isArray(value)) {
    return value.join('\t');
  }
  return value;
}

export function sanitizeResource(resource) {
  return Object.fromEntries(
    Object.entries(resource).map(([key, value]) => [
      toCamelCase(key),
      flattenValue(value),
    ]),
  );
}

export async function fetchAIRatePerson(aiRatePersonURL, person, categories) {
  person = person || {};
  let sanitizedPerson = {
    headline: person.headline || '',
    summary: person.summary,
    skills: person.skills ? person.skills.join(', ') : '',
    jobs: (person.jobs || []).map(job => sanitizeResource(job)),
    educations: (person.edus || []).map(edu => sanitizeResource(edu))
  };

  let res = await fetch(
    aiRatePersonURL,
    {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        person: sanitizedPerson,
        categories
      }),
      method: "POST",
      mode: "cors"
    }
  );
  let result = await res.json();
  return result?.categoryScores || [];
}

export async function fetchAIRateCompany(aiRateCompanyURL, company, categoryEmbeddings) {
  company = company || {};
  let sanitizedCompany = {
    companyName: company.company_name || '',
    specialities: company.specialities || '',
    companyDescription: company.company_description || ''
  };

  let res = await fetch(
    aiRateCompanyURL,
    {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        company: sanitizedCompany,
        categoryEmbeddings
      }),
      method: "POST",
      mode: "cors"
    }
  );
  let result = await res.json();
  return result?.categoryScores || [];
}

export async function fetchAIComputeCategoryEmbeddings(computeCategoryEmbeddingsURL, categories) {
  let res = await fetch(
    computeCategoryEmbeddingsURL,
    {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        categories
      }),
      method: "POST",
      mode: "cors"
    }
  );
  let result = await res.json();
  return result?.categoryEmbeddings || [];
}
