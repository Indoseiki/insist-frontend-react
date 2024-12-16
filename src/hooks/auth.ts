import { useMutation, useQuery } from "@tanstack/react-query";
import { LoginPayload, TwoFactorAuthPayload } from "../types/auth";
import {
  changePassword,
  login,
  logout,
  sendResetPassword,
  setTwoFactorAuth,
  twoFactorAuth,
  userInfo,
} from "../api/auth";
import { ApiResponse } from "../types/response";
import { User } from "../types/user";

const useLogin = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
};

const useTwoFactorAuth = () => {
  return useMutation({
    mutationFn: (payload: TwoFactorAuthPayload) => twoFactorAuth(payload),
  });
};

const useSetTwoFactorAuth = () => {
  return useMutation({
    mutationFn: (id: number) => setTwoFactorAuth(id),
  });
};

const useSendResetPassword = () => {
  return useMutation({
    mutationFn: (id: number) => sendResetPassword(id),
  });
};

const useChangePassword = () => {
  return useMutation<
    ApiResponse<null>,
    Error,
    { token: string; password: string; confirm_password: string }
  >({
    mutationFn: (params) => changePassword(params),
  });
};

const useUserInfoQuery = () => {
  return useQuery<ApiResponse<User>, Error>({
    queryKey: ["user-info"],
    queryFn: () => userInfo(),
  });
};

const useLogout = () => {
  return useMutation<ApiResponse<null>, Error, {}>({
    mutationFn: () => logout(),
  });
};

export {
  useLogin,
  useTwoFactorAuth,
  useSetTwoFactorAuth,
  useSendResetPassword,
  useChangePassword,
  useUserInfoQuery,
  useLogout,
};
