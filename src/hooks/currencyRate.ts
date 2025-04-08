import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { CurrencyRate, CurrencyRateParams } from "../types/currencyRate";
import {
  createCurrencyRate,
  deleteCurrencyRate,
  getCurrencyRates,
  updateCurrencyRate,
} from "../api/currencyRate";

const useCurrencyRatesQuery = (params: CurrencyRateParams) => {
  return useQuery<ApiResponse<Result<CurrencyRate[]>>, Error>({
    queryKey: ["CurrencyRates", params],
    queryFn: () => getCurrencyRates(params),
    enabled: !!params.idCurrency,
  });
};

const useCurrencyRatesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<CurrencyRate[]>>, Error>({
    queryKey: ["InfinityCurrencyRates", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getCurrencyRates({
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

const useCreateCurrencyRate = () => {
  return useMutation<
    ApiResponse<Partial<CurrencyRate>>,
    Error,
    Partial<CurrencyRate>
  >({
    mutationFn: createCurrencyRate,
  });
};

const useUpdateCurrencyRate = () => {
  return useMutation<
    ApiResponse<Partial<CurrencyRate>>,
    Error,
    { id: number; params: Partial<CurrencyRate> }
  >({
    mutationFn: ({ id, params }) => updateCurrencyRate(id, params),
  });
};

const useDeleteCurrencyRate = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteCurrencyRate(id),
  });
};

export {
  useCurrencyRatesQuery,
  useCurrencyRatesInfinityQuery,
  useCreateCurrencyRate,
  useUpdateCurrencyRate,
  useDeleteCurrencyRate,
};
