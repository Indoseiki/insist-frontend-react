import { ItemSource, ItemSourceParams } from "../types/itemSource";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/source";

const getItemSources = async (
  params: ItemSourceParams
): Promise<ApiResponse<Result<ItemSource[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemSource[]>>>(url, {
    params,
  });
  return response.data;
};

const createItemSource = async (
  params: Partial<ItemSource>
): Promise<ApiResponse<ItemSource>> => {
  const response = await apiClient.post<ApiResponse<ItemSource>>(url, params);
  return response.data;
};

const updateItemSource = async (
  id: number,
  params: Partial<ItemSource>
): Promise<ApiResponse<Partial<ItemSource>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemSource>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemSource = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getItemSources, createItemSource, updateItemSource, deleteItemSource };
