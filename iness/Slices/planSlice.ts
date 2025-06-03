import { PlanInterface } from "@/app/interfaces/planInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface planState {
  plans: PlanInterface[];
  currentPlan: PlanInterface | null;
}

const initialState: planState = {
  plans: [],
  currentPlan: null,
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<any[]>) => {
      state.plans = action.payload;
    },
    setCurrentPlan: (state, action: PayloadAction<any>) => {
      state.currentPlan = action.payload;
    },
  },
});

export const { setPlans, setCurrentPlan } = planSlice.actions;
export default planSlice.reducer;
