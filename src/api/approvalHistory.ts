import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ApprovalHistory,
  ApprovalHistoryByRefParams,
  ApprovalHistoryParams,
  ViewApprovalNotification,
} from "../types/approvalHistory";
import apiClient from "./apiClient";

const url = "/admin/approval";

const getApprovalHistories = async (
  params: ApprovalHistoryParams
): Promise<ApiResponse<Result<ApprovalHistory[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<ApprovalHistory[]>>>(
    `${url}-history`,
    {
      params,
    }
  );
  return response.data;
};

const getApprovalHistoriesByRef = async (
  id: number,
  params: ApprovalHistoryByRefParams
): Promise<ApiResponse<ApprovalHistory[]>> => {
  const response = await apiClient.get<ApiResponse<ApprovalHistory[]>>(
    `${url}-history/${id}/ref`,
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
    `${url}-history`,
    params
  );
  return response.data;
};

const updateApprovalHistory = async (
  id: number,
  params: Partial<ApprovalHistory>
): Promise<ApiResponse<Partial<ApprovalHistory>>> => {
  const response = await apiClient.put<ApiResponse<Partial<ApprovalHistory>>>(
    `${url}-history/${id}`,
    params
  );
  return response.data;
};

const deleteApprovalHistory = async (
  id: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `${url}-history/${id}`
  );
  return response.data;
};

const getApprovalNotifications = async (): Promise<
  ApiResponse<ViewApprovalNotification[]>
> => {
  const response = await apiClient.get<ApiResponse<ViewApprovalNotification[]>>(
    `${url}-notification`
  );
  return response.data;
};

export {
  getApprovalHistories,
  getApprovalHistoriesByRef,
  createApprovalHistory,
  updateApprovalHistory,
  deleteApprovalHistory,
  getApprovalNotifications,
};
