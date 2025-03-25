import { ChartOfAccount, ChartOfAccountParams } from "../types/chartOfAccount";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/acf/master/chart-of-account";

const getChartOfAccounts = async (
  params: ChartOfAccountParams
): Promise<ApiResponse<Result<ChartOfAccount[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ChartOfAccount[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createChartOfAccount = async (
  params: Partial<ChartOfAccount>
): Promise<ApiResponse<ChartOfAccount>> => {
  const response = await apiClient.post<ApiResponse<ChartOfAccount>>(
    url,
    params
  );
  return response.data;
};

const updateChartOfAccount = async (
  id: number,
  params: Partial<ChartOfAccount>
): Promise<ApiResponse<Partial<ChartOfAccount>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ChartOfAccount>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteChartOfAccount = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
};
