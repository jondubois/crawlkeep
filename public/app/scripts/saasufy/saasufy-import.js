const { convertStringToId } = require('./utils.js');
const {
  importDataDir,
} = require('./import-utils.js');

const BATCH_SIZE = 200;

const sourceDirPath = process.argv[2];
const crudAction = process.argv[3] || 'create';
const flags = (process.argv[4] || '-pecjt').replace(/^-/, '').split('');
const resumeFromFile = process.argv[5];
const flagSet = new Set(flags);

(async () => {
  if (flagSet.has('t') && crudAction !== 'update') {
    console.error('The -t flag is only supported with the update action');
    process.exit(1);
  }

  if (flagSet.has('e')) {
    // Import to Education collection.
    console.log('---- Processing educations ----');
    await importDataDir(
      sourceDirPath,
      'Education',
      process.env.AUTH_KEY,
      BATCH_SIZE,
      resumeFromFile,
      crudAction,
      (person) => {
        return person?.edus;
      },
      (resource, person) => {
        if (
          !resource ||
          !person.public_id ||
          !(resource.school?.id || resource.school?.name)
        ) {
          return null;
        }
        return convertStringToId(
          `${person.public_id},${resource.school?.id || resource.school?.name},${resource.degree_name ? resource.degree_name : ''}`,
        );
      },
      (resource, person) => {
        return {
          personId: convertStringToId(person.public_id),
          eduDegreeName: resource.degree_name,
          eduFieldOfStudy: resource.field_of_study,
          eduSchoolId: resource.school?.id,
          eduSchoolName: resource.school?.name,
          eduInstitutionName: resource.institution_name,
          eduStartYear: resource.start_year,
          eduEndYear: resource.end_year,
          lirNiid: person.lir_niid,
          memberId: person.member_id
        };
      },
    );
  }

  if (flagSet.has('c')) {
    // Import to Company collection.
    console.log('---- Processing companies ----');
    await importDataDir(
      sourceDirPath,
      'Company',
      process.env.AUTH_KEY,
      BATCH_SIZE,
      resumeFromFile,
      crudAction,
      (person) => {
        let companyMap = {};
        let jobs = person.jobs || [];
        for (let job of jobs) {
          if (job.company && job.company.id) {
            companyMap[job.company.id] = job.company;
          }
        }
        return Object.values(companyMap);
      },
      (resource) => {
        if (!resource || !resource.id) {
          return null;
        }
        return convertStringToId(resource.id);
      },
      (resource) => {
        return {
          companyEmployeeCountLow: resource.employee_count_low,
          companyEmployeeCountHigh: resource.employee_count_high,
          companyDescription: resource.description,
          companyName: resource.name,
          companyId: resource.id,
          companyLinkedinUrl: resource.linkedin_url,
          companyHqRegion: resource.hq_region,
          companyFollowerCount: resource.follower_count
        };
      }
    );
  }

  let specializationMap = {
    mechanical_engineering: 'mechanical-engineering',
    electronics_engineering: 'electronics-engineering',
    systems_engineering: 'systems-engineering',
    optical_engineering: 'optical-engineering',
    middle_management: 'middle-manager'
  };
  let specializationEntries = Object.entries(specializationMap);

  if (flagSet.has('p')) {
    // Import to Person collection.
    console.log('---- Processing persons ----');
    await importDataDir(
      sourceDirPath,
      'Person',
      process.env.AUTH_KEY,
      BATCH_SIZE,
      resumeFromFile,
      crudAction,
      (person) => {
        return [ person ];
      },
      (resource) => {
        if (!resource || !resource.public_id) {
          return null;
        }
        return convertStringToId(resource.public_id);
      },
      (resource) => {
        let matchingSpecSet = new Set();
        let specs = resource.tags?.inferred?.expertise_in || {};
        for (let [sourceSpecName, targetSpecName] of specializationEntries) {
          if (specs[sourceSpecName]) {
            matchingSpecSet.add(targetSpecName);
          }
        }

        let saasufyPositions = resource.added_props?.inferred?.saasufy_seniority || {};
        let positionEntries = Object.entries(saasufyPositions).map(
          ([ key, value ]) => [ key.replace(/_id[0-9]+$/g, ''), value ]
        );

        let saasufyTags = [
          ...positionEntries.map(
            ([ key ]) => `position:${(specializationMap[key] || key).replace(/_/g, '-')}`
          ),
          ...positionEntries.map(
            ([ key, value ]) => `position:${(specializationMap[key] || key).replace(/_/g, '-')}.${value}`
          ),
          ...positionEntries.map(
            ([ key ]) => `skill:${(specializationMap[key] || key).replace(/_/g, '-')}`
          ),
          ...positionEntries.map(
            ([ key, value ]) => `skill:${(specializationMap[key] || key).replace(/_/g, '-')}.${value}`
          )
        ];

        let currentJob = (resource.jobs || []).filter(job => job?.is_current)[0] || {};
        if (flagSet.has('t')) {
          return {
            minedTags: saasufyTags.join(', ')
          };
        }
        return {
          firstName: resource.first_name,
          lastName: resource.last_name,
          canSendInmail: resource.can_send_inmail,
          desiredEmploymentTypes: resource.desired_employment_types,
          desiredLocations: resource.desired_locations,
          desiredTitles: resource.desired_titles,
          headline: resource.headline,
          jobSeekingUrgencyLevel: resource.job_seeking_urgency_level,
          lirNiid: resource.lir_niid,
          location: resource.location,
          memberId: resource.member_id,
          networkDistance: resource.network_distance,
          numberOfConnections: resource.number_of_connections,
          openToOpportunities: resource.open_to_opportunities,
          previousLocations: resource.previous_locations,
          profileImg: resource.profile_img,
          publicId: resource.public_id,
          publicUrl: resource.public_url,
          recommendations: (resource.recommendations || [])
            .filter((rec) => rec && rec.recommender_public_id)
            .map((rec) => convertStringToId(rec.recommender_public_id)),
          skills: resource.skills,
          summary: resource.summary,
          currentJobTitle: currentJob.title,
          currentCompanyName: currentJob.company?.name,
          currentCompanyId: convertStringToId(currentJob.company?.id),
          city: resource.city,
          state: resource.state,
          specializations: matchingSpecSet.size ? [ ...matchingSpecSet ] : '',
          minedTags: saasufyTags.join(', ')
        };
      },
    );
  }

  if (flagSet.has('j')) {
    // Import to Job collection.
    console.log('---- Processing jobs ----');
    await importDataDir(
      sourceDirPath,
      'Job',
      process.env.AUTH_KEY,
      BATCH_SIZE,
      resumeFromFile,
      crudAction,
      (person) => {
        return person?.jobs;
      },
      (resource, person) => {
        if (
          !resource ||
          !person.public_id ||
          !(resource.company?.id || resource.company?.name) ||
          !resource.start_timestamp ||
          !resource.title
        ) {
          return null;
        }
        return convertStringToId(
          `${person.public_id},${resource.company?.id || resource.company?.name},${resource.start_timestamp},${resource.title}`,
        );
      },
      (resource, person) => {
        let matchingSpecSet = new Set();
        let specs = resource.tags?.inferred?.is_characterised_by || {};
        for (let [sourceSpecName, targetSpecName] of specializationEntries) {
          if (specs[sourceSpecName]) {
            matchingSpecSet.add(targetSpecName);
          }
        }
        return {
          personId: convertStringToId(person.public_id),
          companyId: convertStringToId(resource.company?.id || resource.company?.name),
          companyPublicId: resource.company?.id,
          companyName: resource.company?.name,
          jobIsCurrent: resource.is_current,
          companyEmployeeCountHigh: resource.company?.employee_count_high,
          companyEmployeeCountLow: resource.company?.employee_count_low,
          companyLinkedinUrl: resource.company?.linkedin_url,
          companyDescription: resource.company?.description,
          companyHqRegion: resource.company?.hq_region,
          companyFollowerCount: resource.company?.follower_count,
          jobStartTimestamp: resource.start_timestamp,
          jobEndTimestamp: resource.end_timestamp,
          jobMillsecondsInJob: resource.millseconds_in_job,
          jobEmploymentStatus: resource.employment_status,
          jobTitle: resource.title,
          jobIndustries: resource.industries,
          jobDescription: resource.description,
          jobCountry: resource.country,
          jobDisplayLocation: resource.display_location,
          lirNiid: person.lir_niid,
          memberId: person.member_id,
          jobSkills: resource.skills,
          specializations: matchingSpecSet.size
            ? [...matchingSpecSet]
            : undefined
        };
      },
    );
  }

  process.exit();
})();
