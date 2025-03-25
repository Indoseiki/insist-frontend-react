import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ChartOfAccount, ChartOfAccountParams } from "../types/chartOfAccount";
import {
  createChartOfAccount,
  deleteChartOfAccount,
  getChartOfAccounts,
  updateChartOfAccount,
} from "../api/chartOfAccount";

const useChartOfAccountsQuery = (params: ChartOfAccountParams) => {
  return useQuery<ApiResponse<Result<ChartOfAccount[]>>, Error>({
    queryKey: ["ChartOfAccounts", params],
    queryFn: () => getChartOfAccounts(params),
  });
};

const useChartOfAccountsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ChartOfAccount[]>>, Error>({
    queryKey: ["InfinityChartOfAccounts", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getChartOfAccounts({
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

const useCreateChartOfAccount = () => {
  return useMutation<
    ApiResponse<Partial<ChartOfAccount>>,
    Error,
    Partial<ChartOfAccount>
  >({
    mutationFn: createChartOfAccount,
  });
};

const useUpdateChartOfAccount = () => {
  return useMutation<
    ApiResponse<Partial<ChartOfAccount>>,
    Error,
    { id: number; params: Partial<ChartOfAccount> }
  >({
    mutationFn: ({ id, params }) => updateChartOfAccount(id, params),
  });
};

const useDeleteChartOfAccount = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteChartOfAccount(id),
  });
};

export {
  useChartOfAccountsQuery,
  useChartOfAccountsInfinityQuery,
  useCreateChartOfAccount,
  useUpdateChartOfAccount,
  useDeleteChartOfAccount,
};
