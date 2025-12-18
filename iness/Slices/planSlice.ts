import {
  ActiveManualWorkoutPlanInterface,
  WorkoutPlanInterface,
} from "@/app/interfaces/activeManualPlan";
import { PlanInterface } from "@/app/interfaces/planInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import {
  ServiceDetails,
  UserActiveServiceWithDetails,
} from "@/app/interfaces/serviceInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface planState {
  plans: PlanInterface[];
  currentPlan: PlanInterface | null;
  currentService: ServiceDetails | null;
  planTab: string | null;
  activePlans: any[];
  completedPlans: any[];
  activeManualPlan: ActiveManualWorkoutPlanInterface | null;
  // Add services state
  activeServices: UserActiveServiceWithDetails[];
  completedServices: UserActiveServiceWithDetails[];
  availableServices: any[];
}

const initialState: planState = {
  plans: [],
  currentPlan: null,
  currentService: null,
  planTab: "current",
  activePlans: [],
  completedPlans: [],
  activeManualPlan: null,
  activeServices: [],
  completedServices: [],
  availableServices: [],
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
    setCurrentService: (
      state,
      action: PayloadAction<ServiceDetails | null>
    ) => {
      state.currentService = action.payload;
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
    setServices: (state, action: PayloadAction<any[]>) => {


      state.activeServices = action.payload.filter(
        (service) => service.isActive === true
      );
      state.completedServices = action.payload.filter(
        (service) => service.isActive === false
      );
    },
    setAvailableServices: (state, action: PayloadAction<any[]>) => {
      state.availableServices = action.payload;
    },
  },
});

export const {
  setPlans,
  setCurrentPlan,
  setCurrentService,
  setPlanTab,
  setActivePlans,
  setActiveManualPlan,
  setServices,
  setAvailableServices,
} = planSlice.actions;
export default planSlice.reducer;
