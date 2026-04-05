import { parentPort, workerData } from "worker_threads";
import path from "path";
import { readFile } from "../utils/file-system/modules/read-file.js";
import { tryWriteFile } from "../utils/file-system/modules/try-write-file.js";
import { convertMillisecondsToDuration } from "../utils/manip-date/modules/convert-milliseconds-to-duration.js";
import { mergeTopLevelPropsByDepthOfNesting } from "../utils/manip-node/modules/merge-top-lvl-props-by-depth-of-nesting.js";
import { getValAtNodeCascading } from "../utils/manip-node/modules/get-val-at-node-cascading.js";
import { extractFromObjBy } from "../utils/manip-obj/modules/extract-from-obj-by.js";
import { isEmptyObj } from "../utils/check/modules/is-empty-obj.js";
import { tryRegExp } from "../utils/manip-str/modules/try-regexp.js";
import { convertToSaasufySeniority } from "../data-mining/add-meta-to-profile/modules/convert-to-saasufy-seniority.js";

import { MetaStrategy } from "../LI_profile_parsing/classes/base/base-strategy.js";
import { MetaParser } from "../LI_profile_parsing/classes/parser/meta-parser.js";
import { LookupProps } from "../LI_profile_parsing/classes/base/base-entity.js";
import { PropStrategy } from "../LI_profile_parsing/classes/strategy/prop-strategy.js";
import { TagStrategy } from "../LI_profile_parsing/classes/strategy/tag-strategy.js";
import { ProfileParser } from "../LI_profile_parsing/classes/parser/profile-parser.js";

// instanciate classes
const meta_strategy = MetaStrategy.getInstance();
const meta_parser = MetaParser.getInstance();
const profile_parser = ProfileParser.getInstance();
const prop_strategy = PropStrategy.getInstance(); // creates an instance of `PropStrategy`, which internally has its own instance of `MetaStrategy`
const tag_strategy = TagStrategy.getInstance();
const lookup_props = LookupProps.getInstance();
// get keys
const TYPES = meta_strategy.meta_types;
const SUB_KEYS = meta_strategy.sub_keys;
const EMPLOYEE_ID_KEY = prop_strategy.employee_id_key;
const SENIORITY_KEY = prop_strategy.seniority_key;
const EXPERTISE_KEY = prop_strategy.expertise_key;
const SKILLSET_KEY = prop_strategy.skillset_key;

// filename
const FLAG = "gim";
const FILE_EXT = ".json";
const SIMPLIFIED_ISO8601_PATTERN = "\\d{4}-\\d{2}-\\d{2}T\\d{6}";
const UNIX_TIMESTAMP_PATTERN = "\\d{13}";
const date_rx = tryRegExp(SIMPLIFIED_ISO8601_PATTERN, FLAG);
const unix_rx = tryRegExp(UNIX_TIMESTAMP_PATTERN, FLAG);
const XP_THRESHOLD = 50;
lookup_props.setStateTo("COMPANY");

