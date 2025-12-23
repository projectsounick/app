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
      const startTime = performance.now();
      const { type, data } = action.payload;
      const id = (data as any)._id;

      console.log(`[trackSlice] updateTrackingField START - type: ${type}, id: ${id}`);

      // Update currentDateTrackData
      state.currentDateTrackData[type] = data as any;

      // Update or add to totalTrackData based on _id
      // Optimize: Only search if totalTrackData is not empty
      if (state.totalTrackData.length > 0) {
        const findStartTime = performance.now();
        const index = state.totalTrackData.findIndex(
          (entry) => entry[type]?._id === id
        );
        const findTime = performance.now() - findStartTime;
        console.log(`[trackSlice] findIndex took ${findTime.toFixed(2)}ms, array length: ${state.totalTrackData.length}`);

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
      } else {
        // If array is empty, just create new entry
        const newEntry: TrackingData = {
          steps: null,
          sleep: null,
          water: null,
          [type]: data as any,
        };
        state.totalTrackData.push(newEntry);
      }

      const totalTime = performance.now() - startTime;
      console.log(`[trackSlice] updateTrackingField completed in ${totalTime.toFixed(2)}ms`);
    },
  },
});

export const {
  setCurrentDateTrackData,
  setTotalTrackData,
  updateTrackingField,
} = trackingSlice.actions;

export default trackingSlice.reducer;
