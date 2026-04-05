const MIN_VERIFIED_TAG_SCORE = 2;
const VERIFIED_TAG_SAMPLE_SIZE = MIN_VERIFIED_TAG_SCORE + 1; // Must be greater than MIN_VERIFIED_TAG_SCORE

// TODO 0: Only position and skill tags need to be verified by looking at ex-colleagues.
// other tags such as education should be accepted in any case.
export async function verifyPersonTags({ socket, person, jobs, restrictToTags, tagPrefixes }) {
  try {
    let tagPrefixSet = new Set(tagPrefixes || []);
    let restrictedTagNameSet = new Set(restrictToTags || []);
    let personMinedTagSet = new Set((person.minedTags || '').split(/, ?/).filter(Boolean));
    let targetTags;
    if (restrictToTags) {
      targetTags = [ ...restrictedTagNameSet ];
    } else {
      targetTags = [ ...personMinedTagSet ];
    }

    let totalSampleSize = VERIFIED_TAG_SAMPLE_SIZE * targetTags.length;
    
    let jobTagScoresList = await Promise.all(
      jobs.map(async (job) => {
        let { companyId, mainCompanyId } = job || {};
        let matchingEmployees;

        if (targetTags && targetTags.length) {
          let [ companyEmployees, mainCompanyEmployees ] = await Promise.all([
            companyId ? getCompanyEmployees(socket, companyId, targetTags, totalSampleSize) : Promise.resolve([]),
            mainCompanyId ? getCompanyEmployees(socket, mainCompanyId, targetTags, totalSampleSize) : Promise.resolve([])
          ]);
          let employeeIdSet = new Set(companyEmployees.map(employee => employee.id));
          let mainOnlyEmployees = mainCompanyEmployees.filter(employee => !employeeIdSet.has(employee.id));
          matchingEmployees = [ ...companyEmployees, ...mainOnlyEmployees ];
        } else {
          matchingEmployees = [];
        }

        let employeeTagsList = matchingEmployees.map((employee) => {
          return (employee.minedTags || '').split(/, ?/).filter(Boolean);
        });
        let companyTagScores = {};
        for (let employeeTags of employeeTagsList) {
          for (let tag of employeeTags) {
            if (tag && personMinedTagSet.has(tag)) {
              if (companyTagScores[tag] == null) {
                companyTagScores[tag] = 0;
              }
              companyTagScores[tag]++;
            }
          }
        }
        return companyTagScores;
      })
    );

    let personTagScore = {};
    for (let minedTag of personMinedTagSet) {
      personTagScore[minedTag] = 0;
    }
    for (let jobTagScore of jobTagScoresList) {
      for (let [ tag, score ] of Object.entries(jobTagScore)) {
        if (!personTagScore[tag]) {
          personTagScore[tag] = 0;
        }
        personTagScore[tag] += score;
      }
    }

    let verifiedPersonTags = Object.entries(personTagScore)
      .filter(([ tag, score ]) => {
        let firstPart = tag.split('.')[0];
        let prefix = tag.split(':')[0];
        return score >= MIN_VERIFIED_TAG_SCORE || personTagScore[firstPart] >= MIN_VERIFIED_TAG_SCORE || (tagPrefixes && !tagPrefixSet.has(prefix));
      })
      .map(([ tag ]) => tag);
    
    return {
      personId: person.id,
      tags: verifiedPersonTags.length ? verifiedPersonTags.join(', ') : ''
    };
  } catch (error) {
    let errorMessage = `Failed to compute employee tags because of error: ${error.message}`;
    throw new Error(errorMessage);
  }
}

export async function getCompanyEmployees(socket, companyId, personMinedTags, limit) {
  let criticalErrorCount = 0;
  let batchSize = 25;
  let companyPersonInfoList = [];
  let personResult = {};
  let offset = 0;

  while (!personResult.isLastPage) {
    try {
      let viewParams = {
        currentCompanyId: companyId
      };
      if (personMinedTags && personMinedTags.length) {
        viewParams.query = personMinedTags.map(tag => `minedTags contains ${tag}`).join(' ~OR~ ');
      }
      let maxEmployeesRemaining = limit ? limit - companyPersonInfoList.length : Infinity;
      personResult = await socket.invoke('crud', {
        action: 'read',
        type: 'Person',
        offset,
        view: 'companySearchView',
        viewParams,
        pageSize: Math.min(batchSize, maxEmployeesRemaining)
      });
    } catch (error) {
      criticalErrorCount++;
      if (criticalErrorCount > 100) {
        throw new Error(`Failed to get employees of company ${companyId} after many attempts`);
      }
      console.error(`Failed to read page from person at offset ${offset} because of error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      continue;
    }

    let personInfoList = await Promise.all(
      personResult.data.map(async (personId) => {
        try {
          let [ city, location, seniority, education, minedTags ] = await Promise.all([
            socket.invoke('crud', {
              action: 'read',
              type: 'Person',
              id: personId,
              field: 'city'
            }),
            socket.invoke('crud', {
              action: 'read',
              type: 'Person',
              id: personId,
              field: 'location'
            }),
            socket.invoke('crud', {
              action: 'read',
              type: 'Person',
              id: personId,
              field: 'seniority'
            }),
            socket.invoke('crud', {
              action: 'read',
              type: 'Person',
              id: personId,
              field: 'education'
            }),
            socket.invoke('crud', {
              action: 'read',
              type: 'Person',
              id: personId,
              field: 'minedTags'
            })
          ]);
          let locationParts = (location || '').split(',').map(part => part.trim());
          let country = locationParts[locationParts.length - 1];
          return { id: personId, city, country, seniority, education, minedTags };
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

  return companyPersonInfoList;
}
