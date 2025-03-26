import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { TaxCode, TaxCodeParams } from "../types/taxCode";
import {
  createTaxCode,
  deleteTaxCode,
  getTaxCodes,
  updateTaxCode,
} from "../api/taxCode";

const useTaxCodesQuery = (params: TaxCodeParams) => {
  return useQuery<ApiResponse<Result<TaxCode[]>>, Error>({
    queryKey: ["TaxCodes", params],
    queryFn: () => getTaxCodes(params),
  });
};

const useTaxCodesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<TaxCode[]>>, Error>({
    queryKey: ["InfinityTaxCodes", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getTaxCodes({
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

const useCreateTaxCode = () => {
  return useMutation<ApiResponse<Partial<TaxCode>>, Error, Partial<TaxCode>>({
    mutationFn: createTaxCode,
  });
};

const useUpdateTaxCode = () => {
  return useMutation<
    ApiResponse<Partial<TaxCode>>,
    Error,
    { id: number; params: Partial<TaxCode> }
  >({
    mutationFn: ({ id, params }) => updateTaxCode(id, params),
  });
};

const useDeleteTaxCode = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteTaxCode(id),
  });
};

export {
  useTaxCodesQuery,
  useTaxCodesInfinityQuery,
  useCreateTaxCode,
  useUpdateTaxCode,
  useDeleteTaxCode,
};
