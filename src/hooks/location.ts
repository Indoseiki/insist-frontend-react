import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "../api/location";
import { Location, LocationParams, LocationRequest } from "../types/location";

const useLocationsQuery = (params: LocationParams) => {
  return useQuery<ApiResponse<Result<Location[]>>, Error>({
    queryKey: ["Location", params],
    queryFn: () => getLocations(params),
  });
};

const useLocationInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Location[]>>, Error>({
    queryKey: ["InfinityLocation", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getLocations({
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

const useCreateLocation = () => {
  return useMutation<ApiResponse<LocationRequest>, Error, LocationRequest>({
    mutationFn: createLocation,
  });
};

const useUpdateLocation = () => {
  return useMutation<
    ApiResponse<LocationRequest>,
    Error,
    { id: number; params: LocationRequest }
  >({
    mutationFn: ({ id, params }) => updateLocation(id, params),
  });
};

const useDeleteLocation = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteLocation(id),
  });
};

export {
  useLocationsQuery,
  useLocationInfinityQuery,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
};
