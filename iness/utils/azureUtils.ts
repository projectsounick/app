import * as mime from "mime";

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

  const response = await fetch(blobUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": fileBlob.type,
    },
    body: fileBlob,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return blobUrl.split("?")[0]; // Return public blob URL without token
};
