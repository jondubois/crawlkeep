import path from "path";
import os from "os";
import { Worker } from "worker_threads";
import { createDir } from "../utils/file-system/index.js";
import { getFilePaths } from "../utils/file-system/modules/get-file-paths.js";
import { generateProcessReport } from "../utils/process-monitoring/modules/generate-process-report.js";

const SRC_REL_PATH =
  "Documents/exeksourcing-data/scraped_content/DB/DB_engineering_AU/DB_sftwEngineering/data-dump-26042024/nested-serialised-profiles/inherent-tagged/"; // /inherent-tagged /can-be-deleted
// "Documents/Mirror/nested-serialised-profiles/inherent-tagged-profiles"; // can-be-deleted
const SRC_ABS_PATH = path.resolve(
  process.env.HOME || process.env.USERPROFILE,
  SRC_REL_PATH,
); /* in Windows, environment variables like `HOME` are not set by default as they are in Unix-based systems.
Instead, Windows uses `USERPROFILE` to represent the path to the current user's home directory. */
const DIR_REL_PATH = "inferred-tagged"; // "inferred-tagged" "inherent-tagged"
const DIR_ABS_PATH = path.resolve(SRC_ABS_PATH, DIR_REL_PATH);
createDir(DIR_ABS_PATH);

// performance monitoring
const PERF_REL_PATH = "performance-monitoring";
const PERF_ABS_PATH = path.resolve(DIR_ABS_PATH, PERF_REL_PATH);
createDir(PERF_ABS_PATH);

const workers_num = os.cpus().length / 2; // number of logical / virtual cores Simultaneous Multithreading (SMT), also known as Hyper-Threading Technology (HTT)
const workers_promises = [];

async function main() {
  // performance monitoring
  console.log("Current PID: ", process.pid);
  console.time("Script Execution Time");
  try {
    // group file paths into as many batches as there are cores
    const file_paths = await getFilePaths(SRC_ABS_PATH, ".json");

    const batch_size = Math.ceil(file_paths.length / workers_num);
    const path_batches = [];
    for (let i = 0; i < workers_num; i++) {
      const batch = file_paths.slice(i * batch_size, (i + 1) * batch_size);
      if (batch.length > 0) {
        path_batches.push(batch);
      }
    }

    // assign a new Worker to each batch
    path_batches.forEach((batch, i) => {
      const worker = new Worker(
        new URL("./worker-add-inferred-meta-tag.js", import.meta.url),
        {
          workerData: {
            paths_batch: batch,
            DIR_REL_PATH,
            DIR_ABS_PATH,
            PERF_ABS_PATH,
            worker_id: i,
          },
        },
      ); // ./worker-add-inferred-meta-tag.js ./worker-add-inherent-meta-tag.js

      // resolves when each Worker is done processing its batch
      workers_promises.push(
        new Promise((resolve, reject) => {
          worker.on("message", (message) => {
            if (message === "done") {
              resolve();
            }
          });
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`));
            }
          });
        }),
      );
    });

    await Promise.all(workers_promises);
  } catch (error) {
    console.error("Error in main process:", error);
  } finally {
    console.timeEnd("Script Execution Time");
  }
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("exit", (exit_code) => {
  generateProcessReport(process);
  // play a sound and display toast
  (async () => {
    const notifier = await import("node-notifier");
    notifier.default.notify({
      title: "Process Completed",
      message: "Successful",
      sound: true, // only Notification Center or Windows Toasters
    });
  })();
  if (exit_code !== 0) {
    console.log(`Process exited with code ${exit_code}.`);
  }
});
