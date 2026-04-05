// https://nodesource.com/blog/understanding-streams-in-nodejs/

import { Readable } from "stream";

const readable_stream = new Readable();
readable_stream.push("ping!");
readable_stream.push("pong!");
debugger;
///////////////////////////////////////////////
import * as fs from "fs";

async function logChunks(readable) {
  try {
    for await (const chunk of readable) {
      console.log(chunk);
    }
  } catch (err) {
    console.error("An error occurred:", err);
  }
}
const file_path = "";
let data = "";

const readable_stream = fs.createReadStream(file_path, { encoding: "utf8" });
// Handle stream events --> data, end, and error
readable_stream.on("data", function (chunk) {
  data += chunk;
});

readable_stream.on("end", function () {
  console.log(data);
});
readable_stream.on("error", (err) => {
  console.error("An error occurred while reading the file:", err);
});
// logChunks(readable_stream);
// debugger;

////////////////////////////////////////////
// async function deDupRecords() {
//   return fetchJSONfromLocalDir(folder_path, FILE_EXT)
//     .then(
//       (people_records) => {
//         const people_ids = ["public_id", "lir_niid", "member_id"];
//         const jobs_ids = ["job_company_id"];
//         const readable = new Readable({
//           read() {
//             this.push(JSON.stringify(people_records));
//             this.push(null); // Indicates end of data
//           },
//           objectMode: true,
//         });

//         readable.on("data", (chunk) => {
//           const records_with_ID = manipArr.filterByAnyProps(chunk, people_ids);
//           const unique_records = manipArr.filterDuplicatesByMultiProps(
//             records_with_ID,
//             people_ids,
//           );

//           console.log(`Processed ${chunk.length} bytes of data.`);
//         });
//       },
//       (reason) => {
//         throw new Error("One or both promises did not fulfill: " + reason);
//       },
//     )
//     .catch((error) => {
//       console.error(error.message);
//     });
// }
// const output = deDupRecords();

/////////////////////////////////////////////////////
/* to stream data file by file */
// import * as fs from 'fs';
// import * as path from 'path';
// import { Readable } from 'stream';

// async function fetchJSONfromLocalDir(dir) {
//   const files = await fs.promises.readdir(dir);
//   const data = await Promise.all(
//     files.map((file) => {
//       return new Promise((resolve, reject) => {
//         const chunks = [];
//         const readStream = fs.createReadStream(path.join(dir, file), { encoding: 'utf8' });

//         readStream.on('data', (chunk) => {
//           chunks.push(chunk);
//         });

//         readStream.on('end', () => {
//           const content = chunks.join('');
//           resolve(JSON.parse(content));
//         });

//         readStream.on('error', (err) => {
//           reject(err);
//         });
//       });
//     })
//   );
//   return data.reduce((acc, curr) => [...acc, ...curr], []);
// }

///////////////////////////////////////////////////
// async function fetchJSONfromLocalDir(dir) {
//   const files = await fs.promises.readdir(dir);
//   const data = await Promise.all(
//     files.map((file) => {
//       return new Promise((resolve, reject) => {
//         let partialRecord = '';
//         const records = [];
//         const readStream = fs.createReadStream(path.join(dir, file), { encoding: 'utf8' });

//         readStream.on('data', (chunk) => {
//           let data = partialRecord + chunk;
//           let lastNewlineIndex = data.lastIndexOf('\n');

//           if (lastNewlineIndex === -1) {
//             partialRecord = data;
//             data = '';
//           } else {
//             partialRecord = data.slice(lastNewlineIndex + 1);
//             data = data.slice(0, lastNewlineIndex);
//           }

//           data.split('\n').forEach((record) => {
//             try {
//               records.push(JSON.parse(record));
//             } catch (err) {
//               console.error(`Failed to parse record: ${record}`);
//             }
//           });
//         });

//         readStream.on('end', () => {
//           if (partialRecord) {
//             try {
//               records.push(JSON.parse(partialRecord));
//             } catch (err) {
//               console.error(`Failed to parse record: ${partialRecord}`);
//             }
//           }
//           resolve(records);
//         });

//         readStream.on('error', (err) => {
//           reject(err);
//         });
//       });
//     })
//   );
//   return data.reduce((acc, curr) => [...acc, ...curr], []);
// }

///////////////////////////////////////////////
// import * as fs from 'fs';
// import * as path from 'path';
// import JSONStream from 'jsonstream';

// async function formatJSONFile(filePath) {
//   const data = await fs.promises.readFile(filePath, 'utf8');
//   const jsonArray = JSON.parse(data);
//   const formattedData = jsonArray.map((obj) => JSON.stringify(obj)).join('\n');
//   await fs.promises.writeFile(filePath, formattedData);
// }

// async function fetchJSONfromLocalDir(dir) {
//   const files = await fs.promises.readdir(dir);
//   await Promise.all(files.map((file) => formatJSONFile(path.join(dir, file))));

//   const data = await Promise.all(
//     files.map((file) => {
//       return new Promise((resolve, reject) => {
//         const records = [];
//         const readStream = fs.createReadStream(path.join(dir, file), { encoding: 'utf8' });
//         const parser = JSONStream.parse('*');
//         readStream.pipe(parser);

//         parser.on('data', (record) => {
//           records.push(record);
//         });

//         parser.on('end', () => {
//           resolve(records);
//         });

//         parser.on('error', (err) => {
//           reject(err);
//         });
//       });
//     })
//   );

//   return data.reduce((acc, curr) => [...acc, ...curr], []);
// }
///////////////////////////////////////////////
// /* Doesn't make sense to stream the data as the function that parses it needs a complete JSON object as a parameter  */
// import * as fs from 'fs';
// import * as path from 'path';
// import { Readable } from 'stream';

// async function aggregateSample(dir) {
//   const files = await fs.promises.readdir(dir);
//   const data = await Promise.all(
//     files.map((file) => {
//       return new Promise((resolve, reject) => {
//         fs.promises.readFile(path.join(dir, file), 'utf8')
//           .then((fileContent) => {
//             const people_records = JSON.parse(fileContent);
//             const formattedData = people_records.map((obj) => JSON.stringify(obj)).join('\n');
//             const readable = new Readable({
//               read() {
//                 this.push(formattedData);
//                 this.push(null); // Indicates end of data
//               },
//               objectMode: true,
//             });

//             // Process the readable stream here...

//             resolve(); // Resolve the promise when done
//           })
//           .catch(reject); // Reject the promise if an error occurs
//       });
//     })
//   );
//   return data;
// }
