import { TaxCode, TaxCodeParams } from "../types/taxCode";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/acf/master/tax-code";

const getTaxCodes = async (
  params: TaxCodeParams
): Promise<ApiResponse<Result<TaxCode[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<TaxCode[]>>>(url, {
    params,
  });
  return response.data;
};

const createTaxCode = async (
  params: Partial<TaxCode>
): Promise<ApiResponse<TaxCode>> => {
  const response = await apiClient.post<ApiResponse<TaxCode>>(url, params);
  return response.data;
};

const updateTaxCode = async (
  id: number,
  params: Partial<TaxCode>
): Promise<ApiResponse<Partial<TaxCode>>> => {
  const response = await apiClient.put<ApiResponse<Partial<TaxCode>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteTaxCode = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export { getTaxCodes, createTaxCode, updateTaxCode, deleteTaxCode };
