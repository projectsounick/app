export type CommunityDraftPostType = "text" | "image" | "video";
export type CommunityContentType =
  | "regular" | "progress" | "workout" | "poll" | "question"
  | "exercise" | "recipe" | "milestone" | "session" | "event"
  | "weekly_recap" | "transformation";

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
  contentType?: CommunityContentType;
  audience?: "public" | "followers" | "company" | "private";
  publishingStatus?: "published" | "draft" | "scheduled";
  scheduledAt?: string;
  hashtags?: string[];
  commentsEnabled?: boolean;
  sharingEnabled?: boolean;
  isSensitive?: boolean;
  metadata?: Record<string, unknown>;
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
