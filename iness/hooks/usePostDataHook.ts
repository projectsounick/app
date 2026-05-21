import React, { useState } from "react";

function useServiceWithSnackbar(serviceFunction: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const callService = async (
    params: any
  ): Promise<{ data: any; message: string; success: boolean }> => {
    try {
      const response = await serviceFunction(params);
      console.log(response);

      if (response.success) {
        setData(response.data); // Set the data if success
        return response; // Return the useful data
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage(response.message || "Operation failed");
        return response;
      }
    } catch (error: any) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Something went wrong";
      setSnackbarVisible(true);
      setSnackbarMessage(message);
      return { message, success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    setLoading,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  };
}

export default useServiceWithSnackbar;
