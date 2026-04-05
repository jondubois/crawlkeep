const fs = require('fs');
const util = require('util');
const path = require('path');

const socketClusterClient = require('socketcluster-client');

const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);

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

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000,
});

async function importBatch(batch, collectionName, batchIndex, batchCount, startTime, fileName, crudAction) {
  if (!crudAction) crudAction = 'create';
  let failedCount = 0;
  await Promise.all(
    batch.map(async (resource) => {
      let action = crudAction;
      let query = {
        action,
        type: collectionName,
      };
      if (action === 'update') {
        let { id, ...resourceWithoutId } = resource;
        query.id = id;
        query.value = resourceWithoutId;
      } else {
        query.value = resource;
      }
      try {
        await clientSocket.invoke('crud', query);
      } catch (error) {
        failedCount++;
        console.log(
          `Failed to process record with ID ${resource.id} because of error: ${error.name}`,
        );
      }
    })
  );
  let count = batchIndex + 1;
  let duration = Date.now() - startTime;
  let completedRatio = count / batchCount;
  let totalExpectedDuration = duration / completedRatio;
  let expectedRemainingDuration = totalExpectedDuration - duration;
  let completedPercentage = Math.round(completedRatio * 100);
  console.log(`File ${fileName} - Collection ${collectionName} - Processed ${count} out of ${batchCount} batches (${completedPercentage}%) - Est. remaining time: ${Math.round(expectedRemainingDuration / 1000)} seconds`);
  return failedCount;
}

async function importDataDir(dirPath, collectionName, serviceAuthKey, batchSize, fromFile, crudAction, extractResourcesFn, computeIdFn, sanitizeResourceFn) {
  let fileNames = await readdir(dirPath);
  fileNames.sort();
  if (fromFile) {
    let startFileIndex = fileNames.indexOf(fromFile);
    if (startFileIndex === -1) {
      console.error(`Failed to find a ${fromFile} file to resume processing from - Will start from the first file`);
    } else {
      fileNames.splice(0, startFileIndex);
    }
  }
  let fullFileNames = fileNames.map(fileName => path.join(dirPath, fileName));
  return importDataFiles(fullFileNames, collectionName, serviceAuthKey, batchSize, crudAction, extractResourcesFn, computeIdFn, sanitizeResourceFn);
}

async function importDataFiles(fileNames, collectionName, serviceAuthKey, batchSize, crudAction, extractResourcesFn, computeIdFn, sanitizeResourceFn) {
  if (!sanitizeResourceFn) {
    sanitizeResourceFn = (resource) => resource;
  }
  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey,
  });
  let skippedCount = 0;
  let validResourceCount = 0;
  for (let fileName of fileNames) {
    let fileData = JSON.parse(
      await readFile(fileName, { encoding: 'utf8' }),
    );
    if (!Array.isArray(fileData)) {
      fileData = [ fileData ];
    }
    for (let record of fileData) {
      let resourceList = extractResourcesFn(record) || [];
      for (let resource of resourceList) {
        let id = computeIdFn(resource, record);
        if (!id) {
          skippedCount++;
          continue;
        }
        validResourceCount++;
      }
    }
  }

  let batchCount = Math.ceil(validResourceCount / batchSize);
  let failedCount = 0;

  let startTime = Date.now();
  let currentBatch = [];
  let currentBatchIndex = 0;
  let currentFileName;

  for (let fileName of fileNames) {
    currentFileName = fileName;
    let fileData = JSON.parse(
      await readFile(fileName, { encoding: 'utf8' }),
    );
    if (!Array.isArray(fileData)) {
      fileData = [ fileData ];
    }
    for (let record of fileData) {
      let resourceList = extractResourcesFn(record) || [];
      for (let resource of resourceList) {
        let id = computeIdFn(resource, record);
        if (!id) continue;
        let sanitizedResource = {
          ...sanitizeResource(sanitizeResourceFn(resource, record)),
          id,
        };
        currentBatch.push(sanitizedResource);
        if (currentBatch.length >= batchSize) {
          failedCount += await importBatch(currentBatch, collectionName, currentBatchIndex, batchCount, startTime, fileName, crudAction);
          currentBatch = [];
          currentBatchIndex++;
        }
      }
    }
  }
  if (currentBatch.length) {
    failedCount += await importBatch(currentBatch, collectionName, currentBatchIndex, batchCount, startTime, currentFileName, crudAction);
    currentBatchIndex++;
  }

  console.log('DONE!');
  console.log('SKIPPED:', skippedCount);
  console.log('FAILED:', failedCount);
}

module.exports = {
  importDataDir,
  importDataFiles
};