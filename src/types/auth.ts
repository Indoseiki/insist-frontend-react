export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface TwoFactorAuthPayload {
  username: string;
  otp_key: string;
}

export interface TwoFactorAuthResponse {
  access_token: string;
}
