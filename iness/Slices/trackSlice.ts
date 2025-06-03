import {
  TrackingData,
  UpdateTrackingPayload,
  TrackingState,
} from "@/app/interfaces/trackInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: TrackingState = {
  currentDateTrackData: {
    steps: null,
    sleep: null,
    water: null,
  },
  totalTrackData: [],
};

///// Slice for the tracking --------------------------------------------------------/
export const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    setCurrentDateTrackData(state, action: PayloadAction<TrackingData>) {
      state.currentDateTrackData = action.payload;
    },
    setTotalTrackData(state, action: PayloadAction<TrackingData[]>) {
      state.totalTrackData = action.payload;
    },
    updateTrackingField(state, action: PayloadAction<UpdateTrackingPayload>) {
      const { type, data } = action.payload;
      const id = (data as any)._id;

      // Update currentDateTrackData
      state.currentDateTrackData[type] = data as any;

      // Update or add to totalTrackData based on _id
      const index = state.totalTrackData.findIndex(
        (entry) => entry[type]?._id === id
      );

      if (index !== -1) {
        // Replace only the relevant type
        state.totalTrackData[index] = {
          ...state.totalTrackData[index],
          [type]: data as any,
        };
      } else {
        // Create a new entry with nulls for other types
        const newEntry: TrackingData = {
          steps: null,
          sleep: null,
          water: null,
          [type]: data as any,
        };
        state.totalTrackData.push(newEntry);
      }
    },
  },
});

export const {
  setCurrentDateTrackData,
  setTotalTrackData,
  updateTrackingField,
} = trackingSlice.actions;

export default trackingSlice.reducer;