async function processFile(file_path) {
  const json_arr = await readFile(file_path, FILE_EXT);
  const file_timestamp =
    file_path.match(date_rx)?.shift() ?? file_path.match(unix_rx)?.shift(); // new Date().getTime();
  try {
    // synchronous processing of `json_arr` .slice(0, 50)
    json_arr.forEach((nested_profile) => {
      // reference each entity of the ERD, for quick access (no more having to traverse the node tree every time).
      profile_parser.setStateTo(nested_profile);

      /* Step1 - from inherent tags, infer whether the job is characterised.
            By cross-checking the `Person` 's `person_career_keys` with each one of their jobs,
            try any of the possible combinations that characterises a job.
            In which case, infer tag and add it to the `Job` record
            e.g.
            { tags:
              inherent: {
                job_title: {
                  middle_management: {},
                },
              },
              inferred: {
                is_characterised_by: {
                  middle_management: {},
                },
              },
            }
          */
      // get tags in `Person` record
      meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
      const person_tags = profile_parser.getValAtNodeCascading(
        meta_strategy.meta_path,
      );
      const curr_jobs = profile_parser.jobs;

      if (!curr_jobs.length) return;

      lookup_props.setStateTo("JOB"); // sets combinations
      curr_jobs.forEach((job) => {
        // get tags in `Job` record
        meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inherent);
        const job_tags = getValAtNodeCascading(job, meta_strategy.meta_path);

        if (!job_tags || isEmptyObj(job_tags)) return;

        // infer which tags are characteristic
        const characterised_tags = tag_strategy.getCharacterisedTags({
          source: mergeTopLevelPropsByDepthOfNesting(
            person_tags ?? {},
            job_tags,
          ),
          lookup_keys: lookup_props.combinations,
        });

        if (!characterised_tags.length) return;

        // conditionally add inferred tag `is_characterised_by` to `Job`
        meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
        meta_parser.setMetaParserStateTo(job);
        characterised_tags.forEach((tag) => {
          if (!tag) return;
          meta_parser.addMeta([tag_strategy.metric_keys[0]], {
            [tag]: {},
          });
        });
      });

      /* Step2 - add inherent props to `Person`: `total_xp_in_ms` 
            added_props: {
                inherent: {
                    total_xp_in_ms: 146966400000,
                  },
              }
          */
      // lookup_props.setStateTo("JOB"); // was set above
      meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inherent);
      const total_xp_in_ms = prop_strategy.getTotalWorkXp({
        source: curr_jobs,
        lookup_keys: lookup_props.number_keys,
      });

      if (!total_xp_in_ms) return; // handles case where `total_xp_in_ms` is 0

      // conditionally add inherent prop `total_xp_in_ms` to `Person`
      meta_parser.setMetaParserStateTo(profile_parser.root_node);
      meta_parser.addMeta([""], total_xp_in_ms && { total_xp_in_ms });

      /* Step3 - to `Person`, add inferred prop `all_skills_characterised`
            List all their specialist skills. For each skill, calculate the:
            - total duration in ms
            - percentage of the specialist experience against the total work experience
            e.g.
            { added_props: {
                inherent: {
                  total_xp_in_ms: 146966400000,
                },
                inferred: {
                  all_skills_characterised: {
                    middle_management: {
                      xp_in_ms: 146966400000,
                      xp_in_pc: 100,
                    },
                  },
                },
              },
            }  
          */
      // over the work experience, aggregate xp in characterised skills (xp_in_ms, xp_in_pc)
      meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
      const skill_duration_pairs = prop_strategy.getSpecialistSkills({
        source: curr_jobs,
        lookup_keys: lookup_props.number_keys,
      });

      if (!skill_duration_pairs.size) return;

      const all_skills_characterised = prop_strategy.getCharacterisedSkills(
        skill_duration_pairs,
        total_xp_in_ms,
      );

      if (isEmptyObj(all_skills_characterised)) return;

      // conditionally add inferred prop `all_skills_characterised` to `Person`
      meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
      // meta_parser.setMetaParserStateTo(profile_parser.root_node);  // set to `added_prop` above
      meta_parser.addMeta(
        [prop_strategy.all_skills_characterised],
        all_skills_characterised,
      );

      /* Step4 - for `Person` with characterised skills, who meet the `XP_THRESHOLD` threshold, add inferred tag to `Person`
            e.g.
            { tags: {
                inherent: {
                  headline: {
                    middle_management: {},
                  },
                },
                inferred: {
                  expertise_in: {
                    middle_management: {},
                  },
                },
              },  
            }
          */
      // get the characterised skills that meet the threshold
      lookup_props.setStateTo("PERSON");
      meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
      const tags = Object.entries(all_skills_characterised)
        .filter(([spe, value]) => value?.xp_in_pc >= XP_THRESHOLD)
        .map(([spe, value]) => spe);

      if (!tags.length) return;

      //construct `saasufy_seniority` property
      const seniority_container = {};
      tags.forEach((tag) => {
        if (!tag) return;

        // get `xp_in_ms` for each characterised skill
        const abs_path_to_target_segments = [meta_strategy.sub_key].concat([
          "all_skills_characterised",
          tag,
          "xp_in_ms",
        ]);
        let xp_in_ms = meta_parser.getValAtNodeCascading(
          abs_path_to_target_segments,
        ); // returns `undefined` for a non-existent path
        const duration = convertMillisecondsToDuration(xp_in_ms);
        seniority_container[tag] = convertToSaasufySeniority(duration);
      });

      // conditionally add inferred prop `saasufy_seniority` to `Person` record
      meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
      // meta_parser.setMetaParserStateTo(profile_parser.root_node);  // set to `added_prop` above
      meta_parser.addMeta([SENIORITY_KEY], seniority_container);

      // conditionally add inferred tag `expertise_in` to `Person` record
      meta_strategy.setStateTo(TYPES.tags_key, SUB_KEYS.inferred);
      meta_parser.setMetaParserStateTo(profile_parser.root_node); // sets the type of meta to `tags`
      tags.forEach((tag) => {
        if (!tag) return;
        meta_parser.addMeta([EXPERTISE_KEY], {
          ...(tag && { [tag]: {} }),
        });
      }); // mutates in-place

      /* Step5 - for `Person` with expertise in some skills,
            add inferred property `skillset` to their current company.
            e.g.
            { added_props: {
              inferred: {
                skillset: {
                  middle_management: {
                    employee_ids: [
                    {
                      public_id: "denil-john-90a2bb134",
                      lir_niid: "EMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk)",
                      member_id: "550167130",
                    },
                    {
                      public_id: "kevin-smith-90a2bb134",
                      lir_niid: "EMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk)",
                      member_id: "987654321",
                    },
                    ]
                  },
                },
              },
            }
          */
      // fetch current person's IDs and expert skills
      const expert_skills = meta_parser.getValAtNodeCascading([
        meta_strategy.sub_key,
        EXPERTISE_KEY,
      ]);
      const curr_person_ids = extractFromObjBy(
        profile_parser.root_node,
        lookup_props.person_id_keys,
      );

      if (isEmptyObj(expert_skills) || isEmptyObj(curr_person_ids)) return;

      /* construct new property
          skillset : {
                crit_name e.g. “electronics_engineering" : {
                    employee_ids: e.g. [ { "member_id: "550167130", public_id: "denil-john-90a2bb134", "lir_niid: "AEMAACDK4loBJomtahuXu8e2zQIqV9qajPiSgGk" } */
      const curr_employee_skillset = {};
      for (const skill in expert_skills) {
        curr_employee_skillset[skill] = {
          [EMPLOYEE_ID_KEY]: [curr_person_ids], // TODO - shift to Object with numeric keys aka indexed collection of integer-keyed properties. Object.assign({}, curr_person_ids)
        };
      }

      if (isEmptyObj(curr_employee_skillset)) return;

      // add inferred property `skillset` to their current `Company`
      const curr_cpy = profile_parser.companies[0]; // for actual current, check that "job_end_timestamp" is 1614574800000

      if (!curr_cpy) return;

      meta_strategy.setStateTo(TYPES.added_props_key, SUB_KEYS.inferred);
      meta_parser.setMetaParserStateTo(curr_cpy);
      meta_parser.addMeta([SKILLSET_KEY], curr_employee_skillset);
    });

    // write to file
    const base_name = `from-${file_timestamp}-${workerData.DIR_REL_PATH}-${json_arr.length}-profiles`;
    await tryWriteFile(workerData.DIR_ABS_PATH, base_name, FILE_EXT, json_arr);
  } catch (error) {
    console.error(
      `Error processing file: ${path.parse(file_path).name}`,
      error,
    );
  }
}

async function processBatch(paths_batch) {
  for (const file_path of paths_batch) {
    await processFile(file_path);
  } /* `for..of` loop allows async operations to be executed sequentially as,
  it waits for Promise in its body to resolve before proceeding to the next iteration */
  parentPort.postMessage("done");
}

processBatch(workerData.paths_batch);
