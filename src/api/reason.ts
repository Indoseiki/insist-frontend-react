import { Result } from "../types/pagination";
import { Reason, ReasonParams, ReasonRequest } from "../types/reason";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/admin/master/reason";

const getReasons = async (
  params: ReasonParams
): Promise<ApiResponse<Result<Reason[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Reason[]>>>(url, {
    params,
  });
  return response.data;
};

const createReason = async (
  params: ReasonRequest
): Promise<ApiResponse<Reason>> => {
  const response = await apiClient.post<ApiResponse<Reason>>(url, params);
  return response.data;
};

const updateReason = async (
  id: number,
  params: ReasonRequest
): Promise<ApiResponse<ReasonRequest>> => {
  const response = await apiClient.put<ApiResponse<ReasonRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteReason = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getReasons, createReason, updateReason, deleteReason };
