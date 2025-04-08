import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { Currency, CurrencyParams } from "../types/currency";
import {
  createCurrency,
  deleteCurrency,
  generateCurrency,
  getCurrencies,
  updateCurrency,
} from "../api/currency";

const useCurrenciesQuery = (params: CurrencyParams) => {
  return useQuery<ApiResponse<Result<Currency[]>>, Error>({
    queryKey: ["Currencies", params],
    queryFn: () => getCurrencies(params),
  });
};

const useCurrenciesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Currency[]>>, Error>({
    queryKey: ["InfinityCurrencies", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getCurrencies({
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

const useCreateCurrency = () => {
  return useMutation<ApiResponse<Partial<Currency>>, Error, Partial<Currency>>({
    mutationFn: createCurrency,
  });
};

const useUpdateCurrency = () => {
  return useMutation<
    ApiResponse<Partial<Currency>>,
    Error,
    { id: number; params: Partial<Currency> }
  >({
    mutationFn: ({ id, params }) => updateCurrency(id, params),
  });
};

const useDeleteCurrency = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteCurrency(id),
  });
};

const useGenereateCurrency = () => {
  return useMutation<ApiResponse<null>, Error, null>({
    mutationFn: generateCurrency,
  });
};

export {
  useCurrenciesQuery,
  useCurrenciesInfinityQuery,
  useCreateCurrency,
  useUpdateCurrency,
  useDeleteCurrency,
  useGenereateCurrency,
};
