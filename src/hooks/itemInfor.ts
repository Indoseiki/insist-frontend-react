import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import { ItemInfor, ItemInforParams } from "../types/itemInfor";
import { getItemInfors } from "../api/itemInfor";

const useItemInforsQuery = (params: ItemInforParams) => {
  return useQuery<ApiResponse<Result<ItemInfor[]>>, Error>({
    queryKey: ["ItemInfors", params],
    queryFn: () => getItemInfors(params),
  });
};

const useItemInforsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<ItemInfor[]>>, Error>({
    queryKey: ["InfinityItemInfors", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getItemInfors({
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

export { useItemInforsQuery, useItemInforsInfinityQuery };
