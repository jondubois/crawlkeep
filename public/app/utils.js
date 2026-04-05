const EMPLOYEE_BATCH_SIZE = 50;
const RECORD_BATCH_SIZE = 50;

export const DATA_MINER_URL = 'https://saasufy.com/insnare/api';
export const DATA_MINER_ADD_TAGS_URL = `${DATA_MINER_URL}/add-tags`;
export const DATA_MINER_COMPUTE_EMBEDDINGS_URL = `${DATA_MINER_URL}/compute-embeddings`;

export async function computeVectorEmbeddings(items) {
  let response = await fetch(DATA_MINER_COMPUTE_EMBEDDINGS_URL, {
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify({ items })
  });
  let result = await response.json();
  return result?.embeddings || [];
}

export function computeVectorSimilarity(vector1, vector2) {
  if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
  }
  
  if (vector1.length === 0) {
      throw new Error('Vectors cannot be empty');
  }
  
  let dotProduct = 0;
  for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
  }
  
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
  }
  return dotProduct / (magnitude1 * magnitude2);
}

export function softmax(arr, temperature = 1) {
  const exponentials = arr.map(x => Math.exp(x / temperature));
  const sum = exponentials.reduce((acc, val) => acc + val, 0);
  const probabilities = exponentials.map(exp => exp / sum);
  return probabilities.reduce((acc, prob, i) => acc + prob * arr[i], 0);
}

export const fieldSanitizer = {
  tags: (valueString) => valueString
    .replace('.years-any', '')
    .replace('.count-any', '')
    .replace(/(?<=edu:[^.]+)\.years-[0-9]{1,2}/, '')
};

export const companyDefaultFieldParts = {
  tags: [ 'position:electronics-engineering', '.years-any', '.count-any' ]
};

export function getDefaultEncodedCompanyFilterTagPart() {
  let tagSanitizer = fieldSanitizer.tags;
  let part = `tags index-equals ${
    tagSanitizer(companyDefaultFieldParts.tags[0])
  }${
    tagSanitizer(companyDefaultFieldParts.tags[1])
  }${
    tagSanitizer(companyDefaultFieldParts.tags[2])
  }`;
  return encodeURIComponent(part);
}

export async function getRecordIds(socket, type, viewName, viewParams, startPage, maxPages, pageSize) {
  if (startPage == null) startPage = 0;
  if (maxPages == null) maxPages = 10;
  if (pageSize == null) pageSize = 100;
  let currentPage = startPage;
  let lastPage = currentPage + maxPages;
  let isLastPage = false;
  let modelIds = [];
  while (!isLastPage && currentPage < lastPage) {
    let result = await socket.invoke('crud', {
      action: 'read',
      type,
      offset: currentPage * pageSize,
      view: viewName,
      viewParams,
      pageSize
    });
    isLastPage = result.isLastPage;
    modelIds.push(...result.data);
    currentPage++;
  }
  return modelIds;
}

export async function getRecord({ socket, type, id, fields }) {
  if (!fields) {
    return socket.invoke('crud', {
      action: 'read',
      type,
      id
    });
  }
  let data = await Promise.all(
    fields.map(async (field) => {
      return socket.invoke('crud', {
        action: 'read',
        type,
        id,
        field
      });
    })
  );
  let fieldCount = fields.length;
  let record = {};
  for (let i = 0; i < fieldCount; i++) {
    record[fields[i]] = data[i];
  }
  return record;
}

export async function getRecordCount({ socket, type, viewName, viewParams, offset }) {
  let result = await socket.invoke('crud', {
    action: 'read',
    type,
    offset: offset || 0,
    view: viewName,
    viewParams,
    pageSize: 0,
    getCount: true
  });
  return Math.max(result.count - offset, 0);
}

