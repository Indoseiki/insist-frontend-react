import { CurrencyRate, CurrencyRateParams } from "../types/currencyRate";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/acf/master/currency-rate";

const getCurrencyRates = async (
  params: CurrencyRateParams
): Promise<ApiResponse<Result<CurrencyRate[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<CurrencyRate[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createCurrencyRate = async (
  params: Partial<CurrencyRate>
): Promise<ApiResponse<CurrencyRate>> => {
  const response = await apiClient.post<ApiResponse<CurrencyRate>>(url, params);
  return response.data;
};

const updateCurrencyRate = async (
  id: number,
  params: Partial<CurrencyRate>
): Promise<ApiResponse<Partial<CurrencyRate>>> => {
  const response = await apiClient.put<ApiResponse<Partial<CurrencyRate>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteCurrencyRate = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getCurrencyRates,
  createCurrencyRate,
  updateCurrencyRate,
  deleteCurrencyRate,
};
