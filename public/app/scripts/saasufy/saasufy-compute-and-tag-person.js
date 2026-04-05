const socketClusterClient = require('socketcluster-client');

const BATCH_SIZE = 100;
const BATCH_PAUSE = 1000;
const ONE_YEAR_MILLISECONDS = Math.round(1000 * 60 * 60 * 24 * 365.2425);

const { tagList, tagYears } = require('./config.js');

const tagYearsEntries = Object.entries(tagYears)
  .map(([ years, suffix ]) => ([ Number(years), suffix ]))
  .sort(([ yearsA ], [ yearsB ]) => yearsB - yearsA);

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000
});

function isValidSource(tag, modelName, data) {
  let sourceSelector = tag.sourceSelectors?.[modelName];
  return !sourceSelector || sourceSelector(data);
}

async function computeJobMetricTags(personId, batchSize, existingRecordTags) {
  let offset = 0;
  let result = {};
  let metrics = {};
  let modelName = 'Job';
  let categoryViewName = 'personView';
  let viewParams = { personId };

  while (!result.isLastPage) {
    result = await clientSocket.invoke('crud', {
      action: 'read',
      type: modelName,
      offset,
      view: categoryViewName,
      viewParams,
      pageSize: batchSize,
    });
    let jobs = await Promise.all(
      result.data.map(async (jobId) => {
        let jobData = await clientSocket.invoke('crud', {
          action: 'read',
          type: modelName,
          id: jobId
        });
        let duration = jobData.jobEndTimestamp - jobData.jobStartTimestamp;
        let applicableTags = tagList.filter((tag) => {
          if (!isValidSource(tag, modelName, jobData)) {
            return false;
          }
          let fields = tag.sourceFields[modelName] || [];
          for (let field of fields) {
            let currentValue = jobData[field];
            if (currentValue && currentValue.match(tag.regex)) {
              return true;
            }
          }
          return false;
        });
        let tags = applicableTags.map(tag => tag.tagName);

        return {
          jobId,
          tags: [ ...new Set([...tags ]) ],
          duration
        };
      })
    );
    for (let job of jobs) {
      for (let tag of job.tags) {
        if (!metrics[tag]) {
          metrics[tag] = 0;
        }
        metrics[tag] += job.duration;
      }
    }
    offset += batchSize;
  }

  for (let recordTag of existingRecordTags) {
    if (metrics[recordTag] == null) {
      metrics[recordTag] = 0;
    }
  }

  let tagMetricSourceMap = {};
  for (let tag of tagList) {
    tagMetricSourceMap[tag.tagName] = tag.computeExperienceFromTag || tag.tagName;
  }

  return Object.keys(metrics).flatMap(
    (tagName) => {
      let expSourceTagName = tagMetricSourceMap[tagName];
      let totalDuration = metrics[expSourceTagName] || metrics[tagName];
      let years = totalDuration / ONE_YEAR_MILLISECONDS;
      let yearsSuffix = tagYearsEntries[tagYearsEntries.length - 1]?.[1] ?? '';

      for (let [ yearsKey, suffix ] of tagYearsEntries) {
        if (years >= yearsKey) {
          yearsSuffix = suffix;
          break;
        }
      }
      return [ tagName, `${tagName}${yearsSuffix}` ];
    }
  );
}

async function computeEducationTags(personId, batchSize) {
  let offset = 0;
  let result = {};
  let metrics = {};
  let modelName = 'Education';
  let categoryViewName = 'personView';
  let viewParams = { personId };

  while (!result.isLastPage) {
    result = await clientSocket.invoke('crud', {
      action: 'read',
      type: modelName,
      offset,
      view: categoryViewName,
      viewParams,
      pageSize: batchSize,
    });
    let educations = await Promise.all(
      result.data.map(async (eduId) => {
        let eduData = await clientSocket.invoke('crud', {
          action: 'read',
          type: modelName,
          id: eduId
        });
        let duration = eduData.eduEndYear - eduData.eduStartYear;
        let applicableTags = tagList.filter((tag) => {
          if (!isValidSource(tag, modelName, eduData)) {
            return false;
          }
          let fields = tag.sourceFields[modelName] || [];
          for (let field of fields) {
            let currentValue = eduData[field];
            if (currentValue && currentValue.match(tag.regex)) {
              return true;
            }
          }
          return false;
        });
        let tags = applicableTags.map(tag => tag.tagName);
        return {
          eduId,
          tags,
          duration
        };
      })
    );
    for (let edu of educations) {
      for (let tag of edu.tags) {
        if (!metrics[tag]) {
          metrics[tag] = 0;
        }
        metrics[tag] += edu.duration;
      }
    }
    offset += batchSize;
  }
  return Object.keys(metrics);
}