export async function* generateRecords({ socket, type, viewName, viewParams, fields, startPage, pageSize, maxAttempts }) {
  if (startPage == null) startPage = 0;
  if (pageSize == null) pageSize = 100;
  if (maxAttempts == null) maxAttempts = 10;
  
  let currentPage = startPage;
  let isLastPage = false;
  let failureCount = 0;

  while (!isLastPage) {
    try {
      let result = await socket.invoke('crud', {
        action: 'read',
        type,
        offset: currentPage * pageSize,
        view: viewName,
        viewParams,
        pageSize
      });
      let idList = result.data || [];
      for (let id of idList) {
        yield await getRecord({ socket, type, id, fields });
      }
      isLastPage = result.isLastPage;
      currentPage++;
      failureCount = 0;
    } catch (error) {
      if (++failureCount > maxAttempts) {
        throw new Error(`Record generation failed after max consecutive attempts because of error: ${error.message}`);
      }
    }
  }
}

export async function getRecords({ socket, type, viewName, viewParams, fields, startPage, maxPages, pageSize }) {
  let recordIds = await getRecordIds(socket, type, viewName, viewParams, startPage, maxPages, pageSize);
  let recordIdBatches = getBatches(recordIds, RECORD_BATCH_SIZE);
  let records = [];
  for (let idBatch of recordIdBatches) {
    let recordBatch = await Promise.all(
      idBatch.map(async (id) => {
        return getRecord({ socket, type, id, fields });
      })
    );
    records.push(...recordBatch);
  }
  return records;
}

export async function getCompanyCountByCompanyFilter(companyFilterQuery) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();
  let result = await socket.invoke('crud', {
    action: 'read',
    type: 'Company',
    offset: 0,
    view: getCompanyViewName(),
    viewParams: {
      ...getIndexedFiltersFromCompanyQueryObject(
        companyFilterQuery,
        {
          dataGroupId: '',
          tags: companyDefaultFieldParts.tags.join('')
        }
      ),
      query: getNormalizedFiltersFromQuery(companyFilterQuery)
    },
    pageSize: 0,
    getCount: true
  });
  return result.count;
}

export async function getCompanyIdsByCompanyFilter(companyFilterQuery, startPage, maxPages, pageSize) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();
  let companies = await getRecordIds(
    socket,
    'Company',
    getCompanyViewName(),
    {
      ...getIndexedFiltersFromCompanyQueryObject(
        companyFilterQuery,
        {
          dataGroupId: '',
          tags: companyDefaultFieldParts.tags.join('')
        }
      ),
      query: getNormalizedFiltersFromQuery(companyFilterQuery)
    },
    startPage,
    maxPages,
    pageSize
  );
  return companies;
}

export async function getCompanyIdsByEmployeesMap(employeeIds) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();

  let batches = getBatches(employeeIds, EMPLOYEE_BATCH_SIZE);
  let companyIdEmployeeMap = {};

  for (let personIds of batches) {
    let companyEmployeeEntries = await Promise.all(
      personIds.map(async (personId) => {
        let companyId = await socket.invoke('crud', {
          action: 'read',
          type: 'Person',
          id: personId,
          field: 'currentCompanyId'
        });
        return [
          personId,
          companyId
        ];
      })
    );
    for (let [ personId, companyId ] of companyEmployeeEntries) {
      companyIdEmployeeMap[personId] = companyId;
    }
  }
  return companyIdEmployeeMap;
}

export async function getCompanyData(companyId, field) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();
  return socket.invoke('crud', {
    action: 'read',
    type: 'Company',
    id: companyId,
    field
  });
}

export async function getPersonData(personId, field) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();
  return socket.invoke('crud', {
    action: 'read',
    type: 'Person',
    id: personId,
    field
  });
}

export async function getEmployeeIdsByPeopleFilter(companyIds, peopleFilterQuery) {
  let socketProvider = document.querySelector('.main-socket-provider');
  let socket = socketProvider.getSocket();
  let companyIdsString = companyIds.join(', ');
  let employeeIds = await getRecordIds(
    socket,
    'Person',
    'companySearchView',
    {
      currentCompanyId: companyIdsString,
      query: peopleFilterQuery
    }
  );
  return [ ...new Set(employeeIds) ];
}

export function getCompanyViewName() {
  let isCustomDataSource = getPartFromURL('data-source') === 'custom';
  if (isCustomDataSource) {
    return 'groupIdQueryView';
  }
  return 'tagDataGroupIdQueryView';
}

