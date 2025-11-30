import { CartItem, RawCartItem } from "@/app/interfaces/cartInterface";
import { Product } from "@/app/interfaces/ecommerceInterface";
import { Service } from "@/app/interfaces/otherInterfaces";
import { DietPlan, PlanInterface } from "@/app/interfaces/planInterface";

//// function for converting selected plan product to cart item structure -----------/
export function convertToCartItem(
  plan: any,
  type: string,
  planItemId: string
): CartItem | null {
  if (!plan) {
    return null;
  }
  if (type === "plan") {
    // Find the matching plan item
    const selectedPlanItem = plan?.planItems.find(
      (item: any) => item._id === planItemId
    );

    if (!selectedPlanItem) return null;

    // Construct cart item
    const cartItem: CartItem = {
      name: plan.title,
      price: selectedPlanItem.price,
      type,
      imgUrl: plan.imgUrl,
      plan: {
        planId: plan._id,
        planItemId: planItemId,
      },
      quantity: 1,
    };

    return cartItem;
  } else {
    let finalData: DietPlan = plan;
    // Construct cart item
    const cartItem: CartItem = {
      name: finalData.title,
      price: finalData.price,
      type,
      imgUrl: finalData.imgUrl,
      dietPlanId: finalData._id,
      quantity: 1,
    };

    return cartItem;
  }
}
export function convertToServiceCartItem(
  service: Service,
  cartData: any
): CartItem | null {
  if (!service || !cartData?.serviceId) return null;

  const cartItem: CartItem = {
    name: service.title,
    price: service.price, // assuming services have a direct price field
    type: "service",
    imgUrl: service.imgUrl ?? null, // first service image or empty

    serviceId: cartData.serviceId,

    quantity: cartData.quantity || 1,
  };

  return cartItem;
}
export function convertToProductCartItem(
  product: Product,
  variationId: any
): CartItem | null {
  if (!product || !variationId || !product.variations) return null;

  const selectedVariation = product.variations.find(
    (v) => v._id === variationId
  );

  if (!selectedVariation) return null;

  const cartItem: CartItem = {
    name: product.name,
    price: selectedVariation.price,
    type: "product",
    imgUrl: product.images?.[0] || "", // Use first image or empty string
    product: {
      productId: product._id,
      variationId: selectedVariation._id,
    },
    quantity: 1,
  };

  return cartItem;
}

//// Function for checking whether the plan or session exists in cart already -------/
export function isProductAddableToCart(
  cartItems: CartItem[],
  planItemId: string,
  planId: string | undefined
): boolean {
  return cartItems.some(
    (item) =>
      item.plan?.planItemId === planItemId || item.plan?.planId === planId
  );
}
export function isEcomProductAddableToCart(
  cartItems: CartItem[],
  productId: string,
  variationId: any
): boolean {
  return cartItems.some(
    (item) =>
      item.product?.productId === productId &&
      item.product.variationId === variationId
  );
}
export function isServiceAddableToCart(
  cartItems: CartItem[],
  serviceId: string
): boolean {
  return cartItems.some((item) => item.serviceId === serviceId);
}

//// Function for formatting the fetch cartitems ------------------------------/
export function formateFetchedCartItems(cartItems: RawCartItem[]): CartItem[] {
  const formattedCartItems: CartItem[] = [];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];

    const plan = item.plan;
    const dietPlanDetails = item.dietPlanDetails;
    const product: any = item.product;

    if (plan && plan.planItem) {
      const selectedPlanItem = plan.planItem;

      const cartItem: CartItem = {
        _id: item._id,
        name: plan.title,
        price: selectedPlanItem.price,
        type: "plan",
        imgUrl: plan.imgUrl,
        quantity: item.quantity,
        plan: {
          planId: plan._id,
          planItemId: selectedPlanItem._id,
        },
        isDeleted: item.isDeleted ?? false,
      };

      formattedCartItems.push(cartItem);
    } else if (dietPlanDetails) {
      const cartItem: CartItem = {
        _id: item._id,
        name: dietPlanDetails.title,
        price: typeof dietPlanDetails.price === 'number' ? dietPlanDetails.price : 0,
        type: "dietPlan",
        imgUrl: dietPlanDetails.imgUrl,
        quantity: item.quantity,
        dietPlanId: dietPlanDetails._id,
        isDeleted: item.isDeleted ?? false,
      };
      formattedCartItems.push(cartItem);
    } else if (product) {
      const selectedVariation = product.variation;

      const cartItem: CartItem = {
        _id: item._id,
        name: product.name,
        price: selectedVariation?.price ?? product.basePrice ?? 0,
        type: "product",
        imgUrl: product.images?.[0] ?? "",
        quantity: item.quantity,
        product: {
          productId: product._id,
          variationId: selectedVariation?._id ?? null,
        },
        isDeleted: item.isDeleted ?? false,
      };
      formattedCartItems.push(cartItem);
    }
  }

  return formattedCartItems;
}
