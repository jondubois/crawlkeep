const socketClusterClient = require('socketcluster-client');
const { writeFile } = require('fs/promises');

const BATCH_SIZE = 100;

const COMPANY_MODEL_NAME = 'Company';
const companyTags = process.argv.slice(2);

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

  let companyIdSets = {};
  let fullCompanyIdSet = new Set();

  for (let tagName of companyTags) {
    let companyResult = {};
    let offset = 0;
    let processedCount = 0;
    let criticalErrorCount = 0;

    let currentCompanySet = new Set();
    companyIdSets[tagName] = currentCompanySet;

    let metaResult = await clientSocket.invoke('crud', {
      action: 'read',
      type: COMPANY_MODEL_NAME,
      offset: 0,
      view: 'tagQueryView',
      viewParams: {
        tags: tagName
      },
      pageSize: 0,
      getCount: true
    });

    let totalCount = metaResult.count;

    console.log(`Found ${totalCount} companies with tag: ${tagName}`);

    while (!companyResult.isLastPage) {
      try {
        companyResult = await clientSocket.invoke('crud', {
          action: 'read',
          type: COMPANY_MODEL_NAME,
          offset,
          view: 'tagQueryView',
          viewParams: {
            tags: tagName
          },
          pageSize: BATCH_SIZE
        });

        let companyInfo = await Promise.all(
          companyResult.data.map(async (id) => {
            return {
              id,
              companyId: await clientSocket.invoke('crud', {
                action: 'read',
                type: COMPANY_MODEL_NAME,
                id,
                field: 'companyId'
              })
            }
          })
        );

        for (let { companyId } of companyInfo) {
          currentCompanySet.add(companyId);
          fullCompanyIdSet.add(companyId);
        }
        offset += BATCH_SIZE;
        processedCount += companyResult.data.length;
      } catch (error) {
        criticalErrorCount++;
        if (criticalErrorCount > 1000) {
          throw new Error('Number of critical errors exceeded the maximum allowed threshold');
        }
        console.error(`Failed to read page from company offset ${offset} because of error: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        continue;
      }

      console.log(`Tag ${tagName} - Processed ${processedCount} companies out of ${totalCount} - Last offset: ${offset} - ${Math.round(processedCount * 100 / totalCount)}%`);
    }
  }

  let allCompanyIds = [ ...fullCompanyIdSet ];
  let companiesWithTagsFilePath = './companies-with-tags.json';
  await writeFile(companiesWithTagsFilePath, JSON.stringify(allCompanyIds), { encoding: 'utf8' });
  
  console.log(`Saved company IDs to ${companiesWithTagsFilePath}`);
  console.log('Done');

  process.exit();
})();
