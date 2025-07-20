import { config } from "../shared/config";

import { fetchWrapper } from "../helpers/fetchWrapper";
import {
  GetProductQueryParams,
  Product,
} from "../interfaces/ecommerceInterface";

const baseUrl = `${config.apiUrl}/api`;

//// Exporting the functions of accountService------------------------------------------------------------/
export const ecommerceService = {
  getEcommerceProductsBasedOnCategory,
  getCategories,

  getProducts,
};

//// Function for getting all the Products
async function getProducts(): Promise<{
  message: String;
  data: [];
  success: boolean;
  pagination: any;
}> {
  try {
    const query = new URLSearchParams();
    let active = true;
    query.append("isActive", String(active));

    const response = await fetchWrapper.get(
      `${baseUrl}/get-product?${query.toString()}`
    );

    return response;
  } catch (error: any) {
    throw new Error("Error fetching products: " + error.message);
  }
}

///// Function for getting all the prodcuts based on category--------/

export async function getEcommerceProductsBasedOnCategory(): Promise<{
  message: string;
  data: Product[];
  success: boolean;
}> {
  try {
    const query = new URLSearchParams();
    let active = true;
    query.append("isActive", String(active));

    const response = await fetchWrapper.get(
      `${baseUrl}/products?${query.toString()}`
    );

    return response;
  } catch (error: any) {
    throw new Error("Error fetching products: " + error.message);
  }
}

///// Function for getting all the categories--------/

export async function getCategories(
  params: GetProductQueryParams
): Promise<any> {
  try {
    const query = new URLSearchParams();

    let active = true;
    query.append("isActive", String(active));

    const response = await fetchWrapper.get(
      `${baseUrl}/get-productcategory?${query.toString()}`
    );

    return response;
  } catch (error: any) {
    throw new Error("Error fetching products: " + error.message);
  }
}
