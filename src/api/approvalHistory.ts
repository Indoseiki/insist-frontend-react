import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ApprovalHistory,
  ApprovalHistoryParams,
} from "../types/approvalHistory";
import apiClient from "./apiClient";

const url = "/admin/approval-history";

const getApprovalHistorys = async (
  params: ApprovalHistoryParams
): Promise<ApiResponse<Result<ApprovalHistory[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ApprovalHistory[]>>>(
    url,
    {
      params,
    }
  );
  return response.data;
};

const createApprovalHistory = async (
  params: Partial<ApprovalHistory>
): Promise<ApiResponse<ApprovalHistory>> => {
  const response = await apiClient.post<ApiResponse<ApprovalHistory>>(
    url,
    params
  );
  return response.data;
};

const updateApprovalHistory = async (
  id: number,
  params: Partial<ApprovalHistory>
): Promise<ApiResponse<Partial<ApprovalHistory>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ApprovalHistory>>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteApprovalHistory = async (
  id: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

export {
  getApprovalHistorys,
  createApprovalHistory,
  updateApprovalHistory,
  deleteApprovalHistory,
};
