import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { sliceConfig, SliceKey } from "@/sliceRegistery";
import { setMainLoader } from "@/Slices/loadingSlice";

interface ServiceCallConfig {
  sliceKey: SliceKey;
  fetchFunction: (params?: any) => Promise<any>;
  params?: any;
}

function useFetchMultipleStoreDataHook(
  configs: ServiceCallConfig[],
  autoFetch: boolean = true
) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fetchAll = useCallback(async () => {
    console.log("called");
    setLoading(true);
    setError(null);

    try {
      const timedPromises = configs.map((cfg) => {
        const { sliceKey, fetchFunction, params } = cfg;

        const startTime = Date.now();

        return fetchFunction(params)
          .then((res) => {
            const duration = Date.now() - startTime;
            console.log(`[${sliceKey}] completed in ${duration} ms`);
            return res;
          })
          .catch((err) => {
            const duration = Date.now() - startTime;
            console.error(`[${sliceKey}] failed in ${duration} ms`);
            throw err;
          });
      });

      const results = await Promise.allSettled(timedPromises);

      let hasError = false;

      results.forEach((result, index) => {
        const { sliceKey } = configs[index];
        const setAction = sliceConfig[sliceKey].setAction;

        if (result.status === "fulfilled" && result.value.success) {
          dispatch(setAction(result.value.data));
        } else {
          hasError = true;
          console.error(
            `Error fetching ${sliceKey}:`,
            result.status === "rejected" ? result.reason : result.value
          );
        }
      });

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
