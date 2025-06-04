interface PlanSideBarPropsInterface {
  selectedMenu: string;
  setSelectedMenu: (type: string) => void;
}
interface PlanType {
  _id: string;
  title: string;
  planTypeId: string;
  desc: string;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
interface PlanStoreInterface {
  planType: PlanType;
  plans: PlanInterface[];
  editing: { type: boolean; id: null | string };
  currentPlan: PlanInterface;
}
interface PlanTypesProps {
  handleEdit: (planType: PlanType) => void;
  handleDelete: (id: string) => void;
}
interface planState {
  plans: PlanInterface[];
}
interface PlanItemFormValues {
  _id: string;
  price: number;
  isOnline: boolean;
  isCorporate: boolean;
  duration: number;
  durationType: "day" | "week" | "month" | "year";
  sessionCount: number;
  isActive: boolean;
}

interface DietPlanDetails {
  _id: string;
  title: string;
  descItems: string[];
  duration: number;
  durationType: "day" | "week" | "month" | "year"; // assuming types
  imgUrl: string;
  isActive: boolean;
  price: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PlanInterface {
  _id?: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  planType: PlanType;
  isActive: boolean;
  planItems: PlanItemFormValues[];
  dietPlanDetails?: DietPlanDetails; // <-- added here
}
interface SinglePlanItemPlanInterface {
  _id?: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  planType: PlanType;
  isActive: boolean;
  planItems: PlanItemFormValues;
  dietPlanDetails?: DietPlanDetails; // <-- added here
}

interface DietPlan extends Document {
  _id: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  desc: string;
  duration: number;
  durationType: "day" | "week" | "month" | "year";
  price?: number; // optional
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
interface ActivePlans {
  _id: string;
  userId: string;
  trainerId?: string;
  isActive: boolean;
  planStartDate: string;
  planEndDate: string;
  totalSessions?: number;
  remainingSessions?: number;
  plan?: SinglePlanItemPlanInterface;
  dietPlanDetails?: DietPlan;
  createdAt?: string;
  updatedAt?: string;
}
export type {
  PlanSideBarPropsInterface,
  PlanType,
  PlanStoreInterface,
  DietPlanDetails,
  PlanTypesProps,
  planState,
  PlanItemFormValues,
  ActivePlans,
  PlanInterface,
  DietPlan,
};
