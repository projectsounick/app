import { ApiResponseInterface } from "../interfaces/otherInterfaces";
import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";
import { ChatMessage } from "../interfaces/chatInterface";
import { AddCartItemsApiCallInterface } from "../interfaces/cartInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
const baseUrl = `${config.apiUrl}/api`;
///// Exporting cartService functions --------------------------------------/
export const cartService = {
  getCartItems,
  addCartItems,
  deleteCartItems,
  updateCartItems,
  getPhonePeUrl,
  getOrderStatus,
  applyDiscountCoupon,
};

//// Funciton for updating the user in using backend then storing in AsyncStorage----/
async function getCartItems(): Promise<ApiResponseInterface> {
  try {
    const loggedUser =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    if (!loggedUser.exists) {
      throw new Error("Some error has happened,try again");
    }
    let userId = loggedUser.data._id;
    let isDeleted = false;
    return fetchWrapper.get(
      `${baseUrl}/get-cart?userId=${userId}&isDeleted=${isDeleted}`
    );
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

//// Funciton for deleting the cart items
async function deleteCartItems(
  cartItemId: string
): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.delete(`${baseUrl}/delete-cart/${cartItemId}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function addCartItems(data: any): Promise<ApiResponseInterface> {
  try {
    return fetchWrapper.post(`${baseUrl}/add-cart`, { ...data });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

async function updateCartItems(data: any): Promise<ApiResponseInterface> {
  try {
    let action = data.action;
    return fetchWrapper.put(`${baseUrl}/update-cart/${data.cartItemId}`, {
      action,
    });
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

//// Funciton for checking out the user cart details and getting the phonepe url ---------------/
async function getPhonePeUrl(data: any) {
  return fetchWrapper.post(`${baseUrl}/checkout-cartv2`, { ...data });
}

//// funciton for getting the order status -----------------------------------/
async function getOrderStatus(orderId: any) {
  try {
    return fetchWrapper.get(`${baseUrl}/get-order-status/${orderId}`);
  } catch (error: any) {
    throw new Error("Error updating user: " + error.message);
  }
}

///// Function for applying the discount coupon --------------------------------.
async function applyDiscountCoupon(couponCode: string) {
  return fetchWrapper.post(
    `${baseUrl}/apply-discount-coupon/${couponCode}`,
    {}
  );
}
