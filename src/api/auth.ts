import axios from "axios";
import {
  LoginPayload,
  LoginResponse,
  TwoFactorAuthPayload,
  TwoFactorAuthResponse,
} from "../types/auth";
import { ApiResponse } from "../types/response";
import apiClient from "./apiClient";
import { User } from "../types/user";

const baseURL = import.meta.env.VITE_API_URL;
const url = "/auth";

const login = async (
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> => {
  const url = `${baseURL}/auth/login`;
  const { data } = await axios.post<ApiResponse<LoginResponse>>(url, payload, {
    withCredentials: true,
  });
  return data;
};

const twoFactorAuth = async (
  payload: TwoFactorAuthPayload
): Promise<ApiResponse<TwoFactorAuthResponse>> => {
  const url = `${baseURL}/auth/two-fa`;
  const { data } = await axios.post<ApiResponse<TwoFactorAuthResponse>>(
    url,
    payload,
    {
      withCredentials: true,
    }
  );
  return data;
};

const setTwoFactorAuth = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>(
    `${url}/${id}/two-fa`,
    {}
  );
  return response.data;
};

const sendResetPassword = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    `${url}/${id}/send-password-reset`,
    {}
  );
  return response.data;
};

const changePassword = async ({
  token,
  password,
  confirm_password,
}: {
  token: string;
  password: string;
  confirm_password: string;
}): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    `${url}/password-reset?token=${token}`,
    { password, confirm_password }
  );
  return response.data;
};

const userInfo = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`${url}/user-info`);
  return response.data;
};

const logout = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(`${url}/logout`);
  return response.data;
};

export {
  login,
  twoFactorAuth,
  setTwoFactorAuth,
  sendResetPassword,
  changePassword,
  userInfo,
  logout,
};
