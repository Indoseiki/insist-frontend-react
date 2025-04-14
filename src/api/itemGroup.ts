import { ItemGroup, ItemGroupParams } from "../types/itemGroup";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/group";

const getItemGroups = async (
  params: ItemGroupParams
): Promise<ApiResponse<Result<ItemGroup[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemGroup[]>>>(url, {
    params,
  });
  return response.data;
};

const createItemGroup = async (
  params: Partial<ItemGroup>
): Promise<ApiResponse<ItemGroup>> => {
  const response = await apiClient.post<ApiResponse<ItemGroup>>(url, params);
  return response.data;
};

const updateItemGroup = async (
  id: number,
  params: Partial<ItemGroup>
): Promise<ApiResponse<Partial<ItemGroup>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemGroup>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemGroup = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getItemGroups, createItemGroup, updateItemGroup, deleteItemGroup };
