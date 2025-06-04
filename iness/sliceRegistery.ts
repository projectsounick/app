import { setMediaItems } from "./Slices/mediaSlice";
import { setActivePlans, setPlans } from "./Slices/planSlice";
import { setCart } from "./Slices/cartSlice";
import { setdietPlans } from "./Slices/dietPlanSlice";
export const sliceConfig = {
  media: {
    selectorKey: "mediaItems",
    setAction: setMediaItems,
  },
  plan: {
    selectorKey: "plans",
    setAction: setPlans,
  },
  cart: {
    selectorKey: "cart",
    setAction: setCart,
  },
  dietPlan: {
    selectorKey: "dietPlan",
    setAction: setdietPlans,
  },
  activePlans: {
    selectorKey: "plans",
    setAction: setActivePlans,
  },
} as const;

export type SliceKey = keyof typeof sliceConfig;
