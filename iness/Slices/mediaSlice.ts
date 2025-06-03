import {
  MediaState,
  PodcastInterface,
} from "@/app/interfaces/podcastsInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: MediaState = {
  mediaItems: [],
};

const mediaSlice = createSlice({
  name: "media",
  initialState,
  reducers: {
    setMediaItems: (state, action: PayloadAction<any[]>) => {
      state.mediaItems = action.payload;
    },
  },
});

export const { setMediaItems } = mediaSlice.actions;
export default mediaSlice.reducer;
