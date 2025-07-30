import {
  CartItem,
  CartState,
  RawCartItem,
} from "@/app/interfaces/cartInterface";
import { formateFetchedCartItems } from "@/utils/cartUtils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { act } from "react";

const initialState: CartState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<any>) => {
      if (action.payload.product) {
        state.cartItems.push(action.payload);
      } else {
        const existingItem = state.cartItems.find(
          (item) => item.plan?.planItemId === action.payload.productId
        );

        if (existingItem) {
          existingItem.quantity += action.payload.quantity;
        } else {
          state.cartItems.push(action.payload);
        }
      }
    },
    // ✅ Store fetched cart
    setCart: (state, action: PayloadAction<RawCartItem[]>) => {
      const formattedCartItem = formateFetchedCartItems(action.payload);

      state.cartItems = formattedCartItem;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload
      );
    },
    deleteCartItem: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{
        cartItemId: string;
        action: string;
      }>
    ) => {
      const item = state.cartItems.find(
        (i) => i._id === action.payload.cartItemId
      );

      if (item) {
        if (action.payload.action === "increment") {
          item.quantity += 1;
        } else if (action.payload.action === "decrement" && item.quantity > 1) {
          item.quantity -= 1;
        }
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  setCart,
  clearCart,
  deleteCartItem,
} = cartSlice.actions;

export default cartSlice.reducer;
