type UploadProgressCallback = (progressPercent: number) => void;

const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  "3gp": "video/3gpp",
};

const getFileExtension = (value?: string | null) => {
  if (!value) return null;

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const match = cleanValue.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : null;
};

export const uploadToAzureFromExpo = async (
  fileUri: string,
  fileName: string,
  sasToken: string,
  storageAccountName: string,
  containerName: string,
  folderName: string,
  onProgress?: UploadProgressCallback,
  mimeTypeHint?: string | null
): Promise<string> => {
  const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${folderName}/${fileName}?${sasToken}`;
  let reportedProgress = 0;
  const reportProgress = (progress: number) => {
    if (!onProgress) return;
    const safeProgress = Math.max(0, Math.min(100, progress));
    if (safeProgress < reportedProgress) {
      return;
    }

    reportedProgress = safeProgress;
    onProgress(Math.round(safeProgress));
  };

  // Surface immediate feedback while the local asset is being prepared.
  reportProgress(2);
  const file = await fetch(fileUri);
  reportProgress(8);
  const fileBlob = await file.blob();
  reportProgress(12);
  const inferredMimeType =
    mimeTypeHint ||
    fileBlob.type ||
    EXTENSION_MIME_MAP[getFileExtension(fileName) || ""] ||
    "application/octet-stream";

  // Determine if this is a video file
  const isVideo =
    inferredMimeType.startsWith("video/") ||
    ["mp4", "mov", "m4v", "webm", "3gp"].includes(
      getFileExtension(fileName) || ""
    );

  const headers: Record<string, string> = {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": inferredMimeType,
    // Enable caching for faster loads (24 hours)
    "x-ms-blob-cache-control": "public, max-age=86400",
    // Force inline viewing for smooth streaming (critical!)
    "x-ms-blob-content-disposition": "inline",
  };

  // Use Hot tier for videos for better performance
  if (isVideo) {
    headers["x-ms-access-tier"] = "Hot";
  }

  const response = await new Promise<XMLHttpRequest>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let fallbackProgress = 12;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;
    xhr.open("PUT", blobUrl);

    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    const clearFallbackTimer = () => {
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    fallbackTimer = setInterval(() => {
      if (fallbackProgress >= 92) {
        clearFallbackTimer();
        return;
      }

      if (fallbackProgress < 45) {
        fallbackProgress += 1.4;
      } else if (fallbackProgress < 75) {
        fallbackProgress += 0.9;
      } else {
        fallbackProgress += 0.35;
      }

      reportProgress(Math.min(fallbackProgress, 92));
    }, 450);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }

      // Reserve the first 12% for local file preparation so the UI doesn't
      // sit at 0 while Expo reads the asset into a blob.
      const uploadProgress = event.loaded / event.total;
      const actualProgress = 12 + uploadProgress * 88;
      fallbackProgress = Math.max(fallbackProgress, actualProgress);
      reportProgress(actualProgress);
    };

    xhr.onload = () => {
      clearFallbackTimer();
      resolve(xhr);
    };
    xhr.onerror = () => {
      clearFallbackTimer();
      reject(new Error("Network error during Azure upload"));
    };
    xhr.onabort = () => {
      clearFallbackTimer();
      reject(new Error("Azure upload was aborted"));
    };
    xhr.send(fileBlob);
  });

  if (response.status < 200 || response.status >= 300) {
    const errorText = response.responseText;
    console.error('Azure upload failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      fileName,
      fileType: inferredMimeType
    });
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  reportProgress(100);
  return blobUrl.split("?")[0]; // Return public blob URL without token
};
