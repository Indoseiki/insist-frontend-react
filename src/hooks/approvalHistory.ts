import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ApprovalHistory,
  ApprovalHistoryParams,
} from "../types/approvalHistory";
import {
  createApprovalHistory,
  deleteApprovalHistory,
  getApprovalHistorys,
  updateApprovalHistory,
} from "../api/approvalHistory";

const useApprovalHistorysQuery = (params: ApprovalHistoryParams) => {
  return useQuery<ApiResponse<Result<ApprovalHistory[]>>, Error>({
    queryKey: ["ApprovalHistorys", params],
    queryFn: () => getApprovalHistorys(params),
  });
};

const useApprovalHistorysInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ApprovalHistory[]>>, Error>({
    queryKey: ["InfinityApprovalHistorys", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getApprovalHistorys({
        page,
        rows: "10",
        search,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.pagination?.next_page ?? undefined;
    },
    initialPageParam: 1,
  });
};

const useCreateApprovalHistory = () => {
  return useMutation<
    ApiResponse<Partial<ApprovalHistory>>,
    Error,
    Partial<ApprovalHistory>
  >({
    mutationFn: createApprovalHistory,
  });
};

const useUpdateApprovalHistory = () => {
  return useMutation<
    ApiResponse<Partial<ApprovalHistory>>,
    Error,
    { id: number; params: Partial<ApprovalHistory> }
  >({
    mutationFn: ({ id, params }) => updateApprovalHistory(id, params),
  });
};

const useDeleteApprovalHistory = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteApprovalHistory(id),
  });
};

export {
  useApprovalHistorysQuery,
  useApprovalHistorysInfinityQuery,
  useCreateApprovalHistory,
  useUpdateApprovalHistory,
  useDeleteApprovalHistory,
};
