import { Item, ItemParams } from "../types/item";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/generate";

const getItems = async (
  params: ItemParams
): Promise<ApiResponse<Result<Item[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Item[]>>>(url, {
    params,
  });
  return response.data;
};

const getItem = async (param: string): Promise<ApiResponse<Item>> => {
  const response = await apiClient.get<ApiResponse<Item>>(`${url}/${param}`);
  return response.data;
};

const createItem = async (
  params: Partial<Item>
): Promise<ApiResponse<Item>> => {
  const response = await apiClient.post<ApiResponse<Item>>(url, params);
  return response.data;
};

const updateItem = async (
  id: number,
  params: Partial<Item>
): Promise<ApiResponse<Partial<Item>>> => {
  const response = await apiClient.put<ApiResponse<Partial<Item>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItem = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getItems, getItem, createItem, updateItem, deleteItem };
