import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { User, UserParams, UserRequest } from "../types/user";
import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../api/user";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";

const useUsersQuery = (params: UserParams) => {
  return useQuery<ApiResponse<Result<User[]>>, Error>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

const useUsersInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<User[]>>, Error>({
    queryKey: ["InfinityRoles", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getUsers({
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

const useCreateUser = () => {
  return useMutation<ApiResponse<UserRequest>, Error, UserRequest>({
    mutationFn: createUser,
  });
};

const useUpdateUser = () => {
  return useMutation<
    ApiResponse<UserRequest>,
    Error,
    { id: number; params: UserRequest }
  >({
    mutationFn: ({ id, params }) => updateUser(id, params),
  });
};

const useDeleteUser = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteUser(id),
  });
};

const useChangePassword = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { id: number; password: string; confirm_password: string }
  >({
    mutationFn: (params) => changePassword(params),
  });
};

export {
  useUsersQuery,
  useUsersInfinityQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
};
