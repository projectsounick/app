import { useEffect, useState } from "react";

///// Function for fetching the hook----------------------/
function useGetDataHook(
  fetchFunction: (params?: any) => Promise<any>,
  params?: any,
  autoFetch: boolean = true
) {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const fetchData = async (overrideParams?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFunction(overrideParams ?? params);

      if (response.success) {
        setData(response.data);
        setSnackbarMessage("Data fetched successfully");
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Failed to fetch data");
        setError("Fetch failed");
      }

      return response;
    } catch (err: any) {
      const message = err?.message || "Something went wrong";
      setSnackbarVisible(true);
      setSnackbarMessage(message);
      setError(message);
      return { success: false, message, data: null };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    setLoading,
    error,
    fetchData,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
    setData,
  };
}

export default useGetDataHook;
