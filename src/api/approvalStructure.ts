import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Menu } from "../types/menu";
import { ApprovalStructureParams } from "../types/approvalStructure";
import apiClient from "./apiClient";
import { ApprovalRequest } from "../types/approval";
import { ApprovalUserRequest } from "../types/approvalUser";

const url = "/admin/approval";

const getApprovalStructures = async (
  params: ApprovalStructureParams
): Promise<ApiResponse<Result<Menu[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Menu[]>>>(
    `${url}-structure`,
    {
      params,
    }
  );
  return response.data;
};

const createApproval = async (
  params: ApprovalRequest[]
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(url, params);
  return response.data;
};

const updateApproval = async (
  params: ApprovalRequest[]
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(url, params);
  return response.data;
};

const deleteApproval = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const updateApprovalUsers = async (
  id: number,
  params: ApprovalUserRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}-user/${id}`,
    params
  );
  return response.data;
};

export {
  getApprovalStructures,
  createApproval,
  updateApproval,
  deleteApproval,
  updateApprovalUsers,
};
