import { UserData } from "./UserInterface";

interface PodcastInteractions {
  comment: string;
  userName: string;
  userId: string;
}

interface PodcastInterface {
  _id?: string;
  podcastName: string;
  podcastLink: string;
  category: string;
  createdBy: string; // This should match the User ID
  createdAt?: Date;
  updatedAt?: Date;
  interactions: PodcastInteractions[];
  thumbnailImageLink: string;
  description: string;
  likes: String[];
}

interface PodcastVideoCardPropsInterface {
  podcast: PodcastInterface;
  loading: boolean;
  loggedUser: UserData | null;
  updatePodcastData: (data: any) => void;
}
interface PodcastUpdateCallArgumentsInterface {
  podcastId: string;
  userName: string;
  comment: string | null;
}
// Interface for a single comment
interface Comment {
  userName: string;
  userId: string;
  comment: string;
}

// Interface for the modal props
interface MediaComponentModalProps {
  commentModalVisible: boolean;
  setCommentModalVisible: (visible: boolean) => void;
  podcast: PodcastInterface;

  handleAddComment: (data: any) => void;
}
interface MediaVideoModalProps {
  visible: boolean;
  onClose: () => void;
  podcast: {
    podcastLink: string;
  };
}
interface MediaState {
  mediaItems: PodcastInterface[];
}
export type {
  PodcastInteractions,
  PodcastInterface,
  PodcastVideoCardPropsInterface,
  MediaVideoModalProps,
  MediaState,
  Comment,
  MediaComponentModalProps,
  PodcastUpdateCallArgumentsInterface,
};
