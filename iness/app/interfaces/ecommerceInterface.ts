import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject } from "react";

// interfaces/categoryInterface.ts
export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  category: string;
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
  bottomSheetRef: RefObject<BottomSheetModal>; // Replace with appropriate type if using another sheet
  onClose: () => void;
}
