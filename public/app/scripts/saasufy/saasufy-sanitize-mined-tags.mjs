import socketClusterClient from 'socketcluster-client';
import { getRecordCount, generateRecords, getRecords } from '../../utils.js';

const argv = process.argv;
const {
  AUTH_KEY,
  PAGE_SIZE,
  ITERATION_PAUSE_DURATION,
  ERROR_PAUSE_DURATION
} = process.env;
const TARGET_TAG = argv[2];
const FROM = argv[3];

const pageSize = Number(PAGE_SIZE ?? 100);
const iterationPauseDuration = Number(ITERATION_PAUSE_DURATION ?? 500);
const errorPauseDuration = Number(ERROR_PAUSE_DURATION ?? 10000);
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

let viewName = 'minedTagCursorView';

let viewParams = {
  from: FROM || '0'
};
viewParams.minedTags = TARGET_TAG;

let personTotalCount = await getRecordCount({
  socket: clientSocket,
  type: 'Person',
  offset: 0,
  viewName,
  viewParams
});

console.log(`Sanitizing tags of ${personTotalCount} persons...`);

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
  try {
    let personId = person.id;
    let success = false;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        let minedTags = (person.minedTags || '').split(',').map(tag => tag.trim().replace(/-id[0-9]+\b/, '')).filter(Boolean);
        let basicTags = minedTags.map(tag => tag.split('.')[0]);
        let tagSet = new Set([
          ...minedTags,
          ...basicTags
        ]);
        let tagList = [ ...tagSet ];
        let tagString = tagList.length ? tagList.join(', ') : '';
        await clientSocket.invoke('crud', {
          action: 'update',
          type: 'Person',
          id: personId,
          field: 'minedTags',
          value: tagString
        });
        processedCount++;
        let progressPercent = Math.round(processedCount * 10000 / personTotalCount) / 100;
        console.log(
          `Sanitized person tags [${
            progressPercent
          }%] - ID: ${
            personId
          }, tags: ${tagString}`
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
