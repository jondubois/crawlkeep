const socketClusterClient = require('socketcluster-client');

const BATCH_SIZE = 100;

const COMPANY_MODEL_NAME = 'Company';
const PERSON_MODEL_NAME = 'Person';

let clientSocket = socketClusterClient.create({
  hostname: 'saasufy.com',
  port: 443,
  secure: true,
  path: '/sid8005/socketcluster/',
  ackTimeout: 60000
});

let positionTitleMap = {
  'optical-engineering': 'Optical Engineer',
  'electronics-engineering': 'Electronics Engineer',
  'mechanical-engineering': 'Mechanical Engineer',
  'systems-engineering': 'Systems Engineer',
  'mechatronics-engineering': 'Mechatronics Engineer',
  'software-architecture': 'Software Architect',
  'software-engineering': 'Software Engineer',
  'software-dev-ops': 'DevOps',
  'software-front-end': 'Front End Engineer',
  'software-back-end': 'Back End Engineer',
  'director': 'Director',
  'executive-director': 'Executive Director',
  'founder': 'Founder',
  'middle-manager': 'Middle Manager'
};

let dualLevelPositionSet = new Set([
  'optical-engineering',
  'electronics-engineering',
  'mechanical-engineering',
  'systems-engineering',
  'mechatronics-engineering',
  'software-architecture',
  'software-engineering',
  'software-front-end',
  'software-back-end',
  'software-dev-ops'
]);

let experienceMap = {
  'years-0': 'Junior',
  'years-5': 'Senior',
  'years-10': 'Senior'
};

let positionWeightMap = {
  'executive-director': 14,
  'director': 13,
  'founder': 12,
  'optical-engineering': 11,
  'electronics-engineering': 11,
  'mechanical-engineering': 11,
  'systems-engineering': 11,
  'software-architecture': 11,
  'software-front-end': 11,
  'software-back-end': 11,
  'software-dev-ops': 11,
  'mechatronics-engineering': 10,
  'software-engineering': 10,
  'middle-manager': 9
};

let tagYearsEndRegex = /\.years-([0-9]+)$/;
let positionRegex = /^(in-)?position:([^.]*)/;
let positionStartRegex = /^(in-)?position:/;

function getSeniority(tagsString) {
  let tagList = (tagsString || '').split(', ').map(tag => tag.trim());
  let yearsTags = tagList.filter(tag => tag.match(positionRegex));

  if (!yearsTags.length) return 'Other';

  yearsTags.sort((tagA, tagB) => {
    let positionMatchesA = tagA.match(positionRegex);
    let positionA = positionMatchesA[2];
    let positionMatchesB = tagB.match(positionRegex);
    let positionB = positionMatchesB[2];
    let positionWeightA = positionWeightMap[positionA] || 0;
    let positionWeightB = positionWeightMap[positionB] || 0;
    if (positionWeightA > positionWeightB) {
      return -1;
    }
    if (positionWeightA < positionWeightB) {
      return 1;
    }
    let yearsMatchesA = tagA.match(tagYearsEndRegex) || [];
    let yearsA = parseInt(yearsMatchesA[1] || '0');
    let yearsMatchesB = tagB.match(tagYearsEndRegex) || [];
    let yearsB = parseInt(yearsMatchesB[1] || '0');
    return yearsB - yearsA;
  });
  let mostSeniorTag = yearsTags[0];
  let seniorTagParts = mostSeniorTag.replace(positionStartRegex, '').split('.');
  let tagPosition = seniorTagParts[0];
  let tagYears = seniorTagParts[1] || 'years-0';
  let tagExp;
  let positionName = positionTitleMap[tagPosition];

  if (!positionName) return 'Other';

  if (dualLevelPositionSet.has(tagPosition)) {
    tagExp = experienceMap[tagYears] || '';
  } else {
    tagExp = '';
  }
  return tagExp ? `${tagExp} ${positionName}` : positionName;
}

function getSeniorityPoints(title) {
  if (title.startsWith('Executive')) {
    return 5;
  }
  if (title.startsWith('Director')) {
    return 4;
  }
  if (title.startsWith('Founder')) {
    return 3;
  }
  if (title.startsWith('Senior')) {
    return 2;
  }
  if (title.startsWith('Junior')) {
    return 0;
  }
  return 1;
}

