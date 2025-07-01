export interface ParticipantFrontend {
  userId: string; // stringified ObjectId
  uid?: string | number;
  token?: string;
}

export interface VideoCallFrontend {
  creatorId: string; // stringified ObjectId
  appId: string;
  participants: ParticipantFrontend[];
  channelName: string;
  active: boolean;
  duration: string;
  callId: number;
  token: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  endedAt?: string; // optional ISO date string
}
