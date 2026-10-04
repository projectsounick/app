interface Post {
  _id?: string;
  communityId: string;
  type: string;
  media?: string[];
  previewImage?: string | null;
  processingStatus?: "pending" | "processing" | "ready" | "failed";
  processingError?: string | null;
  streamUrl?: string | null;
  localMediaUri?: string | null;
  text?: string;
  contentType?: string;
  audience?: string;
  publishingStatus?: string;
  scheduledAt?: string;
  hashtags?: string[];
  mentions?: string[];
  commentsEnabled?: boolean;
  sharingEnabled?: boolean;
  isSensitive?: boolean;
  metadata?: Record<string, any>;
  challengeTag?: string;
  challengeBadge?: { _id: string; title: string; metric?: string } | null;
  savedByUser?: boolean;
  likedByUser?: boolean;
  followedByUser?: boolean;
  reactionCounts?: Record<string, number>;
  userReaction?: string;
  pollVoteCounts?: Record<string, number>;
  userPollVote?: number;
  userRsvp?: string;
  isApproved: boolean;

  isActive: boolean;
  createdBy: any;
}
export type { Post };
