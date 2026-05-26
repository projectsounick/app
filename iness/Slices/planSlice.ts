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

function hasManualPlanExpired(endDate?: string) {
  if (!endDate) {
    return false;
  }

  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedEndDate.getTime())) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedEndDate.setHours(0, 0, 0, 0);

  return parsedEndDate < today;
}

function isEligibleManualPlan(
  plan?: ActiveManualWorkoutPlanInterface | null
) {
  if (!plan || plan.isActive !== true) {
    return false;
  }

  if (!plan.workoutPlanId || plan.workoutPlanId.isActive !== true) {
    return false;
  }

  return !hasManualPlanExpired(plan.endDate);
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
      if (!action.payload || action.payload.length === 0) {
        state.activeManualPlan = null;
        return;
      }

      const nextActiveManualPlan =
        action.payload.find((plan) => isEligibleManualPlan(plan)) || null;

      if (nextActiveManualPlan) {
        state.activeManualPlan = nextActiveManualPlan;
      } else {
        console.warn(
          "⚠️ Skipped setting manual plan — assignment is inactive, expired, or linked workout plan is inactive."
        );
        state.activeManualPlan = null;
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
