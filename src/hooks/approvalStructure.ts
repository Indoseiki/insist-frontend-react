import { useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Menu } from "../types/menu";
import {
  ApprovalStructureByMenuParams,
  ApprovalStructureParams,
  ViewApprovalStructure,
} from "../types/approvalStructure";
import {
  createApproval,
  deleteApproval,
  getApprovalByMenu,
  getApprovalStructures,
  getApprovalStructuresByMenu,
  getApprovalUsersByApproval,
  updateApproval,
  updateApprovalUsers,
} from "../api/approvalStructure";
import { Approval, ApprovalRequest } from "../types/approval";
import { ApprovalUser, ApprovalUserRequest } from "../types/approvalUser";

const useApprovalStructuresQuery = (params: ApprovalStructureParams) => {
  return useQuery<ApiResponse<Result<Menu[]>>, Error>({
    queryKey: ["ApprovalStructures", params],
    queryFn: () => getApprovalStructures(params),
  });
};

const useApprovalStructuresByMenuQuery = (
  id: number,
  params: ApprovalStructureByMenuParams
) => {
  return useQuery<ApiResponse<ViewApprovalStructure[]>, Error>({
    queryKey: ["ApprovalStructures", params],
    queryFn: () => getApprovalStructuresByMenu(id, params),
    enabled: !!params.path,
  });
};

const useApprovalByMenuQuery = (idMenu: number) => {
  return useQuery<ApiResponse<Approval[]>, Error>({
    queryKey: ["ApprovalByMenu", idMenu],
    queryFn: () => getApprovalByMenu(idMenu),
    enabled: !!idMenu,
  });
};

const useCreateApproval = () => {
  return useMutation<ApiResponse<null>, Error, ApprovalRequest>({
    mutationFn: createApproval,
  });
};

const useUpdateApproval = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; params: ApprovalRequest }
  >({
    mutationFn: ({ id, params }) => updateApproval(id, params),
  });
};

const useDeleteApproval = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteApproval(id),
  });
};

const useApprovalUsersByApprovalQuery = (idApproval: number) => {
  return useQuery<ApiResponse<ApprovalUser[]>, Error>({
    queryKey: ["ApprovalusersByApproval", idApproval],
    queryFn: () => getApprovalUsersByApproval(idApproval),
    enabled: !!idApproval,
  });
};

const useUpdateApprovalUsers = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; params: ApprovalUserRequest }
  >({
    mutationFn: ({ id, params }) => updateApprovalUsers(id, params),
  });
};

export {
  useApprovalStructuresQuery,
  useApprovalStructuresByMenuQuery,
  useApprovalByMenuQuery,
  useCreateApproval,
  useUpdateApproval,
  useDeleteApproval,
  useApprovalUsersByApprovalQuery,
  useUpdateApprovalUsers,
};
