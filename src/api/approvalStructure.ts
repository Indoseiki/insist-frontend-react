import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Menu } from "../types/menu";
import { ApprovalStructureParams } from "../types/approvalStructure";
import apiClient from "./apiClient";
import { Approval, ApprovalRequest } from "../types/approval";
import { ApprovalUser, ApprovalUserRequest } from "../types/approvalUser";

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

const getApprovalByMenu = async (
  idMenu: number
): Promise<ApiResponse<Approval[]>> => {
  const response = await apiClient.get<ApiResponse<Approval[]>>(
    `${url}/${idMenu}/menu`
  );
  return response.data;
};

const createApproval = async (
  params: ApprovalRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(url, params);
  return response.data;
};

const updateApproval = async (
  id: number,
  params: ApprovalRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteApproval = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const getApprovalUsersByApproval = async (
  idApproval: number
): Promise<ApiResponse<ApprovalUser[]>> => {
  const response = await apiClient.get<ApiResponse<ApprovalUser[]>>(
    `${url}-user/${idApproval}/approval`
  );
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
  getApprovalByMenu,
  createApproval,
  updateApproval,
  deleteApproval,
  getApprovalUsersByApproval,
  updateApprovalUsers,
};
