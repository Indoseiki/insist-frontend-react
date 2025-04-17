import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemGroup, ItemGroupParams } from "../types/itemGroup";
import {
  createItemGroup,
  deleteItemGroup,
  getItemGroups,
  updateItemGroup,
} from "../api/itemGroup";

const useItemGroupsQuery = (params: ItemGroupParams) => {
  return useQuery<ApiResponse<Result<ItemGroup[]>>, Error>({
    queryKey: ["ItemGroups", params],
    queryFn: () => getItemGroups(params),
    enabled: !!params.categoryCode,
  });
};

const useItemGroupsInfinityQuery = ({
  search,
  categoryCode,
  idProductType,
}: {
  search: string;
  categoryCode: string;
  idProductType: string;
}) => {
  return useInfiniteQuery<ApiResponse<Result<ItemGroup[]>>, Error>({
    queryKey: ["InfinityItemGroups", search, categoryCode, idProductType],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemGroups({
        categoryCode,
        idProductType,
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

const useCreateItemGroup = () => {
  return useMutation<
    ApiResponse<Partial<ItemGroup>>,
    Error,
    Partial<ItemGroup>
  >({
    mutationFn: createItemGroup,
  });
};

const useUpdateItemGroup = () => {
  return useMutation<
    ApiResponse<Partial<ItemGroup>>,
    Error,
    { id: number; params: Partial<ItemGroup> }
  >({
    mutationFn: ({ id, params }) => updateItemGroup(id, params),
  });
};

const useDeleteItemGroup = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteItemGroup(id),
  });
};

export {
  useItemGroupsQuery,
  useItemGroupsInfinityQuery,
  useCreateItemGroup,
  useUpdateItemGroup,
  useDeleteItemGroup,
};
