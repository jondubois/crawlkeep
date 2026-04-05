import socketClusterClient from 'socketcluster-client';
import { getRecordCount, generateRecords, getRecords } from '../../utils.js';
import { verifyPersonTags } from '../../analytics-utils.js';

const argv = process.argv;
const {
  AUTH_KEY,
  MAX_PAGES,
  PAGE_SIZE,
  RESTRICT_TO_TAG,
  ITERATION_PAUSE_DURATION,
  ERROR_PAUSE_DURATION,
  USE_PROCESSED_TAGS
} = process.env;
const TARGET_TAG = argv[2];
const FROM = argv[3];

const maxPages = Number(MAX_PAGES ?? 1000);
const pageSize = Number(PAGE_SIZE ?? 100);
const iterationPauseDuration = Number(ITERATION_PAUSE_DURATION ?? 500);
const errorPauseDuration = Number(ERROR_PAUSE_DURATION ?? 10000);
const restrictToTags = RESTRICT_TO_TAG === 'true' ? [ TARGET_TAG ] : null;
const useProcessedTags = USE_PROCESSED_TAGS === 'true';
const maxAttempts = 10;

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 240000
});

await clientSocket.invoke('admin-log-in', {
  serviceAuthKey: AUTH_KEY
});

console.log('Fetching person records...');

let viewName = useProcessedTags ? 'tagCursorView' : 'minedTagCursorView';

let viewParams = {
  from: FROM || '0'
};

if (useProcessedTags) {
  viewParams.tags = TARGET_TAG;
} else {
  viewParams.minedTags = TARGET_TAG;
}

let personTotalCount = await getRecordCount({
  socket: clientSocket,
  type: 'Person',
  offset: 0,
  viewName,
  viewParams
});

console.log(`Verifying tags of ${personTotalCount} persons...`);

async function verifyPersonCharacterizations({ socket, person, pageSize, maxPages, restrictToTags }) {
  let jobs = await getRecords({
    socket,
    type: 'Job',
    viewName: 'personView',
    viewParams: {
      personId: person.id
    },
    fields: [ 'companyId', 'mainCompanyId' ],
    startPage: 0,
    maxPages,
    pageSize
  });

  let extraOptions = {};
  if (restrictToTags) {
    extraOptions.restrictToTags = restrictToTags;
  }

  let verifiedTagInfo = await verifyPersonTags({
    socket,
    person,
    jobs,
    tagPrefixes: [ 'position', 'skill' ],
    ...extraOptions
  });

  let originalTags = person.minedTags.split(',').map(tag => tag.trim()).filter(Boolean);
  let verifiedTags = (verifiedTagInfo.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
  let verifiedTagSet = new Set(verifiedTags);
  let removedTags = originalTags.filter(tag => !verifiedTagSet.has(tag));
  return {
    personId: person.id,
    originalTags,
    verifiedTags,
    removedTags
  };
}

let personGenerator = generateRecords({
  socket: clientSocket,
  type: 'Person',
  viewName,
  viewParams,
  fields: [ 'id', 'minedTags' ],
  startPage: 0,
  pageSize,
  maxAttempts
});

let processedCount = 0;

for await (let person of personGenerator) {
  let colorRed = '\x1b[31m';
  let colorGreen = '\x1b[32m';
  let colorReset = '\x1b[0m';
  try {
    let success = false;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        let tagInfo = await verifyPersonCharacterizations({ socket: clientSocket, person, pageSize, maxPages, restrictToTags });
        let { personId, verifiedTags, removedTags } = tagInfo;
        await clientSocket.invoke('crud', {
          action: 'update',
          type: 'Person',
          id: personId,
          field: 'tags',
          value: verifiedTags.length ? verifiedTags.join(', ') : ''
        });
        processedCount++;
        let progressPercent = Math.round(processedCount * 10000 / personTotalCount) / 100;
        console.log(
          `Verified person tags [${
            progressPercent
          }%] - ID: ${
            personId
          }, verified tags: ${
            colorGreen
          }${
            verifiedTags.length ? verifiedTags.join(', ') : 'None'
          }${
            colorReset
          }, removed tags: ${
            colorRed
          }${
            removedTags.length ? removedTags.join(', ') : 'None'
          }${
            colorReset
          }`
        );
        success = true;
        break;
      } catch (error) {
        console.warn(`Failed attempt #${i + 1} to process person ${person.id} because of error: ${error.message} - Retrying...`);
        await new Promise(resolve => setTimeout(resolve, errorPauseDuration));
      }
    }
    if (!success) {
      throw new Error(`Failed to process person ${person.id} after ${maxAttempts} attempts`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  await new Promise(resolve => setTimeout(resolve, iterationPauseDuration));
}
console.log('Done!');
process.exit();
