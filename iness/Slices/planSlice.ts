import { PlanInterface } from "@/app/interfaces/planInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface planState {
  plans: PlanInterface[];
  currentPlan: PlanInterface | null;
  planTab: string | null;
  activePlans: any[];
  completedPlans: any[];
}

const initialState: planState = {
  plans: [],
  currentPlan: null,
  planTab: "current",
  activePlans: [],
  completedPlans: [],
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
    setPlanTab: (state, action: PayloadAction<any>) => {
      state.planTab = action.payload;
    },
    setActivePlans: (state, action: PayloadAction<any>) => {
      state.activePlans = action.payload.filter(
        (plan: any) => plan.isActive === true
      );
      state.completedPlans = action.payload.filter(
        (plan: any) => plan.isActive === false
      );
    },
  },
});

export const { setPlans, setCurrentPlan, setPlanTab, setActivePlans } =
  planSlice.actions;
export default planSlice.reducer;
