const socketClusterClient = require('socketcluster-client');
const { writeFile, readdir, readFile } = require('fs/promises');
const path = require('path');
const { computeCompanyId, getBatches } = require('./utils.js');

const BATCH_SIZE = 20;

const COMPANY_MODEL_NAME = 'Company';
const companyDataDir = process.argv[2];

const { countryCodeNames } = require('./country-codes.js');

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000
});

(async () => {
  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey: process.env.AUTH_KEY
  });

  let fileNames = await readdir(companyDataDir);
  let validResourceCount = 0;
  let skippedCount = 0;
  let companyDataMap = {};

  for (let fileName of fileNames) {
    let fullFileName = path.join(companyDataDir, fileName);
    let fileData = JSON.parse(await readFile(fullFileName, { encoding: 'utf8' }));
    for (let resource of fileData) {
      let id = computeCompanyId({ company_id: resource.id });
      if (!id) {
        skippedCount++;
        continue;
      }
      resource.companyId = resource.id;
      resource.id = id;
      companyDataMap[id] = {
        id,
        industries: (resource.industries || []).join(', '),
        type: resource.type,
        specialities: (resource.specialities || []).join(', '),
        officeLocations: (resource.locations || [])
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
          .join(', ')
      };
      validResourceCount++;
    }
  }

  let companies = Object.values(companyDataMap);
  let companyBatches = getBatches(companies, BATCH_SIZE);
  let batchCount = companyBatches.length;
  let processedCount = 0;

  for (let companyBatch of companyBatches) {
    await Promise.all(
      companyBatch.map(async (company) => {
        let { id, ...companyInfo } = company;
        await Promise.all(
          Object.entries(companyInfo).map(async ([ field, value ]) => {
            await clientSocket.invoke('crud', {
              action: 'update',
              type: COMPANY_MODEL_NAME,
              id,
              field,
              value
            });
          })
        );
      })
    );
    console.log(`Processed ${Math.round(processedCount / batchCount * 100)}%`);
    processedCount++;
  }

  console.log('Done');
  process.exit();
})();
