import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemProduct, ItemProductParams } from "../types/itemProduct";
import {
  createItemProduct,
  deleteItemProduct,
  getItemProducts,
  updateItemProduct,
} from "../api/itemProduct";

const useItemProductsQuery = (params: ItemProductParams) => {
  return useQuery<ApiResponse<Result<ItemProduct[]>>, Error>({
    queryKey: ["ItemProducts", params],
    queryFn: () => getItemProducts(params),
    enabled: !!params.categoryCode,
  });
};

const useItemProductsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemProduct[]>>, Error>({
    queryKey: ["InfinityItemProducts", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemProducts({
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

const useCreateItemProduct = () => {
  return useMutation<
    ApiResponse<Partial<ItemProduct>>,
    Error,
    Partial<ItemProduct>
  >({
    mutationFn: createItemProduct,
  });
};

const useUpdateItemProduct = () => {
  return useMutation<
    ApiResponse<Partial<ItemProduct>>,
    Error,
    { id: number; params: Partial<ItemProduct> }
  >({
    mutationFn: ({ id, params }) => updateItemProduct(id, params),
  });
};

const useDeleteItemProduct = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemProduct(id),
  });
};

export {
  useItemProductsQuery,
  useItemProductsInfinityQuery,
  useCreateItemProduct,
  useUpdateItemProduct,
  useDeleteItemProduct,
};
