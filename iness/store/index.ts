import { configureStore } from "@reduxjs/toolkit";

import mediaReducer from "../Slices/mediaSlice";
import trackReducer from "../Slices/trackSlice";
import planReducer from "../Slices/planSlice";
import cartReducer from "../Slices/cartSlice";
import dietPlanReducer from "../Slices/dietPlanSlice";
export const store = configureStore({
  reducer: {
    media: mediaReducer,
    track: trackReducer,
    plan: planReducer,
    cart: cartReducer,
    dietPlan: dietPlanReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
