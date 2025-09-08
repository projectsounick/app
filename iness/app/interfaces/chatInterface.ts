// ChatInterfaces.ts

interface ChatMessage {
  role: string;
  content: string;
  date: string; // ISO string or Date based on how you store it
  supportId?: string | null;
  attachments: string[];
}

interface SupportChat {
  _id: string;
  userId: string;
  conversation: ChatMessage[];
  newMessage: boolean;
  newSupportMessage?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
interface ChatMessageBubbleProps {
  item: ChatMessage;
  index: any;
  setSelectedImage: (type: string) => void;
  setImageModalVisible: (type: boolean) => void;
}
export type { ChatMessage, SupportChat, ChatMessageBubbleProps };
