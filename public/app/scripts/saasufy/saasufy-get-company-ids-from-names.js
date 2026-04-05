const socketClusterClient = require('socketcluster-client');
const { readFile, writeFile } = require('fs/promises');
const { getBatches } = require('./utils.js');

const BATCH_SIZE = 10;
const MIN_LENGTH_PARTIAL_MATCH = 4;

const companyNamesFile = process.argv[2];

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000
});

(async () => {
  let companyNamesText = await readFile(companyNamesFile, { encoding: 'utf8' });
  let companyNamesLines = companyNamesText.split(/\r?\n/);
  companyNamesLines.shift();
  let companyNames = companyNamesLines.flatMap(line => line.split(',')).filter(Boolean);

  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey: process.env.AUTH_KEY
  });

  let companyBatches = getBatches(companyNames, BATCH_SIZE);
  let allCompanyIds = [];
  let notFoundCompanyNames = [];
  let processedCount = 0;
  let batchCount = companyBatches.length;

  for (let nameBatch of companyBatches) {
    let companyInfos = await Promise.all(
      nameBatch.map(async (companyName) => {
        let result = await clientSocket.invoke('crud', {
          action: 'read',
          type: 'Company',
          view: companyName.length >= MIN_LENGTH_PARTIAL_MATCH ? 'companyNamePartialView' : 'companyNameLowerCaseView',
          viewParams: {
            companyName: companyName.toLowerCase()
          },
          offset: 0,
          pageSize: 1,
        });
        let currentCompanyId = result.data?.[0];
        if (!currentCompanyId) {
          notFoundCompanyNames.push(companyName);
        }
        return {
          id: currentCompanyId,
          name: companyName
        };
      })
    );
    for (let { id, name } of companyInfos) {
      if (id) {
        let companyId = await clientSocket.invoke('crud', {
          action: 'read',
          type: 'Company',
          id,
          field: 'companyId'
        });
        allCompanyIds.push(companyId);
      }
    }
    console.log(`Processed ${Math.round(processedCount / batchCount * 100)}%`);
    processedCount++;
  }

  console.log(`Found ${Math.round(allCompanyIds.length / companyNames.length * 100)}% of company IDs based on names`);

  let matchedFilePath = './matched-company-ids.json';
  let unmatchedFilePath = './unmatched-company-names.json';
  
  await writeFile(matchedFilePath, JSON.stringify(allCompanyIds), { encoding: 'utf8' });
  await writeFile(unmatchedFilePath, JSON.stringify(notFoundCompanyNames), { encoding: 'utf8' });
  
  console.log(`Saved matched company IDs to ${matchedFilePath}`);
  console.log(`Saved unmatched company names to ${unmatchedFilePath}`);
  console.log('Done');

  process.exit();
})();
