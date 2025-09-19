import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { act } from "react";

interface ComponentOpenSlice {
  calendarSheetOpen: boolean;
}

const initialState: ComponentOpenSlice = {
  calendarSheetOpen: false,
};

const componentOpenSlice = createSlice({
  name: "componentOpen",
  initialState,
  reducers: {
    setCalendarSheetOpen: (state, action: PayloadAction<boolean>) => {
      /// when diet plan price is null it means it is related to main plan not to show individually--/
      state.calendarSheetOpen = action.payload;
    },
  },
});

export const { setCalendarSheetOpen } = componentOpenSlice.actions;
export default componentOpenSlice.reducer;
