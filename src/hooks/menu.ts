import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createMenu,
  deleteMenu,
  getMenus,
  getMenusUser,
  getTreeMenu,
  getTreeMenuUser,
  updateMenu,
} from "../api/menu";
import { ApiResponse } from "../types/response";
import { Menu, MenuParams, MenuRequest } from "../types/menu";
import { Result } from "../types/pagination";

const useMenusQuery = (params: MenuParams) => {
  return useQuery<ApiResponse<Result<Menu[]>>, Error>({
    queryKey: ["Menus", params],
    queryFn: () => getMenus(params),
  });
};

const useMenusInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Menu[]>>, Error>({
    queryKey: ["InfinityMenus", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getMenus({
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

const useMenusUserInfinityQuery = ({ search }: { search: string }) => {
  return useInfiniteQuery<ApiResponse<Result<Menu[]>>, Error>({
    queryKey: ["InfinityMenusUser", search],
    queryFn: ({ pageParam }: { pageParam?: unknown }) => {
      const page = pageParam as number;
      return getMenusUser({
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

const useCreateMenu = () => {
  return useMutation<ApiResponse<MenuRequest>, Error, MenuRequest>({
    mutationFn: createMenu,
  });
};

const useUpdateMenu = () => {
  return useMutation<
    ApiResponse<MenuRequest>,
    Error,
    { id: number; params: MenuRequest }
  >({
    mutationFn: ({ id, params }) => updateMenu(id, params),
  });
};

const useDeleteMenu = () => {
  return useMutation<ApiResponse<null>, Error, number>({
    mutationFn: (id) => deleteMenu(id),
  });
};

const useTreeMenu = () => {
  return useQuery<ApiResponse<Menu[]>, Error>({
    queryKey: ["tree-menu"],
    queryFn: () => getTreeMenu(),
  });
};

const useTreeMenuUser = () => {
  return useQuery<ApiResponse<Menu[]>, Error>({
    queryKey: ["tree-menu-user"],
    queryFn: () => getTreeMenuUser(),
  });
};

export {
  useMenusQuery,
  useMenusInfinityQuery,
  useMenusUserInfinityQuery,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useTreeMenu,
  useTreeMenuUser,
};
