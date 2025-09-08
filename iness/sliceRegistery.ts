import { setMediaItems } from "./Slices/mediaSlice";
import {
  setActiveManualPlan,
  setActivePlans,
  setPlans,
  setServices,
} from "./Slices/planSlice";
import { setCart } from "./Slices/cartSlice";
import { setdietPlans } from "./Slices/dietPlanSlice";
import { addToBlog } from "./Slices/blogSlice";
import { setCategories, setProducts } from "./Slices/ecomSlice";
import { setCurrentDateTrackData } from "./Slices/trackSlice";
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
  blogs: {
    selectorKey: "blogs",
    setAction: addToBlog,
  },
  activeManualPlan: {
    selectorKey: "plans",
    setAction: setActiveManualPlan,
  },
  categories: {
    selectorKey: "ecom",
    setAction: setCategories,
  },
  products: {
    selectorKey: "ecom",
    setAction: setProducts,
  },
  track: {
    selectorKey: "tracking",
    setAction: setCurrentDateTrackData,
  },
  activeServices: {
    selectorKey: "plans",
    setAction: setServices,
  },
} as const;

export type SliceKey = keyof typeof sliceConfig;
