import { Currency, CurrencyParams } from "../types/currency";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/acf/master/currency";

const getCurrencies = async (
  params: CurrencyParams
): Promise<ApiResponse<Result<Currency[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Currency[]>>>(url, {
    params,
  });
  return response.data;
};

const createCurrency = async (
  params: Partial<Currency>
): Promise<ApiResponse<Currency>> => {
  const response = await apiClient.post<ApiResponse<Currency>>(url, params);
  return response.data;
};

const updateCurrency = async (
  id: number,
  params: Partial<Currency>
): Promise<ApiResponse<Partial<Currency>>> => {
  const response = await apiClient.put<ApiResponse<Partial<Currency>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteCurrency = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const generateCurrency = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(`${url}-generate`);
  return response.data;
};

export {
  getCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  generateCurrency,
};
