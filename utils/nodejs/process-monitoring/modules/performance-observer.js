// // /!\ Not tested /!\

// import path from "path";
// import { performance, PerformanceObserver } from "perf_hooks";
// import {
//   convertMillisecondsToDuration,
//   determineLastTwoUnitsToDisplay,
// } from "../utils/manip-date/modules/convert-milliseconds-to-duration.js";
// import { tryWriteFileSync } from "../../file-system/modules/try-write-file.js";

// const FILE_EXT = ".json";
// // performance monitoring
// const obs = new PerformanceObserver((list) => {
//   for (const entry of list.getEntries()) {
//     const duration = convertMillisecondsToDuration(entry.duration);
//     const end_date = determineLastTwoUnitsToDisplay(duration);
//     const report = {
//       file_path: entry.name,
//       duration_ms: entry.duration,
//       start_time_ms: entry.startTime,
//       end_time_ms: entry.startTime + entry.duration,
//       end_date,
//     }; // `PerformanceEntry` does not support custom properties, so the file name had to be passed as the `name` of the process
//     try {
//       tryWriteFileSync(
//         workerData.PERF_ABS_PATH,
//         `performance-report-${workerData.worker_id}`,
//         FILE_EXT,
//         report,
//       ); /* overwrites any pre-existing report, to only keep the latest.
//       One report per Worker though so as to not all writing to the same file, which could cause conflicts */
//     } catch (error) {
//       console.error(`Error writing performance report: ${error}`);
//     }
//   }
// });
// obs.observe({ entryTypes: ["measure"], buffered: true });

// async function processFile(file_path) {
//   const { name } = path.parse(file_path);

//   performance.mark(`start`);
//   try {
//   } catch (error) {
//     console.error(`Error reading file: ${error}`);
//   }
//   performance.mark(`end`);
//   performance.measure(name, `start`, `end`);
// }
