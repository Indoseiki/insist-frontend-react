import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Bank, BankParams } from "../types/bank";
import { createBank, deleteBank, getBanks, updateBank } from "../api/bank";

const useBanksQuery = (params: BankParams) => {
  return useQuery<ApiResponse<Result<Bank[]>>, Error>({
    queryKey: ["Banks", params],
    queryFn: () => getBanks(params),
  });
};

const useBanksInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Bank[]>>, Error>({
    queryKey: ["InfinityBanks", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getBanks({
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

const useCreateBank = () => {
  return useMutation<ApiResponse<Partial<Bank>>, Error, Partial<Bank>>({
    mutationFn: createBank,
  });
};

const useUpdateBank = () => {
  return useMutation<
    ApiResponse<Partial<Bank>>,
    Error,
    { id: number; params: Partial<Bank> }
  >({
    mutationFn: ({ id, params }) => updateBank(id, params),
  });
};

const useDeleteBank = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteBank(id),
  });
};

export {
  useBanksQuery,
  useBanksInfinityQuery,
  useCreateBank,
  useUpdateBank,
  useDeleteBank,
};
