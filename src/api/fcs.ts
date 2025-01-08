import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { FCS, FCSParams, FCSRequest } from "../types/fcs";
import apiClient from "./apiClient";

const url = "/prd/master/fcs";

const getFCSs = async (
  params: FCSParams
): Promise<ApiResponse<Result<FCS[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<FCS[]>>>(url, {
    params,
  });
  return response.data;
};

const createFCS = async (params: FCSRequest): Promise<ApiResponse<FCS>> => {
  const response = await apiClient.post<ApiResponse<FCS>>(url, params);
  return response.data;
};

const updateFCS = async (
  id: number,
  params: FCSRequest
): Promise<ApiResponse<FCSRequest>> => {
  const response = await apiClient.put<ApiResponse<FCSRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteFCS = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getFCSs, createFCS, updateFCS, deleteFCS };
