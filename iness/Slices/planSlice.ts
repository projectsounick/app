import {
  ActiveManualWorkoutPlanInterface,
  WorkoutPlanInterface,
} from "@/app/interfaces/activeManualPlan";
import { PlanInterface } from "@/app/interfaces/planInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface planState {
  plans: PlanInterface[];
  currentPlan: PlanInterface | null;
  planTab: string | null;
  activePlans: any[];
  completedPlans: any[];
  activeManualPlan: ActiveManualWorkoutPlanInterface | null;
}

const initialState: planState = {
  plans: [],
  currentPlan: null,
  planTab: "current",
  activePlans: [],
  completedPlans: [],
  activeManualPlan: null,
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
    setActiveManualPlan: (
      state,
      action: PayloadAction<ActiveManualWorkoutPlanInterface[]>
    ) => {
      if (action.payload && action.payload.length > 0) {
        const { endDate } = action.payload[0];

        const today = new Date();
        const end = new Date(endDate);

        // Check if the end date is today or in the future
        if (end >= today) {
          state.activeManualPlan = action.payload[0];
        } else {
          console.warn("⚠️ Skipped setting plan — End date has passed.");
          state.activeManualPlan = null;
        }
      }
    },
  },
});

export const {
  setPlans,
  setCurrentPlan,
  setPlanTab,
  setActivePlans,
  setActiveManualPlan,
} = planSlice.actions;
export default planSlice.reducer;
