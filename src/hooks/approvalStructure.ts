import { useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Menu } from "../types/menu";
import { ApprovalStructureParams } from "../types/approvalStructure";
import {
  createApproval,
  deleteApproval,
  getApprovalStructures,
  updateApproval,
  updateApprovalUsers,
} from "../api/approvalStructure";
import { ApprovalRequest } from "../types/approval";
import { ApprovalUserRequest } from "../types/approvalUser";

const useApprovalStructuresQuery = (params: ApprovalStructureParams) => {
  return useQuery<ApiResponse<Result<Menu[]>>, Error>({
    queryKey: ["ApprovalStructures", params],
    queryFn: () => getApprovalStructures(params),
  });
};

const useCreateApproval = () => {
  return useMutation<ApiResponse<null>, Error, ApprovalRequest[]>({
    mutationFn: createApproval,
  });
};

const useUpdateApproval = () => {
  return useMutation<ApiResponse<null>, Error, ApprovalRequest[]>({
    mutationFn: updateApproval,
  });
};

const useDeleteApproval = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteApproval(id),
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
  useCreateApproval,
  useUpdateApproval,
  useDeleteApproval,
  useUpdateApprovalUsers,
};
