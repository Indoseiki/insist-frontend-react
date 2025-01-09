import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createSection,
  deleteSection,
  getSections,
  updateSection,
} from "../api/section";
import { Section, SectionParams, SectionRequest } from "../types/section";

const useSectionsQuery = (params: SectionParams) => {
  return useQuery<ApiResponse<Result<Section[]>>, Error>({
    queryKey: ["Sections", params],
    queryFn: () => getSections(params),
  });
};

const useSectionsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Section[]>>, Error>({
    queryKey: ["InfinitySections", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getSections({
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

const useCreateSection = () => {
  return useMutation<ApiResponse<SectionRequest>, Error, SectionRequest>({
    mutationFn: createSection,
  });
};

const useUpdateSection = () => {
  return useMutation<
    ApiResponse<SectionRequest>,
    Error,
    { id: number; params: SectionRequest }
  >({
    mutationFn: ({ id, params }) => updateSection(id, params),
  });
};

const useDeleteSection = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteSection(id),
  });
};

export {
  useSectionsQuery,
  useSectionsInfinityQuery,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
};
