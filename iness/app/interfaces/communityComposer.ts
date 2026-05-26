export type CommunityDraftPostType = "text" | "image" | "video";

export interface CommunityDraftMediaItem {
  uri: string;
  kind: "image" | "video";
  fileName?: string | null;
  mimeType?: string | null;
  previewUri?: string | null;
}

export interface CommunityPostDraftPayload {
  communityId: string;
  type: CommunityDraftPostType;
  text: string;
  media: CommunityDraftMediaItem[];
}

export interface CommunityPostDraft extends CommunityPostDraftPayload {
  id: string;
  createdAt: number;
}

export type CommunityUploadJobStatus =
  | "queued"
  | "uploading"
  | "creating"
  | "completed"
  | "failed";

export interface CommunityUploadJob {
  id: string;
  draft: CommunityPostDraft;
  status: CommunityUploadJobStatus;
  progress: number;
  message: string;
  error?: string | null;
  uploadedUrls?: string[];
}
