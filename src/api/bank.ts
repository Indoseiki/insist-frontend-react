import { Bank, BankParams } from "../types/bank";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/acf/master/bank";

const getBanks = async (
  params: BankParams
): Promise<ApiResponse<Result<Bank[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Bank[]>>>(url, {
    params,
  });
  return response.data;
};

const createBank = async (
  params: Partial<Bank>
): Promise<ApiResponse<Bank>> => {
  const response = await apiClient.post<ApiResponse<Bank>>(url, params);
  return response.data;
};

const updateBank = async (
  id: number,
  params: Partial<Bank>
): Promise<ApiResponse<Partial<Bank>>> => {
  const response = await apiClient.put<ApiResponse<Partial<Bank>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteBank = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getBanks, createBank, updateBank, deleteBank };
