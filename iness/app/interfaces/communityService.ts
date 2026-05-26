interface Post {
  _id?: string;
  communityId: string;
  type: string;
  media?: string[];
  previewImage?: string | null;
  processingStatus?: "pending" | "processing" | "ready" | "failed";
  processingError?: string | null;
  streamUrl?: string | null;
  text?: string;
  isApproved: boolean;

  isActive: boolean;
  createdBy: any;
}
export type { Post };
