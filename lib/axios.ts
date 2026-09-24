import axios from "axios";
import { storage } from "./storage";

/**
 * One shared Axios setup for both the app API and DummyJSON.
 * Browser calls use the app API; the server uses dummyApi to talk to DummyJSON.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const dummyApi = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const normalizeError = (error: any) => {
  if (error?.response?.status === 401 && typeof window !== "undefined") {
    storage.clearSession();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }
  error.userMessage =
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again.";
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, normalizeError);
dummyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage =
      error?.response?.data?.message ||
      error?.message ||
      "DummyJSON request failed.";
    return Promise.reject(error);
  },
);
