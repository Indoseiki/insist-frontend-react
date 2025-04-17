import { ItemInfor, ItemInforParams } from "../types/itemInfor";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/infor/master/item";

const getItemInfors = async (
  params: ItemInforParams
): Promise<ApiResponse<Result<ItemInfor[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemInfor[]>>>(url, {
    params,
  });
  return response.data;
};

export { getItemInfors };
