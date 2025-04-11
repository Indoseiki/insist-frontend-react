import { ItemCategory, ItemCategoryParams } from "../types/itemCategory";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/category";

const getItemCategories = async (
  params: ItemCategoryParams
): Promise<ApiResponse<Result<ItemCategory[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemCategory[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const getItemCategory = async (
  param: string
): Promise<ApiResponse<ItemCategory>> => {
  const response = await apiClient.get<ApiResponse<ItemCategory>>(
    `${url}/${param}`
  );
  return response.data;
};

const createItemCategory = async (
  params: Partial<ItemCategory>
): Promise<ApiResponse<ItemCategory>> => {
  const response = await apiClient.post<ApiResponse<ItemCategory>>(url, params);
  return response.data;
};

const updateItemCategory = async (
  id: number,
  params: Partial<ItemCategory>
): Promise<ApiResponse<Partial<ItemCategory>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemCategory>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemCategory = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemCategories,
  getItemCategory,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
};
