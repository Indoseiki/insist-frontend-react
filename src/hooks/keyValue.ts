import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createKeyValue,
  deleteKeyValue,
  getKeyValues,
  updateKeyValue,
} from "../api/keyValue";
import { KeyValue, KeyValueParams, KeyValueRequest } from "../types/keyValue";

const useKeyValuesQuery = (params: KeyValueParams) => {
  return useQuery<ApiResponse<Result<KeyValue[]>>, Error>({
    queryKey: ["KeyValues", params],
    queryFn: () => getKeyValues(params),
  });
};

const useKeyValuesInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<KeyValue[]>>, Error>({
    queryKey: ["InfinityKeyValues", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getKeyValues({
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

const useCreateKeyValue = () => {
  return useMutation<ApiResponse<KeyValueRequest>, Error, KeyValueRequest>({
    mutationFn: createKeyValue,
  });
};

const useUpdateKeyValue = () => {
  return useMutation<
    ApiResponse<KeyValueRequest>,
    Error,
    { id: number; params: KeyValueRequest }
  >({
    mutationFn: ({ id, params }) => updateKeyValue(id, params),
  });
};

const useDeleteKeyValue = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteKeyValue(id),
  });
};

export {
  useKeyValuesQuery,
  useKeyValuesInfinityQuery,
  useCreateKeyValue,
  useUpdateKeyValue,
  useDeleteKeyValue,
};
