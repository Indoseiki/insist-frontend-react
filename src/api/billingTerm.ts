import { BillingTerm, BillingTermParams } from "../types/billingTerm";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/general/master/billing-term";

const getBillingTerms = async (
  params: BillingTermParams
): Promise<ApiResponse<Result<BillingTerm[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<BillingTerm[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createBillingTerm = async (
  params: Partial<BillingTerm>
): Promise<ApiResponse<BillingTerm>> => {
  const response = await apiClient.post<ApiResponse<BillingTerm>>(url, params);
  return response.data;
};

const updateBillingTerm = async (
  id: number,
  params: Partial<BillingTerm>
): Promise<ApiResponse<Partial<BillingTerm>>> => {
  const response = await apiClient.put<ApiResponse<Partial<BillingTerm>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteBillingTerm = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getBillingTerms,
  createBillingTerm,
  updateBillingTerm,
  deleteBillingTerm,
};
