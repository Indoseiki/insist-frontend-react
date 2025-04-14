import { ItemGroupType, ItemGroupTypeParams } from "../types/itemGroupType";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/group-type";

const getItemGroupTypes = async (
  params: ItemGroupTypeParams
): Promise<ApiResponse<Result<ItemGroupType[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemGroupType[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createItemGroupType = async (
  params: Partial<ItemGroupType>
): Promise<ApiResponse<ItemGroupType>> => {
  const response = await apiClient.post<ApiResponse<ItemGroupType>>(
    url,
    params
  );
  return response.data;
};

const updateItemGroupType = async (
  id: number,
  params: Partial<ItemGroupType>
): Promise<ApiResponse<Partial<ItemGroupType>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemGroupType>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemGroupType = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemGroupTypes,
  createItemGroupType,
  updateItemGroupType,
  deleteItemGroupType,
};