async function computeRecordTags(modelName, idList, tagInfoList) {
  return Promise.all(
    idList.map(async (recordId) => {
      let tags = [];
      await Promise.all(
        tagInfoList.map(async (tag) => {
          let fields = tag.sourceFields[modelName] || [];
          await Promise.all(
            fields.map(async (field) => {
              let currentValue = await clientSocket.invoke('crud', {
                action: 'read',
                type: modelName,
                id: recordId,
                field
              });
              if (currentValue && currentValue.match(tag.regex) && !tags.includes(tag.tagName)) {
                tags.push(tag.tagName);
              }
            })
          );
        })
      );
      return {
        id: recordId,
        tags
      };
    })
  );
}

async function tagCollection(serviceAuthKey, modelName, batchSize, metricTagsCallback) {
  let criticalErrorCount = 0;
  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey
  });

  let result = {};
  let cursor = '0';
  let processedCount = 0;

  let metaResult = await clientSocket.invoke('crud', {
    action: 'read',
    type: modelName,
    offset: 0,
    view: 'cursorView',
    viewParams: {
      from: cursor
    },
    pageSize: 0,
    getCount: true
  });

  let totalCount = metaResult.count;

  while (!result.isLastPage && cursor) {
    try {
      result = await clientSocket.invoke('crud', {
        action: 'read',
        type: modelName,
        offset: 0,
        view: 'cursorView',
        viewParams: {
          from: cursor
        },
        pageSize: batchSize
      });
    } catch (error) {
      criticalErrorCount++;
      if (criticalErrorCount > 1000) {
        throw new Error('Number of critical errors exceeded the maximum allowed threshold');
      }
      console.error(`Failed to read page from ${cursor} because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    let recordTags;
    let metricTags;
    try {
      recordTags = await computeRecordTags(modelName, result.data, tagList);
      let recordTagData = Object.fromEntries(recordTags.map(({ id, tags }) => ([ id, tags ])));
      metricTags = await Promise.all(
        result.data.map(async (recordId) => {
          let currentRecordTags = recordTagData[recordId] || [];
          let tags = await metricTagsCallback(recordId, currentRecordTags);
          return {
            id: recordId,
            tags
          };
        })
      );
    } catch (error) {
      criticalErrorCount++;
      if (criticalErrorCount > 1000) {
        throw new Error('Number of critical errors exceeded the maximum allowed threshold');
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.error(`Failed to compute tags from cursor ${cursor} because of error: ${error.message}`);
      continue;
    }

    let metricTagData = Object.fromEntries(
      metricTags.map((tagInfo) => [ tagInfo.id, tagInfo.tags ])
    );

    try {
      await Promise.all(
        recordTags.map(async (record) => {
          let recordMetricTags = metricTagData[record.id] || [];
          let recordTags = [
            ...new Set([
              ...record.tags,
              ...recordMetricTags
            ])
          ];
          await clientSocket.invoke('crud', {
            action: 'update',
            type: modelName,
            id: record.id,
            field: 'tags',
            value: recordTags.join(', ')
          });
        })
      );
    } catch (error) {
      criticalErrorCount++;
      if (criticalErrorCount > 1000) {
        throw new Error('Number of critical errors exceeded the maximum allowed threshold');
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.error(`Failed to update tags from cursor ${cursor} because of error: ${error.message}`);
      continue;
    }

    cursor = result.data[result.data.length - 1];

    processedCount += result.data.length;
    console.log(`Processed ${processedCount} records out of ${totalCount} - Last cursor: ${cursor} - ${Math.round(processedCount * 100 / totalCount)}%`);
    await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE));
  }
}

(async () => {
  await tagCollection(
    process.env.AUTH_KEY,
    'Person',
    BATCH_SIZE,
    async (personId, existingRecordTags) => {
      let jobTags = await computeJobMetricTags(personId, BATCH_SIZE, existingRecordTags);
      let educationTags = await computeEducationTags(personId, BATCH_SIZE);
      return [ ...jobTags, ...educationTags ];
    }
  );
  console.log('DONE!');
  process.exit();
})();