function parseAST(str) {
  let root = { type: 'root', children: [] };
  let stack = [ root ];
  let currentText = '';

  for (let i = 0; i < str.length; i++) {
    let char = str[i];

    if (char === '(') {
      if (currentText) {
        stack[stack.length - 1].children.push({
          type: 'text',
          value: currentText
        });
        currentText = '';
      }

      let newNode = { type: 'group', children: [] };
      stack[stack.length - 1].children.push(newNode);
      stack.push(newNode);

    } else if (char === ')') {
      if (currentText) {
        stack[stack.length - 1].children.push({
          type: 'text',
          value: currentText
        });
        currentText = '';
      }

      if (stack.length > 1) {
        stack.pop();
      }
    } else {
      currentText += char;
    }
  }

  if (currentText) {
    stack[stack.length - 1].children.push({
      type: 'text',
      value: currentText
    });
  }

  return root;
}

function replaceWithDepth(ast, currentDepth = 0) {
  if (!ast || !ast.children) {
    return ast;
  }
  
  let processedChildren = ast.children.map(child => {
    if (child.type === 'text') {
      let updatedValue = child.value.replace(
        / ~(AND|OR)([0-9]+)~ /g,
        (match, operator, number) => ` ~${operator}${currentDepth}~ `
      );
      
      return {
        ...child,
        value: updatedValue
      };
      
    } else if (child.type === 'group') {
      return replaceWithDepth(child, currentDepth + 1);
      
    } else {
      return child;
    }
  });
  
  return {
    ...ast,
    children: processedChildren
  };
}

function astToString(node) {
  if (node.type === 'text') {
    return node.value;
  } else if (node.type === 'group') {
    let nodeString = node.children.map(astToString).join('');
    // (?i) is a special token within the filter string.
    if (nodeString === '?i') {
      return '(' + nodeString + ')';
    }
    return nodeString;
  } else if (node.type === 'root') {
    return node.children.map(astToString).join('');
  }
  return '';
}

