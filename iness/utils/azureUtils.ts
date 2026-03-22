export const uploadToAzureFromExpo = async (
  fileUri: string,
  fileName: string,
  sasToken: string,
  storageAccountName: string,
  containerName: string,
  folderName: string
): Promise<string> => {
  const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${folderName}/${fileName}?${sasToken}`;

  const file = await fetch(fileUri);
  const fileBlob = await file.blob();

  // Determine if this is a video file
  const isVideo = fileBlob.type.startsWith('video/') || fileName.endsWith('.mp4');

  const headers: Record<string, string> = {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": fileBlob.type || "application/octet-stream",
    // Enable caching for faster loads (24 hours)
    "x-ms-blob-cache-control": "public, max-age=86400",
    // Force inline viewing for smooth streaming (critical!)
    "x-ms-blob-content-disposition": "inline",
  };

  // Use Hot tier for videos for better performance
  if (isVideo) {
    headers["x-ms-access-tier"] = "Hot";
  }

  const response = await fetch(blobUrl, {
    method: "PUT",
    headers,
    body: fileBlob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Azure upload failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      fileName,
      fileType: fileBlob.type
    });
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return blobUrl.split("?")[0]; // Return public blob URL without token
};
