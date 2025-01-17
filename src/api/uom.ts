import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { UoM, UoMParams, UoMRequest } from "../types/uom";
import apiClient from "./apiClient";

const url = "/egd/master/uom";

const getUoMs = async (
  params: UoMParams
): Promise<ApiResponse<Result<UoM[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<UoM[]>>>(url, {
    params,
  });
  return response.data;
};

const createUoM = async (params: UoMRequest): Promise<ApiResponse<UoM>> => {
  const response = await apiClient.post<ApiResponse<UoM>>(url, params);
  return response.data;
};

const updateUoM = async (
  id: number,
  params: UoMRequest
): Promise<ApiResponse<UoMRequest>> => {
  const response = await apiClient.put<ApiResponse<UoMRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteUoM = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getUoMs, createUoM, updateUoM, deleteUoM };
