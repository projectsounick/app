import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ComponentOpenSlice {
  calendarSheetOpen: boolean;
  /** When opening calendar from a session card, pass date (YYYY-MM-DD) to open directly to that day's sessions */
  calendarInitialDate: string | null;
}

const initialState: ComponentOpenSlice = {
  calendarSheetOpen: false,
  calendarInitialDate: null,
};

const componentOpenSlice = createSlice({
  name: "componentOpen",
  initialState,
  reducers: {
    setCalendarSheetOpen: (state, action: PayloadAction<boolean>) => {
      state.calendarSheetOpen = action.payload;
      if (!action.payload) state.calendarInitialDate = null;
    },
    setCalendarInitialDate: (state, action: PayloadAction<string | null>) => {
      state.calendarInitialDate = action.payload;
    },
  },
});

export const { setCalendarSheetOpen, setCalendarInitialDate } = componentOpenSlice.actions;
export default componentOpenSlice.reducer;
