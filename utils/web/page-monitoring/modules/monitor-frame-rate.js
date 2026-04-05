let is_monitoring = false;
let is_critical = false;
let observer = null;

/**
 * Monitor frame rate drops
 * @param {number} [threshold=3000] Critical frame time threshold in ms
 * @returns {Object} Control object with methods to check and reset critical frame drops
 */
export function monitorFrameRate(threshold = 3000) {
  if (is_monitoring) {
    return {
      isCritical: () => is_critical,
      resetCritical: () => {
        is_critical = false;
      },
      stop: stopMonitoring,
    };
  }

  is_monitoring = true;
  is_critical = false;

  if (typeof PerformanceObserver !== "undefined") {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          console.warn(`Frame drop detected: ${Math.round(entry.duration)}ms`);
          is_critical = true;
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      console.error(
        `Whilst processing ${monitorFrameRate.name}, Error:`,
        error,
      );
      console.log("PerformanceObserver not fully supported in this browser");
    }
  }

  return {
    isCritical: () => is_critical,
    resetCritical: () => (is_critical = false),
    stop: stopMonitoring,
  };
}

function stopMonitoring() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  is_monitoring = false;
}
