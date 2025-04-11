import {
  ItemProductType,
  ItemProductTypeParams,
} from "../types/itemProductType";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/product-type";

const getItemProductTypes = async (
  params: ItemProductTypeParams
): Promise<ApiResponse<Result<ItemProductType[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemProductType[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createItemProductType = async (
  params: Partial<ItemProductType>
): Promise<ApiResponse<ItemProductType>> => {
  const response = await apiClient.post<ApiResponse<ItemProductType>>(
    url,
    params
  );
  return response.data;
};

const updateItemProductType = async (
  id: number,
  params: Partial<ItemProductType>
): Promise<ApiResponse<Partial<ItemProductType>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemProductType>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemProductType = async (
  id: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemProductTypes,
  createItemProductType,
  updateItemProductType,
  deleteItemProductType,
};
