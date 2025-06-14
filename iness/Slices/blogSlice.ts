import { Blog, BlogContent, BlogState } from "@/app/interfaces/blogInterface";
import {
  CartItem,
  CartState,
  RawCartItem,
} from "@/app/interfaces/cartInterface";
import { formateFetchedCartItems } from "@/utils/cartUtils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { act } from "react";

const initialState: BlogState = {
  blogs: [],
};

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    addToBlog: (state, action) => {
      state.blogs = action.payload;
    },
  },
});

export const { addToBlog } = blogSlice.actions;

export default blogSlice.reducer;
