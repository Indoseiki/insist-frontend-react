import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import {
  createSubSection,
  deleteSubSection,
  getSubSections,
  updateSubSection,
} from "../api/subSection";
import {
  SubSection,
  SubSectionParams,
  SubSectionRequest,
} from "../types/subSection";

const useSubSectionsQuery = (params: SubSectionParams) => {
  return useQuery<ApiResponse<Result<SubSection[]>>, Error>({
    queryKey: ["SubSections", params],
    queryFn: () => getSubSections(params),
  });
};

const useSubSectionsInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<SubSection[]>>, Error>({
    queryKey: ["InfinitySubSections", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getSubSections({
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

const useCreateSubSection = () => {
  return useMutation<ApiResponse<SubSectionRequest>, Error, SubSectionRequest>({
    mutationFn: createSubSection,
  });
};

const useUpdateSubSection = () => {
  return useMutation<
    ApiResponse<SubSectionRequest>,
    Error,
    { id: number; params: SubSectionRequest }
  >({
    mutationFn: ({ id, params }) => updateSubSection(id, params),
  });
};

const useDeleteSubSection = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteSubSection(id),
  });
};

export {
  useSubSectionsQuery,
  useSubSectionsInfinityQuery,
  useCreateSubSection,
  useUpdateSubSection,
  useDeleteSubSection,
};
