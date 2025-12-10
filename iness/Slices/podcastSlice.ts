import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  PodcastInterface,
  PodcastUpdateCallArgumentsInterface,
} from "@/app/interfaces/podcastsInterface";

// State shape
interface PodcastState {
  podcasts: PodcastInterface[];
}

const initialState: PodcastState = {
  podcasts: [],
};

const podcastSlice = createSlice({
  name: "podcast",
  initialState,
  reducers: {
    // ✅ Add new podcast
    addPodcast: (state, action: PayloadAction<PodcastInterface>) => {
      state.podcasts.push(action.payload);
    },

    // ✅ Set all fetched podcasts
    setPodcasts: (state, action: PayloadAction<PodcastInterface[]>) => {
      state.podcasts = action.payload;
    },

    // ✅ Append podcasts (for pagination - prevents duplicates)
    appendPodcasts: (state, action: PayloadAction<PodcastInterface[]>) => {
      const newPodcasts = action.payload;
      const existingIds = new Set(state.podcasts.map(p => p._id));
      // Only add podcasts that don't already exist
      const uniqueNewPodcasts = newPodcasts.filter(p => p._id && !existingIds.has(p._id));
      state.podcasts = [...state.podcasts, ...uniqueNewPodcasts];
    },

    // ✅ Update a podcast (replace with new data)
    updatePodcast: (state, action: PayloadAction<PodcastInterface>) => {
      const index = state.podcasts.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.podcasts[index] = action.payload;
      }
    },

    // ✅ Remove podcast by ID
    removePodcast: (state, action: PayloadAction<string>) => {
      state.podcasts = state.podcasts.filter((p) => p._id !== action.payload);
    },

    // ✅ Add a comment to a podcast
    addComment: (
      state,
      action: PayloadAction<PodcastUpdateCallArgumentsInterface>
    ) => {
      const { podcastId, userName, comment } = action.payload;
      const podcast = state.podcasts.find((p) => p._id === podcastId);

      if (podcast && comment) {
        podcast.interactions.push({
          comment,
          userName,
          userId: action.payload.userName, // replace if you have actual userId
        });
      }
    },

    // ✅ Toggle like/unlike
    toggleLike: (
      state,
      action: PayloadAction<{ podcastId: string; userId: string }>
    ) => {
      const { podcastId, userId } = action.payload;
      const podcast = state.podcasts.find((p) => p._id === podcastId);

      if (podcast) {
        const likeIndex = podcast.likes.indexOf(userId);
        if (likeIndex > -1) {
          // Unlike
          podcast.likes.splice(likeIndex, 1);
        } else {
          // Like
          podcast.likes.push(userId);
        }
      }
    },

    // ✅ Clear all podcasts
    clearPodcasts: (state) => {
      state.podcasts = [];
    },
  },
});

export const {
  addPodcast,
  setPodcasts,
  appendPodcasts,
  updatePodcast,
  removePodcast,
  addComment,
  toggleLike,
  clearPodcasts,
} = podcastSlice.actions;

export default podcastSlice.reducer;
