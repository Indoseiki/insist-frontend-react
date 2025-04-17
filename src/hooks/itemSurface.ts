import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemSurface, ItemSurfaceParams } from "../types/itemSurface";
import {
  createItemSurface,
  deleteItemSurface,
  getItemSurfaces,
  updateItemSurface,
} from "../api/itemSurface";

const useItemSurfacesQuery = (params: ItemSurfaceParams) => {
  return useQuery<ApiResponse<Result<ItemSurface[]>>, Error>({
    queryKey: ["ItemSurfaces", params],
    queryFn: () => getItemSurfaces(params),
    enabled: !!params.categoryCode,
  });
};

const useItemSurfacesInfinityQuery = ({
  search,
  categoryCode,
}: {
  search: string;
  categoryCode: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<ItemSurface[]>>, Error>({
    queryKey: ["InfinityItemSurfaces", search, categoryCode],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemSurfaces({
        categoryCode,
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

const useCreateItemSurface = () => {
  return useMutation<
    ApiResponse<Partial<ItemSurface>>,
    Error,
    Partial<ItemSurface>
  >({
    mutationFn: createItemSurface,
  });
};

const useUpdateItemSurface = () => {
  return useMutation<
    ApiResponse<Partial<ItemSurface>>,
    Error,
    { id: number; params: Partial<ItemSurface> }
  >({
    mutationFn: ({ id, params }) => updateItemSurface(id, params),
  });
};

const useDeleteItemSurface = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemSurface(id),
  });
};

export {
  useItemSurfacesQuery,
  useItemSurfacesInfinityQuery,
  useCreateItemSurface,
  useUpdateItemSurface,
  useDeleteItemSurface,
};
