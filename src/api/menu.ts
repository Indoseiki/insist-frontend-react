import { Menu, MenuParams, MenuRequest } from "../types/menu";
import { Result } from "../types/pagination";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";

const url = "/admin/master/menu";

const getMenus = async (
  params: MenuParams
): Promise<ApiResponse<Result<Menu[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Menu[]>>>(url, {
    params,
  });
  return response.data;
};

const getMenusUser = async (
  params: MenuParams
): Promise<ApiResponse<Result<Menu[]>>> => {
  const response = await apiClient.get<ApiResponse<Result<Menu[]>>>(
    `${url}/user`,
    {
      params,
    }
  );
  return response.data;
};

const createMenu = async (
  params: MenuRequest
): Promise<ApiResponse<MenuRequest>> => {
  const response = await apiClient.post<ApiResponse<MenuRequest>>(url, params);
  return response.data;
};

const updateMenu = async (
  id: number,
  params: MenuRequest
): Promise<ApiResponse<MenuRequest>> => {
  const response = await apiClient.put<ApiResponse<MenuRequest>>(
    `${url}/${id}`,
    params
  );
  return response.data;
};

const deleteMenu = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/${id}`);
  return response.data;
};

const urlTreeMenu = "/admin/master/tree-menu";

const getTreeMenu = async (): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>(urlTreeMenu);
  return response.data;
};

const getTreeMenuUser = async (): Promise<ApiResponse<Menu[]>> => {
  const response = await apiClient.get<ApiResponse<Menu[]>>(
    `${urlTreeMenu}/user`
  );
  return response.data;
};

export {
  getMenus,
  getMenusUser,
  createMenu,
  updateMenu,
  deleteMenu,
  getTreeMenu,
  getTreeMenuUser,
};
