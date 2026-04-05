const socketClusterClient = require('socketcluster-client');

const BATCH_SIZE = 100;
const BATCH_PAUSE = 1000;

const { tagList, baseTagMap } = require('./config.js');

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

function getTagInfo(tag) {
  let tagParts = tag.split('.');
  let exp = tagParts[1] || 'years-0';
  let firstTagPart = tagParts[0];
  let subParts = firstTagPart.split(':');
  let prefix = subParts[0];
  let mainTagPart = subParts[1] || '';
  let baseTagPart = baseTagMap[mainTagPart];
  return {
    exp,
    prefix,
    mainTagPart,
    baseTagPart,
    tag
  };
}

function isExpAGreaterThanB(expA, expB) {
  let expANumber = Number((expA || '').split('-')[1] || 0);
  let expBNumber = Number((expB || '').split('-')[1] || 0);
  return expANumber > expBNumber;
}

async function computeSpecializationMetricTags(personId) {
  let personMinedTags = await clientSocket.invoke('crud', {
    action: 'read',
    type: 'Person',
    id: personId,
    field: 'minedTags'
  });

  let minedTagList = (personMinedTags || '').split(',').map(tag => tag.trim());
  let bestSpecInfos = {};

  for (let fullTag of minedTagList) {
    let tagInfo = getTagInfo(fullTag);
    if (tagInfo.prefix && tagInfo.mainTagPart) {
      bestSpecInfos[tagInfo.mainTagPart] = {
        exp: tagInfo.exp,
        tag: tagInfo.tag,
        shortTag: `${tagInfo.prefix}:${tagInfo.mainTagPart}`
      };
    }
  }

  for (let tag of minedTagList) {
    let { prefix, baseTagPart, exp } = getTagInfo(tag);
    if (!prefix || !baseTagPart) continue;
    if (!bestSpecInfos[baseTagPart] || isExpAGreaterThanB(exp, bestSpecInfos[baseTagPart].exp)) {
      if (prefix && baseTagPart) {
        bestSpecInfos[baseTagPart] = {
          exp,
          tag: `${prefix}:${baseTagPart}.${exp}`,
          shortTag: `${prefix}:${baseTagPart}`
        };
      }
    }
  }

  let specInfoValues = Object.values(bestSpecInfos);
  let tagSet = new Set([
    ...specInfoValues.map(info => info.shortTag.toLowerCase()),
    ...specInfoValues.map(info => info.tag.toLowerCase())
  ]);

  return [ ...tagSet ].filter(Boolean);
}

async function computePersonTags(idList) {
  return Promise.all(
    idList.map(async (personId) => {
      let tags = await computeSpecializationMetricTags(personId);
      return {
        id: personId,
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
      recordTags = await computePersonTags(result.data);
      metricTags = await Promise.all(
        result.data.map(async (recordId) => {
          let tags = await metricTagsCallback(recordId);
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
    async (personId) => {
      let educationTags = await computeEducationTags(personId, BATCH_SIZE);
      return [ ...educationTags ];
    }
  );
  console.log('DONE!');
  process.exit();
})();
