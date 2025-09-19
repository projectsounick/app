import { configureStore } from "@reduxjs/toolkit";

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
export const store = configureStore({
  reducer: {
    media: mediaReducer,
    track: trackReducer,
    plan: planReducer,
    cart: cartReducer,
    dietPlan: dietPlanReducer,
    loader: loaderReducer,
    blog: blogReducer,
    ecom: ecoReducer,
    podcast: podcastReducer,
    componentOpen: componentOpenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
