import { DietPlan } from "@/app/interfaces/planInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface dietPlanState {
  dietPlans: DietPlan[];
}

const initialState: dietPlanState = {
  dietPlans: [],
};

const dietPlanSlice = createSlice({
  name: "dietPlan",
  initialState,
  reducers: {
    setdietPlans: (state, action: PayloadAction<any[]>) => {
      /// when diet plan price is null it means it is related to main plan not to show individually--/
      let finalDietPlan = [];

      if (action.payload && action.payload.length > 0) {
        for (let i = 0; i <= action.payload.length - 1; i++) {
          let dietPlan = action.payload[i];

          if (dietPlan.price) {
            finalDietPlan.push(dietPlan);
          }
        }
      }

      state.dietPlans = finalDietPlan;
    },
  },
});

export const { setdietPlans } = dietPlanSlice.actions;
export default dietPlanSlice.reducer;
