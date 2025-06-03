import { CartItem, RawCartItem } from "@/app/interfaces/cartInterface";
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

//// Function for formatting the fetch cartitems ------------------------------/
export function formateFetchedCartItems(cartItems: RawCartItem[]): CartItem[] {
  const formattedCartItems: CartItem[] = [];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const plan = item.plan;

    if (plan && plan.planItem) {
      const selectedPlanItem = plan.planItem;

      const cartItem: CartItem = {
        _id: item._id,
        name: plan.title,
        price: selectedPlanItem.price,
        type: "",
        imgUrl: plan.imgUrl,
        quantity: item.quantity,
        plan: {
          planId: plan._id,
          planItemId: selectedPlanItem._id,
        },
        isDeleted: item.isDeleted ? item.isDeleted : false,
      };

      formattedCartItems.push(cartItem);
    } else if (item.dietPlanDetails) {
      /// this is a diet plan ------------/
      let dietPlanDetails = item.dietPlanDetails;
      const cartItem: CartItem = {
        _id: item._id,
        name: dietPlanDetails.title,
        price: dietPlanDetails.price,
        type: "",
        imgUrl: dietPlanDetails.imgUrl,
        quantity: item.quantity,
        dietPlanId: dietPlanDetails._id,
        isDeleted: item.isDeleted ? item.isDeleted : false,
      };
      formattedCartItems.push(cartItem);
    }
  }

  return formattedCartItems;
}
