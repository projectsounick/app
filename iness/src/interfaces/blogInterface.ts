export interface BlogContent {
  contentType: string;
  sequence: number;
  contentData: string;
}

export interface Blog extends Document {
  _id: string;
  title: string;
  createdBy: string;
  updatedBy?: string;
  content: BlogContent[];
  createdAt: Date;
  updatedAt: Date;
  coverImage: string;
}

export interface BlogState {
  blogs: Blog[];
}
