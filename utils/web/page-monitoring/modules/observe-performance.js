let observer = null;
let is_long_task_detected = false;

/**
 * Monitor browser thread contention
 * @description It detects long-running tasks that could cause the browser to become unresponsive.
 * @param {number} [threshold=3000] Task duration threshold in ms
 * @returns {Object} Control object with methods to check and reset long task detection
 */
export function observePerformance(threshold = 3000) {
  if (typeof PerformanceObserver !== "undefined") {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          console.warn(
            `Length of task impacting UX detected: ${Math.round(
              entry.duration,
            )}ms`,
          );
          is_long_task_detected = true;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch (e) {
      console.log("PerformanceObserver not supported in this browser");
    }
  }

  return {
    isLongTaskDetected: () => is_long_task_detected,
    reset: () => (is_long_task_detected = false),
    stop: stopMonitoring,
  };
}

function stopMonitoring() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
