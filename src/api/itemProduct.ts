import { ItemProduct, ItemProductParams } from "../types/itemProduct";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/product";

const getItemProducts = async (
  params: ItemProductParams
): Promise<ApiResponse<Result<ItemProduct[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemProduct[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createItemProduct = async (
  params: Partial<ItemProduct>
): Promise<ApiResponse<ItemProduct>> => {
  const response = await apiClient.post<ApiResponse<ItemProduct>>(url, params);
  return response.data;
};

const updateItemProduct = async (
  id: number,
  params: Partial<ItemProduct>
): Promise<ApiResponse<Partial<ItemProduct>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemProduct>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemProduct = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemProducts,
  createItemProduct,
  updateItemProduct,
  deleteItemProduct,
};
