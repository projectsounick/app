interface CartItem {
  _id?: string;
  productId?: string;
  name: string;
  price: number | undefined;
  type: string;
  quantity: number;
  imgUrl: string;
  plan?: {
    planId?: string;
    planItemId?: string;
  };
  serviceId?: string;
  product?: {
    productId: string;
    variationId: string;
  };
  dietPlanId?: string;
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

interface RawCartItem {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isBought?: boolean;
  isDeleted?: boolean;
  quantity: number;
  plan?: {
    _id: string;
    title: string;
    imgUrl: string;
    planItem: {
      _id: string;
      price: number;
      type: string;
    };
  };
  product?: {};
  dietPlanDetails?: {
    _id: string;
    title: string;
    imgUrl: string;
    price: number;
    desc: string;
    descItems: string[];
    duration: number;
    durationType: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
interface AddCartItemsApiCallInterface {
  productId?: string;
  plan?: {
    planId: string | undefined;
    planItemId: string | undefined;
  };
  dietPlanId?: string;
  quantity?: number;
  product?: {
    productId: string;
    variationId: string;
  };
  serviceId?: string;
}

interface CartState {
  cartItems: CartItem[];
}

export type { CartItem, CartState, AddCartItemsApiCallInterface, RawCartItem };
