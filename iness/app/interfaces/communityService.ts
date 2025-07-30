interface Post {
  _id?: string;
  communityId: string;
  type: string;
  media?: string[];
  text?: string;
  isApproved: boolean;

  isActive: boolean;
  createdBy: string;
}
export type { Post };
