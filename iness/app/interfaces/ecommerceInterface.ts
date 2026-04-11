import { RefObject } from "react";

// interfaces/categoryInterface.ts
export interface Category {
  _id: string; // ObjectId as string
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string; // or Date if parsed
  updatedAt: string; // or Date if parsed
  __v: number;
}

// interfaces/productInterface.ts
export type ProductVariationType = "none" | "size" | "color" | string;

export interface ProductVariation {
  _id: string;
  productId: string;
  label: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  category: Category;
  variationType: ProductVariationType;
  basePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variations?: ProductVariation[];
}
export interface GetProductQueryParams {
  isActive?: boolean;
  variationsStatus?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductFormValues {
  name: string;
  description: string;
  images: string[];
  isActive: boolean;
  variationType: any;
  category: string | null;
  basePrice?: number;

  variations: {
    label: string;
    price: number;
  }[];
}
export interface ProductBottomSheetProps {
  selectedProduct: Product;
  bgColor: string;
  bottomSheetRef: RefObject<unknown>;
  onClose: () => void;
}
