const { readFile, writeFile } = require('fs/promises');

const firstFilePath = process.argv[2];
const secondFilePath = process.argv[3];
const outputFilePath = process.argv[4];

(async () => {
  let firstFileContent = await readFile(firstFilePath, { encoding: 'utf8' });
  let firstIdList = JSON.parse(firstFileContent);

  let secondFileContent = await readFile(secondFilePath, { encoding: 'utf8' });
  let secondIdList = JSON.parse(secondFileContent);

  let allIds = [ ...new Set([ ...firstIdList, ...secondIdList ]) ];
  await writeFile(outputFilePath, JSON.stringify(allIds), { encoding: 'utf8' });
  
  console.log(`Saved ${allIds.length} IDs to ${outputFilePath}`);
})();