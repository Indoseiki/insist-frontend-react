import axios from "axios";
import { getToken, removeToken, setToken } from "../utils/auth";

const baseURL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  function (config) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      removeToken();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = getToken();

        if (!token) {
          removeToken();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const response = await axios.get(`${baseURL}/auth/token`, {
          withCredentials: true,
        });

        const accessToken = response.data.data.access_token;

        setToken(accessToken);

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        removeToken();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
