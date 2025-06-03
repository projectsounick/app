import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { sliceConfig, SliceKey } from "@/sliceRegistery";
function useFetchStoreDataHook(
  sliceKey: SliceKey,
  fetchFunction: (params?: any) => Promise<any>,
  params?: any,
  autoFetch: boolean = true
) {
  const dispatch = useDispatch();

  const selectorPath = sliceConfig[sliceKey].selectorKey;
  const setAction = sliceConfig[sliceKey].setAction;

  const sliceState = useSelector((state: RootState) => {
    const sliceData = state[sliceKey as keyof RootState] as any;
    return sliceData?.[selectorPath];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fetchData = useCallback(
    async (overrideParams?: any) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchFunction(overrideParams ?? params);
        if (res.success) {
          dispatch(setAction(res.data));
          setSnackbarMessage("Data fetched successfully");
        } else {
          setError("Failed to fetch");
          setSnackbarMessage("Fetch failed");
        }
      } catch (err: any) {
        const msg = err.message || "Something went wrong";
        setError(msg);
        setSnackbarMessage(msg);
      } finally {
        setSnackbarVisible(true);
        setLoading(false);
      }
    },
    [dispatch, fetchFunction, params, setAction]
  );

  // New: setData function to update store manually
  const setData = useCallback(
    (data: any) => {
      dispatch(setAction(data));
    },
    [dispatch, setAction]
  );

  useEffect(() => {
    if (
      autoFetch &&
      (!sliceState || (Array.isArray(sliceState) && sliceState.length === 0))
    ) {
      fetchData();
    }
  }, [autoFetch, sliceState, fetchData]);

  return {
    data: sliceState,
    loading,
    error,
    fetchData,
    setData, // <-- return setData here
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  };
}

export default useFetchStoreDataHook;
