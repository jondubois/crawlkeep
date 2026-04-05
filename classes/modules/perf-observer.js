/**
 * Monitor browser thread contention
 * @description It detects long-running tasks that could cause the browser to become unresponsive.
 * The browser defines a "long task" as one that blocks the main thread for more than 50ms.
 */
class PerfObserver {
  static #instance = null;

  // private fields
  #observer = null;
  #is_supported = false;

  constructor() {
    if (PerfObserver.#instance) {
      return PerfObserver.#instance;
    }

    this.#is_supported = typeof PerformanceObserver !== "undefined";

    PerfObserver.#instance = this;
  }

  static getInstance() {
    if (!PerfObserver.#instance) {
      PerfObserver.#instance = new PerfObserver();
    }
    return PerfObserver.#instance;
  }

  start = () => {
    if (this.#is_supported && !this.#observer) {
      this.#observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(
            `Long task impacting UX detected: ${Math.round(entry.duration)}ms`,
          );
          // trigger custom event
          document.dispatchEvent(
            new CustomEvent("longTaskDetected_id0", {
              detail: { duration: entry.duration },
            }),
          );
        }
      });

      try {
        this.#observer.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        console.error("Error starting performance monitoring:", e);
        this.#observer = null;
      }
    }

    return this;
  };

  isSupported = () => {
    return this.#is_supported;
  };

  stop = () => {
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
    return this;
  };
}

export default PerfObserver.getInstance();

// function() {
//   var e = this;
//   if (!this.observerPerformance) {
//       !function t() {
//           var r = function() {
//               try {
//                   var e = !1
//                     , t = "";
//                   "PerformanceObserver"in window && new PerformanceObserver((function(r) {
//                       var n, o = U(r.getEntries());
//                       try {
//                           for (o.s(); !(n = o.n()).done; )
//                               n.value.duration > 50 && (e = !0,
//                               t = "PerformanceObserver longtask")
//                       } catch (e) {
//                           o.e(e)
//                       } finally {
//                           o.f()
//                       }
//                   }
//                   )).observe({
//                       type: "longtask",
//                       buffered: !0
//                   });
//                   var r = navigator.userAgent.toLowerCase()
//                     , n = /mobile|android|iphone|ipad/.test(r)
//                     , o = navigator.connection || {}
//                     , i = ["slow-2g", "2g", "3g"].includes(o.effectiveType);
//                   return (n || i) && (e = !0,
//                   t = "isLowEndDevice: ".concat(n, ";isSlowConnection: ").concat(i, "-").concat(o.effectiveType)),
//                   {
//                       isDegraded: e,
//                       reason: t
//                   }
//               } catch (e) {
//                   return console.error("Error checking performance degradation:", e),
//                   {
//                       isDegraded: !1,
//                       reason: "error"
//                   }
//               }
//           }()
//             , n = r.isDegraded;
//           r.reason;
//           n ? e._enterDegradedMode() : e._exitDegradedMode(),
//           setTimeout(t, G.FIVE_SECONDS)
//       }(),
//       this.observerPerformance = !0
//   }
// }
