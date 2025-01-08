import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { createFCS, deleteFCS, getFCSs, updateFCS } from "../api/fcs";
import { FCS, FCSParams, FCSRequest } from "../types/fcs";

const useFCSsQuery = (params: FCSParams) => {
  return useQuery<ApiResponse<Result<FCS[]>>, Error>({
    queryKey: ["FCSs", params],
    queryFn: () => getFCSs(params),
  });
};

const useFCSsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<FCS[]>>, Error>({
    queryKey: ["InfinityFCSs", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getFCSs({
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

const useCreateFCS = () => {
  return useMutation<ApiResponse<FCSRequest>, Error, FCSRequest>({
    mutationFn: createFCS,
  });
};

const useUpdateFCS = () => {
  return useMutation<
    ApiResponse<FCSRequest>,
    Error,
    { id: number; params: FCSRequest }
  >({
    mutationFn: ({ id, params }) => updateFCS(id, params),
  });
};

const useDeleteFCS = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteFCS(id),
  });
};

export {
  useFCSsQuery,
  useFCSsInfinityQuery,
  useCreateFCS,
  useUpdateFCS,
  useDeleteFCS,
};
