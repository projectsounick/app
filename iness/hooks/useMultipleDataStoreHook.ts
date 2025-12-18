import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { sliceConfig, SliceKey } from "@/sliceRegistery";
import { setMainLoader } from "@/Slices/loadingSlice";

interface ServiceCallConfig {
  sliceKey: SliceKey;
  fetchFunction: (params?: any) => Promise<any>;
  params?: any;
  priority?: "high" | "low"; // Optional priority for loading order
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
      // If priority loading is enabled, separate high and low priority configs
      let configsToFetch = configs;
      if (usePriorityLoading) {
        const highPriority = configs.filter((cfg) => cfg.priority !== "low");
        const lowPriority = configs.filter((cfg) => cfg.priority === "low");
        configsToFetch = [...highPriority, ...lowPriority];
      }

      const timedPromises = configsToFetch.map((cfg) => {
        const { sliceKey, fetchFunction, params } = cfg;

        const startTime = Date.now();

        return fetchFunction(params)
          .then((res) => {
            const duration = Date.now() - startTime;
            const seconds = (duration / 1000).toFixed(2);
            const status = duration > 3000 ? "⚠️ SLOW" : duration > 1000 ? "⚠️" : "✅";
            return { res, duration, sliceKey };
          })
          .catch((err) => {
            const duration = Date.now() - startTime;
            const seconds = (duration / 1000).toFixed(2);
            console.error(`❌ [${sliceKey}] failed in ${seconds}s (${duration}ms):`, err.message);
            throw { err, duration, sliceKey };
          });
      });

      const results = await Promise.allSettled(timedPromises);

      let hasError = false;
      const performanceReport: Array<{ sliceKey: string; duration: number; status: string }> = [];

      results.forEach((result, index) => {
        const { sliceKey } = configsToFetch[index];
        const setAction = sliceConfig[sliceKey].setAction;

        if (result.status === "fulfilled") {
          const { res, duration } = result.value;
          if (res.success) {
            dispatch(setAction(res.data));
            performanceReport.push({ sliceKey, duration, status: "success" });
          } else {
            hasError = true;
            performanceReport.push({ sliceKey, duration, status: "failed" });
            console.error(`Error fetching ${sliceKey}:`, res);
          }
        } else {
          hasError = true;
          const duration = result.reason?.duration || 0;
          performanceReport.push({ sliceKey, duration, status: "error" });
          console.error(
            `Error fetching ${sliceKey}:`,
            result.reason?.err || result.reason
          );
        }
      });

      // Performance summary
      // const sortedByDuration = [...performanceReport].sort((a, b) => b.duration - a.duration);
      // console.log("\n📊 API Performance Summary (slowest first):");
      // sortedByDuration.forEach(({ sliceKey, duration, status }) => {
      //   const seconds = (duration / 1000).toFixed(2);
      //   const icon = duration > 3000 ? "🐌" : duration > 1000 ? "⚠️" : "✅";
      //   console.log(`  ${icon} ${sliceKey}: ${seconds}s (${duration}ms) - ${status}`);
      // });
      // console.log("");

      if (hasError) {
        setSnackbarMessage("Some data failed to load");
        setError("Partial fetch failure");
      } else {
        setSnackbarMessage("All data fetched successfully");
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setError(msg);
      setSnackbarMessage(msg);
    } finally {
      setSnackbarVisible(true);
      setLoading(false);
    }
  }, [configs, dispatch]);

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
