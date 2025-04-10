import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { BillingTerm, BillingTermParams } from "../types/billingTerm";
import {
  createBillingTerm,
  deleteBillingTerm,
  getBillingTerms,
  updateBillingTerm,
} from "../api/billingTerm";

const useBillingTermsQuery = (params: BillingTermParams) => {
  return useQuery<ApiResponse<Result<BillingTerm[]>>, Error>({
    queryKey: ["BillingTerms", params],
    queryFn: () => getBillingTerms(params),
  });
};

const useBillingTermsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<BillingTerm[]>>, Error>({
    queryKey: ["InfinityBillingTerms", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getBillingTerms({
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

const useCreateBillingTerm = () => {
  return useMutation<
    ApiResponse<Partial<BillingTerm>>,
    Error,
    Partial<BillingTerm>
  >({
    mutationFn: createBillingTerm,
  });
};

const useUpdateBillingTerm = () => {
  return useMutation<
    ApiResponse<Partial<BillingTerm>>,
    Error,
    { id: number; params: Partial<BillingTerm> }
  >({
    mutationFn: ({ id, params }) => updateBillingTerm(id, params),
  });
};

const useDeleteBillingTerm = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteBillingTerm(id),
  });
};

export {
  useBillingTermsQuery,
  useBillingTermsInfinityQuery,
  useCreateBillingTerm,
  useUpdateBillingTerm,
  useDeleteBillingTerm,
};
