import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { StreakInterface } from "@/app/interfaces/otherInterfaces";
import { createStreak } from "@/app/services/streaks.service";

interface StreakState {
  streakData: StreakInterface | null;
  totalStreak: number;
  loading: boolean;
  error: string | null;
  streakModalShow: boolean;
}

const initialState: StreakState = {
  streakData: null,
  totalStreak: 0,
  loading: false,
  error: null,
  streakModalShow: false,
};

// Async Thunk

export const streakSlice = createSlice({
  name: "streak",
  initialState,
  reducers: {
    setStreakData: (state, action: PayloadAction<StreakInterface | null>) => {
      state.streakData = action.payload;
      const oldState = state.totalStreak;
      state.totalStreak = action.payload?.totalStreak || 0;
      if (oldState !== state.totalStreak && !action.payload?.fetched) {
        state.streakModalShow = true;
      }
    },
    setTotalStreak: (state, action: PayloadAction<number>) => {
      state.totalStreak = action.payload;
    },
    setStreakModalShow: (state, action: PayloadAction<boolean>) => {
      state.streakModalShow = action.payload;
    },
  },
});

export const { setStreakData, setTotalStreak, setStreakModalShow } =
  streakSlice.actions;

export default streakSlice.reducer;
