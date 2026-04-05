const socketClusterClient = require('socketcluster-client');

const BATCH_SIZE = 100;
const BATCH_PAUSE = 1000;

const COMPANY_MODEL_NAME = 'Company';
const PERSON_MODEL_NAME = 'Person';

const { getCuratedTagSets } = require('./utils.js');

const {
  tagList,
  companyPersonCountThresholds
} = require('./config.js');

let sortedCompanyCountThresholds = companyPersonCountThresholds.sort((a, b) => a - b).reverse();

const curatedCompanySetDir = process.argv[2];
const companyTagPrefix = process.argv[3] || 'position';

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000
});

async function tagCompanyCollection(serviceAuthKey, batchSize, tagCuratedSets) {
  let criticalErrorCount = 0;
  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey
  });

  let companyResult = {};
  let cursor = '0';
  let processedCount = 0;

  let metaResult = await clientSocket.invoke('crud', {
    action: 'read',
    type: COMPANY_MODEL_NAME,
    offset: 0,
    view: 'cursorView',
    viewParams: {
      from: cursor
    },
    pageSize: 0,
    getCount: true
  });

  let totalCount = metaResult.count;

  while (!companyResult.isLastPage && cursor) {
    try {
      companyResult = await clientSocket.invoke('crud', {
        action: 'read',
        type: COMPANY_MODEL_NAME,
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
      console.error(`Failed to read page from company ${cursor} because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    let companyInfo = await Promise.all(
      companyResult.data.map(async (companyId) => {
        let companyPersonsTags = [];
        let personResult = {};
        let offset = 0;
        while (!personResult.isLastPage) {
          try {
            personResult = await clientSocket.invoke('crud', {
              action: 'read',
              type: PERSON_MODEL_NAME,
              offset,
              view: 'companySearchView',
              viewParams: {
                currentCompanyId: companyId
              },
              pageSize: batchSize
            });
          } catch (error) {
            criticalErrorCount++;
            if (criticalErrorCount > 1000) {
              throw new Error('Number of critical errors exceeded the maximum allowed threshold');
            }
            console.error(`Failed to read page from person at offset ${offset} because of error: ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
          }

          let personTagsList = await Promise.all(
            personResult.data.map(async (personId) => {
              try {
                let personTags = await clientSocket.invoke('crud', {
                  action: 'read',
                  type: PERSON_MODEL_NAME,
                  id: personId,
                  field: 'tags'
                });
                return { personId, tags: (personTags || '').split(',').map(tag => tag.trim()).filter(tag => tag) };
              } catch (error) {
                console.error(`Failed to read tags of person with ID ${personId} because of error: ${error.message}`);
                return null;
              }
            })
          );

          let sanitizedPersonTags = personTagsList.filter(person => person);
          companyPersonsTags.push(...sanitizedPersonTags);
          offset += batchSize;
        }

        return {
          companyId,
          persons: companyPersonsTags
        };
      })
    );

    companyInfo = companyInfo.filter(company => company);

    let companyMetrics = [];
    for (let currentCompanyInfo of companyInfo) {
      let personCount = currentCompanyInfo.persons.length;
      let tagCounts = {};
      let tagRatios = {};
      let tagConcentrations = {};
      for (let tagData of tagList) {
        let tagSuffixes = tagData.tagMetricSuffixes || [];
        let allTags = [
          tagData.tagName,
          ...tagSuffixes.map((suffix) => `${tagData.tagName}${suffix}`)
        ];
        for (let tagName of allTags) {
          tagCounts[tagName] = currentCompanyInfo.persons.reduce(
            (sum, person) => person.tags.includes(tagName) ? sum + 1 : sum,
            0
          );
          tagRatios[tagName] = tagCounts[tagName] / personCount;
          if (tagData.companyConcentrationThresholds) {
            tagConcentrations[tagName] = tagData.companyConcentrationThresholds;
          }
        }
      }

      let { companyId } = currentCompanyInfo;
      let companyTagSet = new Set();
      
      for (let [ companyTag, companyIdSet ] of Object.entries(tagCuratedSets)) {
        let fullTagName = `${companyTagPrefix}:${companyTag}`;
        if (companyIdSet.has(companyId) && !tagCounts[fullTagName]) {
          companyTagSet.add(fullTagName);
        }
      }

      companyMetrics.push({
        companyId,
        inherentCompanyTags: [ ...companyTagSet ],
        personCount,
        tagCounts,
        tagRatios,
        tagConcentrations
      });
    }
    
    let companyTags = [];
    for (let currentCompanyMetrics of companyMetrics) {
      let { tagConcentrations } = currentCompanyMetrics;
      companyTags.push({
        id: currentCompanyMetrics.companyId,
        tags: [
          ...currentCompanyMetrics.inherentCompanyTags,
          ...Object.entries(currentCompanyMetrics.tagCounts).map(
            ([ tag, count ]) => {
              if (count > 0) {
                return tag;
              }
              return null;
            }
          ).filter(tag => tag),
          ...Object.entries(currentCompanyMetrics.tagCounts).flatMap(
            ([ tag, count ]) => {
              let countTags = [];
              for (let countThreshold of sortedCompanyCountThresholds) {
                if (count >= countThreshold) {
                  countTags.push(`${tag}.count-${countThreshold}`);
                }
              }
              return countTags;
            }
          ).filter(tag => tag),
          ...Object.entries(currentCompanyMetrics.tagRatios).map(
            ([ tag, ratio ]) => {
              let concentrationEntries = Object.entries(tagConcentrations[tag] || {}).sort((a, b) => b[1] - a[1]);
              for (let [ label, threshold ] of concentrationEntries) {
                if (ratio >= threshold) {
                  return `${tag}.percent-${label}`;
                }
              }
              return null;
            }
          ).filter(tag => tag)
        ]
      });
    }
    
    try {
      await Promise.all(
        companyTags.map(async (record) => {
          await clientSocket.invoke('crud', {
            action: 'update',
            type: COMPANY_MODEL_NAME,
            id: record.id,
            field: 'tags',
            value: record.tags.join(', ')
          });
        })
      );
    } catch (error) {
      console.error(`Failed to update some company records because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    cursor = companyResult.data[companyResult.data.length - 1];

    processedCount += companyResult.data.length;
    console.log(`Processed ${processedCount} companies out of ${totalCount} - Last cursor: ${cursor} - ${Math.round(processedCount * 100 / totalCount)}%`);
    await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE));
  }
}

(async () => {
  let tagCuratedSets = await getCuratedTagSets(curatedCompanySetDir, clientSocket);

  await tagCompanyCollection(
    process.env.AUTH_KEY,
    BATCH_SIZE,
    tagCuratedSets
  );
  console.log('DONE!');
  process.exit();
})();