function compareSeniorityEntries([seniorityA], [seniorityB]) {
  let pointsA = getSeniorityPoints(seniorityA);
  let pointsB = getSeniorityPoints(seniorityB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (seniorityA > seniorityB) {
    return 1;
  }
  if (seniorityA < seniorityB) {
    return -1;
  }
  return 0;
}

let educationRegex = /^edu:([^.]*)/;
let educationLevelRegex = /^edu:.*\b(bachelor|master|phd)\b/;
let firstCharRegex = /\b./g;

let eduWeightMap = {
  'bachelor': 1,
  'master': 2,
  'phd': 3
};

function getEducation(tagsString) {
  let tagList = (tagsString || '').split(', ').map(tag => tag.trim());
  let eduTags = tagList.filter(tag => tag.match(educationRegex));

  if (!eduTags.length) return 'Other';

  eduTags.sort((tagA, tagB) => {
    let eduMatchesA = tagA.match(educationLevelRegex);
    let eduA = eduMatchesA[1];
    let eduMatchesB = tagB.match(educationLevelRegex);
    let eduB = eduMatchesB[1];
    let eduWeightA = eduWeightMap[eduA] || 0;
    let eduWeightB = eduWeightMap[eduB] || 0;
    if (eduWeightA > eduWeightB) {
      return -1;
    }
    if (eduWeightA < eduWeightB) {
      return 1;
    }
    return 0;
  });

  let topEduTag = eduTags[0];
  let topEduTagMatches = topEduTag.match(educationLevelRegex);
  let eduName = topEduTagMatches ? topEduTagMatches[1] : 'other';

  if (eduName === 'phd') {
    return 'PhD';
  }
  return eduName.replace(firstCharRegex, char => char.toUpperCase());
}

function getEducationPoints(educationTitle) {
  if (educationTitle.startsWith('PhD')) {
    return 3;
  }
  if (educationTitle.startsWith('Master')) {
    return 2;
  }
  if (educationTitle.startsWith('Bachelor')) {
    return 1;
  }
  return 0;
}

function compareEducationEntries([educationA], [educationB]) {
  let pointsA = getEducationPoints(educationA);
  let pointsB = getEducationPoints(educationB);
  if (pointsA > pointsB) {
    return -1;
  }
  if (pointsA < pointsB) {
    return 1;
  }
  // Alphabetical comparison as fallback.
  if (educationA > educationB) {
    return 1;
  }
  if (educationA < educationB) {
    return -1;
  }
  return 0;
}

async function addEmployeeMetricsToCollections(serviceAuthKey, batchSize, startingId) {
  await clientSocket.invoke('admin-log-in', {
    serviceAuthKey
  });

  let companyResult = {};
  let cursor = startingId == null ? '0' : startingId;
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
  let criticalErrorCount = 0;

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
        let companyPersonInfoList = [];
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

          let personInfoList = await Promise.all(
            personResult.data.map(async (personId) => {
              try {
                let [ city, location, tags ] = await Promise.all([
                  clientSocket.invoke('crud', {
                    action: 'read',
                    type: PERSON_MODEL_NAME,
                    id: personId,
                    field: 'city'
                  }),
                  clientSocket.invoke('crud', {
                    action: 'read',
                    type: PERSON_MODEL_NAME,
                    id: personId,
                    field: 'location'
                  }),
                  clientSocket.invoke('crud', {
                    action: 'read',
                    type: PERSON_MODEL_NAME,
                    id: personId,
                    field: 'tags'
                  })
                ]);
                let locationParts = (location || '').split(',').map(part => part.trim());
                let country = locationParts[locationParts.length - 1];
                let seniority = getSeniority(tags);
                let education = getEducation(tags);
                return { personId, city, country, seniority, education };
              } catch (error) {
                console.error(`Failed to read info of person with ID ${personId} because of error: ${error.message}`);
                return null;
              }
            })
          );

          let sanitizedPersonInfoList = personInfoList.filter(person => person);
          companyPersonInfoList.push(...sanitizedPersonInfoList);
          offset += batchSize;
        }

        return {
          companyId,
          persons: companyPersonInfoList
        };
      })
    );

    let combinedCompanyInfo = companyInfo
      .filter(company => company)
      .map(company => {
        let employees = company.persons;
        let employeeCityMap = {};
        let employeeSeniorityMap = {};
        let employeeEducationMap = {};
        for (let person of employees) {
          if (person.country && person.city) {
            let locationString = `${person.country}.${person.city}`;
            if (!employeeCityMap[locationString]) {
              employeeCityMap[locationString] = 0;
            }
            employeeCityMap[locationString]++;
          }
          if (person.seniority) {
            if (!employeeSeniorityMap[person.seniority]) {
              employeeSeniorityMap[person.seniority] = 0;
            }
            employeeSeniorityMap[person.seniority]++;
          }
          if (person.education) {
            if (!employeeEducationMap[person.education]) {
              employeeEducationMap[person.education] = 0;
            }
            employeeEducationMap[person.education]++;
          }
        }
        return {
          id: company.companyId,
          employeeLocations: Object.entries(employeeCityMap).map(([city, count]) => `${city}=${count}`),
          employeeSeniorities: Object.entries(employeeSeniorityMap).sort(compareSeniorityEntries).map(([seniority, count]) => `${seniority}=${count}`),
          employeeEducations: Object.entries(employeeEducationMap).sort(compareEducationEntries).map(([education, count]) => `${education}=${count}`)
        };
      });

    try {
      await Promise.all(
        companyInfo.map(async (company) => {
          let employees = company.persons;
          for (let person of employees) {
            let value = {
              ...(person.seniority && { seniority: person.seniority }),
              ...(person.education && { education: person.education })
            };
            if (!Object.keys(value).length) continue;
            await clientSocket.invoke('crud', {
              action: 'update',
              type: PERSON_MODEL_NAME,
              id: person.personId,
              value
            });
          }
        })
      );
    } catch (error) {
      console.error(`Failed to update some person records because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    try {
      await Promise.all(
        combinedCompanyInfo.map(async (record) => {
          let value = {};
          if (record.employeeLocations.length) {
            value.employeeLocations = record.employeeLocations.join(', ');
          }
          if (record.employeeSeniorities.length) {
            value.employeeSeniorities = record.employeeSeniorities.join(', ');
          }
          if (record.employeeEducations.length) {
            value.employeeEducations = record.employeeEducations.join(', ');
          }
          await clientSocket.invoke('crud', {
            action: 'update',
            type: COMPANY_MODEL_NAME,
            id: record.id,
            value
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
  }
}

(async () => {
  let startingId = process.argv[2];
  await addEmployeeMetricsToCollections(
    process.env.AUTH_KEY,
    BATCH_SIZE,
    startingId
  );
  console.log('DONE!');
  process.exit();
})();
