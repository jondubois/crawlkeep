import socketClusterClient from 'socketcluster-client';
import { aiCategories } from '../../../../ai-categories.js';

import { getRecordCount, generateRecords, getRecords } from '../../utils.js';
import { AIClassifier } from '../../../../ai-classifier.js';
import { tagYears } from './config.js';

const tagYearsEntries = Object.entries(tagYears)
  .map(([ years, suffix ]) => ([ Number(years), suffix ]))
  .sort(([ yearsA ], [ yearsB ]) => yearsB - yearsA);

const argv = process.argv;
const {
  AUTH_KEY,
  MAX_PAGES,
  PAGE_SIZE,
  ITERATION_PAUSE_DURATION,
  ERROR_PAUSE_DURATION,
  SCORE_THRESHOLD
} = process.env;
const FROM = argv[2];

const MAX_JOBS = 100;
const ONE_YEAR_MILLISECONDS = Math.round(1000 * 60 * 60 * 24 * 365.2425);

const maxPages = Number(MAX_PAGES ?? 1000);
const pageSize = Number(PAGE_SIZE ?? 100);
const iterationPauseDuration = Number(ITERATION_PAUSE_DURATION ?? 500);
const errorPauseDuration = Number(ERROR_PAUSE_DURATION ?? 10000);
const maxAttempts = 10;
const maxTagsPerPerson = 10;

// Number between 0 and 1. Threshold of certainty to decide to add a tag or not.
const scoreThreshold = Number(SCORE_THRESHOLD ?? .085);
// Temperature is a number between 0 and 1. It determines the focus/optimism on specific properties.
// If this is closer to 1, it behaves more like average of all properties.
const temperature = .15;

// These numbers can be anything but indicate the proportion of attention to specific fields.
const propWeights = {
  headline: 6,
  summary: 4,
  skills: 5,
  jobs: 2,
  educations: 2
};

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 240000,
  pingTimeoutDisabled: true
});

let aiClassifier = new AIClassifier();
await aiClassifier.init({
  categories: aiCategories
});

await clientSocket.invoke('admin-log-in', {
  serviceAuthKey: AUTH_KEY
});

console.log('Fetching person records...');

let viewName = 'cursorView';

let viewParams = {
  from: FROM || '0'
};

let personTotalCount = await getRecordCount({
  socket: clientSocket,
  type: 'Person',
  offset: 0,
  viewName,
  viewParams
});

console.log(`Computing AI tags of ${personTotalCount} persons...`);

async function classifyPerson({ socket, person, pageSize, maxPages }) {
  let jobs = await getRecords({
    socket,
    type: 'Job',
    viewName: 'personView',
    viewParams: {
      personId: person.id
    },
    fields: [ 'jobTitle', 'companyName', 'jobDescription', 'jobStartTimestamp', 'jobEndTimestamp' ],
    startPage: 0,
    maxPages: 1,
    pageSize: MAX_JOBS
  });

  let educations = await getRecords({
    socket,
    type: 'Education',
    viewName: 'personView',
    viewParams: {
      personId: person.id
    },
    fields: [ 'eduDegreeName', 'eduSchoolName', 'eduFieldOfStudy' ],
    startPage: 0,
    maxPages,
    pageSize
  });

  let personData = {
    ...person,
    jobs,
    educations
  };

  let categoryInfos = await aiClassifier.computePersonAITags(personData, scoreThreshold, temperature, propWeights);
  let tags = categoryInfos.slice(0, maxTagsPerPerson).flatMap((cat) => {
    let baseTag = cat.tag || `position:${cat.category.replace(/ /g, '-')}`;
    let years = cat.experience / ONE_YEAR_MILLISECONDS;
    let yearsSuffix = tagYearsEntries[tagYearsEntries.length - 1]?.[1] ?? '';

    for (let [ yearsKey, suffix ] of tagYearsEntries) {
      if (years >= yearsKey) {
        yearsSuffix = suffix;
        break;
      }
    }
    let expTag = `${baseTag}${yearsSuffix}`;
    return [ baseTag, expTag ];
  });

  return {
    personId: personData.id,
    tags
  };
}

let personGenerator = generateRecords({
  socket: clientSocket,
  type: 'Person',
  viewName,
  viewParams,
  fields: [ 'id', 'headline', 'summary', 'skills' ],
  startPage: 0,
  pageSize,
  maxAttempts
});

let processedCount = 0;

for await (let person of personGenerator) {
  // let colorRed = '\x1b[31m';
  let colorGreen = '\x1b[32m';
  let colorReset = '\x1b[0m';
  try {
    let success = false;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        let categoryInfo = await classifyPerson({ socket: clientSocket, person, pageSize, maxPages });
        let { personId, tags } = categoryInfo;
        await clientSocket.invoke('crud', {
          action: 'update',
          type: 'Person',
          id: personId,
          field: 'aiTags',
          value: tags.length ? tags.join(', ') : ''
        });
        processedCount++;
        let progressPercent = Math.round(processedCount * 10000 / personTotalCount) / 100;
        console.log(
          `Classified person [${
            progressPercent
          }%] - ID: ${
            personId
          }, headline: ${
            person.headline
          } - Tags: ${
            colorGreen
          }${
            tags.length ? tags.join(', ') : 'None'
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
