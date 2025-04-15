import { ItemSurface, ItemSurfaceParams } from "../types/itemSurface";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/surface";

const getItemSurfaces = async (
  params: ItemSurfaceParams
): Promise<ApiResponse<Result<ItemSurface[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemSurface[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createItemSurface = async (
  params: Partial<ItemSurface>
): Promise<ApiResponse<ItemSurface>> => {
  const response = await apiClient.post<ApiResponse<ItemSurface>>(url, params);
  return response.data;
};

const updateItemSurface = async (
  id: number,
  params: Partial<ItemSurface>
): Promise<ApiResponse<Partial<ItemSurface>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemSurface>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemSurface = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemSurfaces,
  createItemSurface,
  updateItemSurface,
  deleteItemSurface,
};
