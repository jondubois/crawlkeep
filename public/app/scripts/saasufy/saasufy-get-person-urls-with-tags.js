const socketClusterClient = require('socketcluster-client');
const { writeFile } = require('fs/promises');

const BATCH_SIZE = 100;

const PERSON_MODEL_NAME = 'Person';
const personTags = process.argv.slice(2);

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

  let personURLSets = {};
  let fullPersonURLSet = new Set();

  for (let tagName of personTags) {
    let personResult = {};
    let offset = 0;
    let processedCount = 0;
    let criticalErrorCount = 0;

    let currentPersonSet = new Set();
    personURLSets[tagName] = currentPersonSet;

    let metaResult = await clientSocket.invoke('crud', {
      action: 'read',
      type: PERSON_MODEL_NAME,
      offset: 0,
      view: 'tagView',
      viewParams: {
        tags: tagName
      },
      pageSize: 0,
      getCount: true
    });

    let totalCount = metaResult.count;

    console.log(`Found ${totalCount} persons with tag: ${tagName}`);

    while (!personResult.isLastPage) {
      try {
        personResult = await clientSocket.invoke('crud', {
          action: 'read',
          type: PERSON_MODEL_NAME,
          offset,
          view: 'tagView',
          viewParams: {
            tags: tagName
          },
          pageSize: BATCH_SIZE
        });

        let personInfo = await Promise.all(
          personResult.data.map(async (id) => {
            return {
              id,
              publicUrl: await clientSocket.invoke('crud', {
                action: 'read',
                type: PERSON_MODEL_NAME,
                id,
                field: 'publicUrl'
              })
            }
          })
        );

        for (let { publicUrl } of personInfo) {
          currentPersonSet.add(publicUrl);
          fullPersonURLSet.add(publicUrl);
        }
        offset += BATCH_SIZE;
        processedCount += personResult.data.length;
      } catch (error) {
        criticalErrorCount++;
        if (criticalErrorCount > 1000) {
          throw new Error('Number of critical errors exceeded the maximum allowed threshold');
        }
        console.error(`Failed to read page from person offset ${offset} because of error: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        continue;
      }

      console.log(`Tag ${tagName} - Processed ${processedCount} persons out of ${totalCount} - Last offset: ${offset} - ${Math.round(processedCount * 100 / totalCount)}%`);
    }
  }

  let allPersonURLs = [ ...fullPersonURLSet ];
  let personsWithTagsFilePath = './person-urls-with-tags.json';
  await writeFile(personsWithTagsFilePath, JSON.stringify(allPersonURLs), { encoding: 'utf8' });
  
  console.log(`Saved person IDs to ${personsWithTagsFilePath}`);
  console.log('Done');

  process.exit();
})();
