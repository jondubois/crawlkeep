const { readFile, readdir } = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const BATCH_SIZE = 100;

function getBatches(list, batchSize) {
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

async function getCuratedTagSets(curatedCompanySetDir, clientSocket) {
  let tagCuratedSets = {};
  if (curatedCompanySetDir) {
    console.log('Preparing curated sets...');
    let curatedFiles = await readdir(curatedCompanySetDir);
    for (let fileName of curatedFiles) {
      let fileContent = await readFile(
        path.resolve(curatedCompanySetDir, fileName),
        { encoding: 'utf8' }
      );
      let sourceCompanyIds = JSON.parse(fileContent);
      let tagName = fileName.split('.')[0];

      let companyBatches = getBatches(sourceCompanyIds, BATCH_SIZE);
      let companyIdSet = new Set();
      let processedCount = 0;

      for (let batch of companyBatches) {
        let companyIds = await Promise.all(
          batch.map(async (companyPublicId) => {
            let results = await clientSocket.invoke('crud', {
              action: 'read',
              type: 'Company',
              view: 'groupIdCompanyIdView',
              viewParams: {
                companyId: companyPublicId
              },
              offset: 0,
              pageSize: 1
            });
            return results.data[0];
          })
        );
        for (let companyId of companyIds) {
          if (companyId) {
            companyIdSet.add(companyId);
          }
        }
        processedCount++;
        console.log(
          `Prepared ${processedCount} out of ${companyBatches.length} batches of company curated sets from the file ${fileName}`
        );
      }

      tagCuratedSets[tagName] = companyIdSet;
    }
  }
  return tagCuratedSets;
}

function convertStringToId(string) {
  if (string == null) {
    return undefined;
  }
  let idHex = crypto.createHash('sha256').update(string).digest('hex').slice(0, 32);

  let third = (
    (parseInt(idHex.slice(12, 16), 16) & 0x0fff) | 0x4000
  ).toString(16);

  let fourth = (
    (parseInt(idHex.slice(16, 20), 16) & 0x3fff) | 0x8000
  ).toString(16);

  return `${idHex.slice(0, 8)}-${idHex.slice(8, 12)}-${third}-${fourth}-${idHex.slice(20, 32)}`;
}

function computeCompanyId(resource) {
  if (!resource || !resource.company_id) {
    return null;
  }
  return convertStringToId(resource.company_id);
}

module.exports = {
  getBatches,
  getCuratedTagSets,
  convertStringToId,
  computeCompanyId
};