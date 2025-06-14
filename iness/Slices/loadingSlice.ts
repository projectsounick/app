import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface loaderState {
  mainLoader: boolean;
}
const initialState: loaderState = {
  mainLoader: false,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setMainLoader: (state, action: PayloadAction<any>) => {
      state.mainLoader = action.payload;
    },
  },
});

export const { setMainLoader } = loadingSlice.actions;

export default loadingSlice.reducer;