export function expandBooleanFilters(queryParts) {
  return queryParts.map(
    (part) => {
      let subParts = part.split(' contains ');
      if (subParts.length > 1) {
        let field = subParts[0];
        // In case the value itself has multiple 'contains' words in it, only
        // consider the first one to be the keyword.
        let value = subParts.slice(1).join(' contains ');
        let isCaseInsensitive = value.indexOf('(?i)') === 0;
        value = field + ' contains ' + value.replace(
          /( [|][|] | &amp;&amp; | && )/g,
          (operator) => {
            let fullOperator = operator === ' || ' ? ' ~OR1~ ' : ' ~AND1~ ';
            return `${fullOperator}${field} contains ${isCaseInsensitive ? '(?i)' : ''}`;
          }
        );
        value = value.replace(/ contains (\(\?i\)\( *)!/g, ' excludes (?i)(');
        value = value.replace(/ contains (\(\?i\) *)!/g, ' excludes (?i)');
        value = value.replace(/ contains (\(+ *)!/g, ' excludes $1');
        value = value.replace(/ contains !/g, ' excludes ');
        return value;
      }
      subParts = part.split(' = ');
      if (subParts.length > 1) {
        let field = subParts[0];
        let value = subParts.slice(1).join(' = ');
        value = field + ' = ' + value.replace(
          /( [|][|] | &amp;&amp; | && )/g,
          (operator) => {
            let fullOperator = operator === ' || ' ? ' ~OR1~ ' : ' ~AND1~ ';
            return `${fullOperator}${field} = `;
          }
        );
        return value;
      }
      return part;
    }
  );
}

export function getNormalizedFiltersFromQuery(queryFilter) {
  let rawQuery = decodeURIComponent(queryFilter);
  let querySeparator = ' ~AND~ ';
  let queryParts = rawQuery.split(querySeparator).filter((part) => {
    let subParts = part.split(' ');
    let field = subParts[0];
    if (!field) return false;
    if (part === 'companyEmployeeCountLow = any') {
      return false;
    }
    return true;
  });

  let indexSeparator = ' index-equals ';
  let regularFilters = expandBooleanFilters(
    queryParts.filter(part => !part.includes(indexSeparator))
  );

  let simplifiedFilters = [];
  for (let filterString of regularFilters) {
    let filterAST = parseAST(filterString);
    let transformedAST = replaceWithDepth(filterAST, 1);
    let newFilter = astToString(transformedAST);

    simplifiedFilters.push(newFilter);
  }
  return simplifiedFilters.join(querySeparator);
}

export function getIndexedFiltersFromCompanyQuery(companyQuery, defaultIndexedFilters) {
  let isCustomDataSource = getPartFromURL('data-source') === 'custom';
  let dataGroupId = isCustomDataSource ? getPartFromURL('source-id') : '';
  
  if (defaultIndexedFilters == null) {
    defaultIndexedFilters = {
      tags: companyDefaultFieldParts.tags.join('')
    };
  }
  let rawQuery = decodeURIComponent(companyQuery);
  let queryParts = rawQuery.split(' ~AND~ ');
  let indexSeparator = ' index-equals ';
  let indexedFilters = queryParts
    .filter(part => part.includes(indexSeparator))
    .map((part) => {
      let subParts = part.split(indexSeparator);
      let field = subParts[0];
      let value = subParts.slice(1).join(indexSeparator);
      return [ field, value ];
    });
  
  let defaultFilterEntries = Object.entries(defaultIndexedFilters || {});

  for (let [ field, value ] of defaultFilterEntries) {
    let matchingFilter = indexedFilters.find(filterItem => filterItem[0] === field);
    if (!matchingFilter) {
      indexedFilters.push([ field, value ]);
    }
  }

  indexedFilters.sort(
    (itemA, itemB) => {
      if (itemA[0] > itemB[0]) return 1;
      if (itemA[0] < itemB[0]) return -1;
      if (itemA[1] > itemB[1]) return 1;
      if (itemA[1] < itemB[1]) return -1;
      return 0;
    }
  );

  return indexedFilters.map(([ field, value ]) => {
    if (field === 'tags' && dataGroupId) {
      return [ 'dataGroupId', dataGroupId ];
    }
    let baseKeyFieldSanitizer = fieldSanitizer[field] || ((item) => item);
    return [ field, baseKeyFieldSanitizer(value) ];
  });
}

export function getCompanyViewParams(companyQuery, defaultIndexedFilters) {
  return {
    query: getNormalizedFiltersFromQuery(companyQuery),
    ...getIndexedFiltersFromCompanyQueryObject(companyQuery, defaultIndexedFilters)
  };
}

export function getIndexedFiltersFromCompanyQueryString(companyQuery, defaultIndexedFilters) {
  let isCustomDataSource = getPartFromURL('data-source') === 'custom';
  let sanitizedCompanyQuery = isCustomDataSource ?
    setFilterInURLPart(companyQuery, 'tags', 'index-equals', '') : companyQuery;
  return getIndexedFiltersFromCompanyQuery(sanitizedCompanyQuery, defaultIndexedFilters).map(
    ([ field, value ]) => {
      return `${field}=${value}`;
    }
  ).join(',');
}

export function getIndexedFiltersFromCompanyQueryObject(companyQuery, defaultIndexedFilters) {
  return Object.fromEntries(
    getIndexedFiltersFromCompanyQuery(companyQuery, defaultIndexedFilters)
  );
}

export function mergePartialParams(filterMap, defaultFieldParts) {
  if (!defaultFieldParts) defaultFieldParts = {};
  let result = {};
  let partialParams = {};
  let operators = {};

  for (let [ key, value ] of Object.entries(filterMap)) {
    let match = key.match(/^(.+)\.([0-9]+)$/);
    if (match) {
      let [ fullKey, baseKey, index ] = match;
      if (!partialParams[baseKey]) {
        partialParams[baseKey] = [];
      }
      partialParams[baseKey][parseInt(index)] = value.split(' ').slice(2).join(' ');
      let operator = value.match(/^[^ ]+\.[0-9]+ ([^ ]+) /)[1];
      if (operator) {
        operators[baseKey] = operator;
      }
    } else {
      result[key] = value;
    }
  }
  for (let [ baseKey, values ] of Object.entries(partialParams)) {
    let defaultIndexKeyParts = defaultFieldParts[baseKey] || [];
    for (let i = 0; i < defaultIndexKeyParts.length; i++) {
      if (values[i] == null) {
        values[i] = defaultIndexKeyParts[i];
      }
    }
    let baseKeyFieldSanitizer = fieldSanitizer[baseKey] || ((item) => item);
    result[baseKey] = `${baseKey} ${operators[baseKey] || 'index-equals'} ${baseKeyFieldSanitizer(values.filter(item => item).join(''))}`;
  }
  return result;
}

export function getPartFromURL(type, url) {
  if (url == null) url = location.hash || '';
  return (url.match(new RegExp(`\/${type}\/([^\/]*)`)) || ['', ''])[1];
}

export function getFilterFromURLPart(urlPart, fieldName, operator) {
  let filterValue = (
    decodeURIComponent(urlPart || '').replace(/ &amp;&amp; /g, ' && ').split(' ~AND~ ').find(
      query => query.indexOf(`${fieldName}${operator ? ' ' + operator : ''}`) === 0
    ) || ''
  ).replace(/^.*?( contains | = | > | >= | < | <= | index-equals )(\(\?i\))?/, '');
  return filterValue;
}

export function setFilterInURLPart(urlPart, fieldName, operator, value) {
  let foundMatch = false;
  let transformedQueries = decodeURIComponent(urlPart || '').split(' ~AND~ ').filter(query => query).map(
    (query) => {
      if (query.indexOf(`${fieldName} ${operator}`) === 0) {
        foundMatch = true;
        return query.replace(/^(.*?)( contains | = | > | >= | < | <= | index-equals ).*/, `$1$2${value}`);
      }
      return query;
    }
  );
  if (!foundMatch) {
    transformedQueries.push(`${fieldName} ${operator} ${value}`);
  }
  transformedQueries.sort();
  return encodeURIComponent(transformedQueries.join(' ~AND~ '));
}

export function removeFilterFromURLPart(urlPart, fieldName, operator) {
  let transformedQueries = decodeURIComponent(urlPart || '').split(' ~AND~ ').filter(
    (query) => query && query.indexOf(`${fieldName} ${operator}`) !== 0
  );
  return encodeURIComponent(transformedQueries.join(' ~AND~ '));
}

export function constrainCompanyFiltersToCompanies(companyFilters, companies) {
  let companySet = new Set(companies);

  let currentFilterCompanies = getFilterFromURLPart(companyFilters, 'id', 'contains')
    .split('|')
    .filter(companyId => companyId);

  if (currentFilterCompanies.length) {
    currentFilterCompanies = currentFilterCompanies.filter(companyId => companySet.has(companyId));
  } else {
    currentFilterCompanies = companies;
  }
  currentFilterCompanies = currentFilterCompanies.filter(Boolean);

  if (!currentFilterCompanies.length) {
    currentFilterCompanies.push('00000000-0000-4000-8000-000000000000');
  }

  return setFilterInURLPart(companyFilters, 'id', 'contains', currentFilterCompanies.join('|'));
}

export function getFilterFromURL(url, type, fieldName, operator, customExtractor) {
  let filterValue = getFilterFromURLPart(
    getPartFromURL(type, url),
    fieldName,
    operator
  );
  if (customExtractor) {
    return customExtractor(filterValue);
  }
  return filterValue;
}

export function getFilterFromLocationHash(type, fieldName, operator, customExtractor) {
  return getFilterFromURL(location.hash || '', type, fieldName, operator, customExtractor);
}

export async function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export function getBatches(list, batchSize) {
  let batches = [];
  let currentBatch = [];
  for (let item of list) {
    if (currentBatch.length >= batchSize) {
      batches.push(currentBatch);
      currentBatch = [];
    }
    currentBatch.push(item);
  }
  if (currentBatch.length) {
    batches.push(currentBatch);
  }
  return batches;
}

export function getHashURLWithParamValues(hash, params, appendNew) {
  for (let [ paramName, paramValue ] of Object.entries(params)) {
    let paramNameRegExp = new RegExp(`/${paramName}/[^/]*`);
    if (hash.match(paramNameRegExp)) {
      hash = hash.replace(paramNameRegExp, `/${paramName}/${paramValue}`);
    } else if (appendNew) {
      hash =`${hash}/${paramName}/${paramValue}`;
    }
  }
  return hash;
}

export function getURLWithParamValues(params, appendNew) {
  return getHashURLWithParamValues(location.hash, params, appendNew);
}