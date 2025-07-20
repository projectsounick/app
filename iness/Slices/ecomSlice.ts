import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/app/interfaces/ecommerceInterface";
import { Product } from "@/app/interfaces/ecommerceInterface";
// Define initial state
interface CategoryProductState {
  categories: Category[];
  products: Product[];
}

const initialState: CategoryProductState = {
  categories: [],
  products: [],
};

const categoryProductSlice = createSlice({
  name: "ecom",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
  },
});

export const { setCategories, setProducts, addCategory, addProduct } =
  categoryProductSlice.actions;

export default categoryProductSlice.reducer;
