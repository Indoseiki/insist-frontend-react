import { ItemProcess, ItemProcessParams } from "../types/itemProcess";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/item/process";

const getItemProcesses = async (
  params: ItemProcessParams
): Promise<ApiResponse<Result<ItemProcess[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ItemProcess[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createItemProcess = async (
  params: Partial<ItemProcess>
): Promise<ApiResponse<ItemProcess>> => {
  const response = await apiClient.post<ApiResponse<ItemProcess>>(url, params);
  return response.data;
};

const updateItemProcess = async (
  id: number,
  params: Partial<ItemProcess>
): Promise<ApiResponse<Partial<ItemProcess>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ItemProcess>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteItemProcess = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getItemProcesses,
  createItemProcess,
  updateItemProcess,
  deleteItemProcess,
};
