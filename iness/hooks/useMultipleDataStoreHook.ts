import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { sliceConfig, SliceKey } from "@/sliceRegistery";
import { setMainLoader } from "@/Slices/loadingSlice";
import { apiCache, CacheTTL } from "@/utils/apiCache";

const debugLog = (...args: unknown[]) => {
  if (__DEV__) console.log(...args);
};

interface ServiceCallConfig {
  sliceKey: SliceKey;
  fetchFunction: (params?: any) => Promise<any>;
  params?: any;
  priority?: "high" | "low"; // Optional priority for loading order
  cacheTTL?: number; // Cache time-to-live in milliseconds
  enableCache?: boolean; // Whether to enable caching for this call
  staleWhileRevalidate?: boolean; // Whether expired cache can be shown before refresh
}

function useFetchMultipleStoreDataHook(
  configs: ServiceCallConfig[],
  autoFetch: boolean = true,
  usePriorityLoading: boolean = false // Option to enable priority-based loading
) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Separate high and low priority configs
      const highPriority = configs.filter((cfg) => cfg.priority === "high");
      const lowPriority = configs.filter((cfg) => cfg.priority !== "high");

      const performanceReport: Array<{ sliceKey: string; duration: number; status: string }> = [];
      let hasError = false;

      // Helper to create timed promise with immediate dispatch and caching
      const createTimedPromise = (cfg: ServiceCallConfig) => {
        const {
          sliceKey,
          fetchFunction,
          params,
          cacheTTL = CacheTTL.FIVE_MINUTES,
          enableCache = true,
          staleWhileRevalidate = false,
        } = cfg;
        const startTime = Date.now();
        const setAction = sliceConfig[sliceKey].setAction;
        const cacheKey = `${sliceKey}${params ? JSON.stringify(params) : ''}`;

        const executeRequest = async () => {
          try {
            // Use cache if enabled
            const res = enableCache
              ? await apiCache.get(
                  cacheKey,
                  () => fetchFunction(params),
                  { ttl: cacheTTL, staleWhileRevalidate, key: sliceKey }
                )
              : await fetchFunction(params);

            const duration = Date.now() - startTime;
            const seconds = (duration / 1000).toFixed(2);
            const status = duration > 3000 ? "⚠️ SLOW" : duration > 1000 ? "⚠️" : "✅";
            debugLog(`⏱️ [API Call] ${sliceKey}: ${seconds}s (${duration}ms) ${status}`);

            // Immediately dispatch data as it arrives (incremental rendering)
            if (res.success) {
              dispatch(setAction(res.data));
              performanceReport.push({ sliceKey, duration, status: "success" });
            } else {
              hasError = true;
              performanceReport.push({ sliceKey, duration, status: "failed" });
              console.error(`Error fetching ${sliceKey}:`, res);
            }

            return { res, duration, sliceKey };
          } catch (err: any) {
            const duration = Date.now() - startTime;
            const seconds = (duration / 1000).toFixed(2);
            console.error(`❌ [API Call] ${sliceKey} failed in ${seconds}s (${duration}ms):`, err.message);
            hasError = true;
            performanceReport.push({ sliceKey, duration, status: "error" });
            throw { err, duration, sliceKey };
          }
        };

        return executeRequest();
      };

      // PRIORITY LOADING: Load high priority first, then low priority
      if (usePriorityLoading && highPriority.length > 0) {
        debugLog("🚀 [Priority Loading] Starting high-priority APIs first...");

        // Start high priority calls
        const highPriorityPromises = highPriority.map(createTimedPromise);
        await Promise.allSettled(highPriorityPromises);

        // High priority done, mark as partially loaded
        setLoading(false);
        debugLog("✅ [Priority Loading] High-priority data loaded, UI can render");

        // Now load low priority in background
        if (lowPriority.length > 0) {
          debugLog("🔄 [Priority Loading] Loading low-priority APIs in background...");
          const lowPriorityPromises = lowPriority.map(createTimedPromise);
          await Promise.allSettled(lowPriorityPromises);
          debugLog("✅ [Priority Loading] All data loaded");
        }
      } else {
        // NO PRIORITY: Load all in parallel (existing behavior)
        const allPromises = configs.map(createTimedPromise);
        await Promise.allSettled(allPromises);
      }

      // Performance summary
      const sortedByDuration = [...performanceReport].sort((a, b) => b.duration - a.duration);
      debugLog("\n📊 [Dashboard Home] API Performance Summary (slowest first):");
      sortedByDuration.forEach(({ sliceKey, duration, status }) => {
        const seconds = (duration / 1000).toFixed(2);
        const icon = duration > 3000 ? "🐌" : duration > 1000 ? "⚠️" : "✅";
        debugLog(`  ${icon} ${sliceKey}: ${seconds}s (${duration}ms) - ${status}`);
      });
      debugLog("");

      if (hasError) {
        setSnackbarMessage("Some data failed to load");
        setError("Partial fetch failure");
        setSnackbarVisible(true);
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      setSnackbarMessage(msg);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  }, [configs, dispatch, usePriorityLoading]);

  const setDataManually = useCallback(
    (sliceKey: SliceKey, data: any) => {
      const setAction = sliceConfig[sliceKey].setAction;
      dispatch(setAction(data));
    },
    [dispatch]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    loading,
    error,
    fetchAll,
    setDataManually,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  };
}

export default useFetchMultipleStoreDataHook;
