import { configureStore, combineReducers } from "@reduxjs/toolkit";

import mediaReducer from "../Slices/mediaSlice";
import trackReducer from "../Slices/trackSlice";
import planReducer from "../Slices/planSlice";
import cartReducer from "../Slices/cartSlice";
import dietPlanReducer from "../Slices/dietPlanSlice";
import loaderReducer from "../Slices/loadingSlice";
import blogReducer from "../Slices/blogSlice";
import ecoReducer from "../Slices/ecomSlice";
import componentOpenReducer from "../Slices/componentOpenSlice";
import podcastReducer from "../Slices/podcastSlice";
import sessionReducer from "../Slices/Session";
import streakReducer from "../Slices/streakSlice";
// combine all reducers first
const appReducer = combineReducers({
  media: mediaReducer,
  track: trackReducer,
  plan: planReducer,
  cart: cartReducer,
  dietPlan: dietPlanReducer,
  loader: loaderReducer,
  blog: blogReducer,
  ecom: ecoReducer,
  streak: streakReducer,
  podcast: podcastReducer,
  componentOpen: componentOpenReducer,
  session: sessionReducer,
});

// root reducer that resets state on logout
const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_STORE") {
    state = undefined; // clears all slices
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
