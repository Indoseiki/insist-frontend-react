import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  ApprovalHistory,
  ApprovalHistoryByRefParams,
  ApprovalHistoryParams,
  ViewApprovalNotification,
} from "../types/approvalHistory";
import {
  createApprovalHistory,
  deleteApprovalHistory,
  getApprovalHistories,
  getApprovalHistoriesByRef,
  getApprovalNotifications,
  updateApprovalHistory,
} from "../api/approvalHistory";

const useApprovalHistoriesQuery = (params: ApprovalHistoryParams) => {
  return useQuery<ApiResponse<Result<ApprovalHistory[]>>, Error>({
    queryKey: ["ApprovalHistories", params],
    queryFn: () => getApprovalHistories(params),
  });
};

const useApprovalHistoriesByrefQuery = (
  id: number,
  params: ApprovalHistoryByRefParams
) => {
  return useQuery<ApiResponse<ApprovalHistory[]>, Error>({
    queryKey: ["ApprovalHistoriesByRef", id, params],
    queryFn: () => getApprovalHistoriesByRef(id, params),
    enabled: !!id && !!params.ref_table,
  });
};

const useApprovalHistoriesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ApprovalHistory[]>>, Error>({
    queryKey: ["InfinityApprovalHistories", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getApprovalHistories({
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

const useApprovalNotificationQuery = () => {
  return useQuery<ApiResponse<ViewApprovalNotification[]>, Error>({
    queryKey: ["ApprovalNotification"],
    queryFn: () => getApprovalNotifications(),
    refetchInterval: 5000,
  });
};

export {
  useApprovalHistoriesQuery,
  useApprovalHistoriesByrefQuery,
  useApprovalHistoriesInfinityQuery,
  useCreateApprovalHistory,
  useUpdateApprovalHistory,
  useDeleteApprovalHistory,
  useApprovalNotificationQuery,
};
