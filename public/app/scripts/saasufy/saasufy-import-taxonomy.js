const { convertStringToId } = require('./utils.js');
const {
  importDataFiles,
} = require('./import-utils.js');

const BATCH_SIZE = 200;

const sourceFilePath = process.argv[2];
const crudAction = process.argv[3] || 'create';

(async () => {
  await importDataFiles(
    [ sourceFilePath ],
    'Taxonomy',
    process.env.AUTH_KEY,
    BATCH_SIZE,
    crudAction,
    (resource) => {
      return resource.nodes.map(({ child_id, ...sanitizedResource }) => sanitizedResource);
    },
    (resource) => {
      if (!resource || !resource.name) {
        return null;
      }
      return convertStringToId(String(resource.name));
    },
    (resource) => {
      let optionalData = {};
      if (resource.regex_pattern) {
        optionalData.regexPattern = resource.regex_pattern.join('|');
      }
      return {
        name: resource.name,
        tagName: resource.name?.replace(/_id[0-9]+$/, '').replace(/_/g, '-'),
        parentName: resource.parent_name,
        parentId: convertStringToId(String(resource.parent_name)),
        keywords: resource.keyword,
        version: 1,
        ...optionalData
      };
    }
  );

  process.exit();
})();
