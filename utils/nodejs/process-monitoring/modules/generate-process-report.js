import path from "path";
import os from "os";
import { createDir } from "../../file-system/modules/create-dir.js";
import { tryWriteFileSync } from "../../file-system/modules/try-write-file.js";

/**
 * @description Generates a process report about the current Node.js process.
 * @param {import("process").Process} process - The current Node.js process.
 */
export function generateProcessReport(process) {
  const now = new Date();
  const start_time = new Date(now.getTime() - process.uptime() * 1000);
  const end_time = now;

  const process_report = {
    name: process.title,
    pid: process.pid,
    username: process.env.USERNAME,
    computer_name: process.env.COMPUTERNAME,
    resource_usage: process.resourceUsage(),
    uptime: process.uptime(),
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    duration: `${Math.floor(process.uptime() / 86400)} days, ${Math.floor(
      (process.uptime() % 86400) / 3600,
    )} hours, ${Math.floor(
      (process.uptime() % 3600) / 60,
    )} minutes, ${Math.floor(process.uptime() % 60)} seconds`,
    node_version: process.version,
    platform: process.platform,
    arch: process.arch,
    cpu_usage: process.cpuUsage(),
    cpu: process.cpuUsage().user + process.cpuUsage().system,
    peak_working_set_memory: process.memoryUsage().rss / 1024,
    working_set_memory: process.memoryUsage().heapUsed / 1024,
    active_private_working_memory: process.memoryUsage().heapTotal / 1024,
    shared_working_set_memory:
      (process.memoryUsage().rss - process.memoryUsage().heapTotal) / 1024,
    memory_usage: process.memoryUsage(),
    available_memory: os.freemem(),
    total_memory: os.totalmem(),
    commit_size: process.memoryUsage().external / 1024,
    page_faults: process.resourceUsage().pageFaults,
    handles: process.resourceUsage().fsRead + process.resourceUsage().fsWrite,
    threads: process.resourceUsage().voluntaryContextSwitches,
    io_reads: process.resourceUsage().fsRead,
    io_writes: process.resourceUsage().fsWrite,
    description: process.title,
  };

  const report_abs_dir = path.resolve(
    process.cwd() ?? process.argv[2],
    "data-miner",
    "parallel-processing",
    "process-monitoring-report",
  );
  createDir(report_abs_dir);
  tryWriteFileSync(report_abs_dir, "process-report", ".json", process_report);
}
