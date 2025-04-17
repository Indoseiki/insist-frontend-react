import {
  ItemRawMaterial,
  ItemRawMaterialParams,
} from "../types/itemRawMaterial";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/generate-raw-material";

const getItemRawMaterials = async (
  params: ItemRawMaterialParams
): Promise<ApiResponse<Result<ItemRawMaterial[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemRawMaterial[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const getItemRawMaterial = async (
  param: string
): Promise<ApiResponse<ItemRawMaterial>> => {
  const response = await apiClient.get<ApiResponse<ItemRawMaterial>>(
    `${url}/${param}`
  );
  return response.data;
};

const createItemRawMaterial = async (
  params: Partial<ItemRawMaterial>
): Promise<ApiResponse<ItemRawMaterial>> => {
  const response = await apiClient.post<ApiResponse<ItemRawMaterial>>(
    url,
    params
  );
  return response.data;
};

const updateItemRawMaterial = async (
  id: number,
  params: Partial<ItemRawMaterial>
): Promise<ApiResponse<Partial<ItemRawMaterial>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemRawMaterial>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemRawMaterial = async (
  id: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemRawMaterials,
  getItemRawMaterial,
  createItemRawMaterial,
  updateItemRawMaterial,
  deleteItemRawMaterial,
};
