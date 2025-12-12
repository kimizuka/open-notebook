import axios, { AxiosResponse } from "axios";
import { getApiUrl } from "@/lib/config";

// API client with runtime-configurable base URL
// The base URL is fetched from the API config endpoint on first request
// Timeout increased to 5 minutes (300000ms = 300s) to accommodate slow LLM operations
// (transformations, insights generation) especially on slower hardware (Ollama, LM Studio)
// Note: Frontend uses milliseconds (300000ms), backend uses seconds (300s) - both equal 5 minutes
// To configure: Set API_CLIENT_TIMEOUT=600 in .env for 10 minutes (600s = 600000ms)
export const apiClient = axios.create({
  timeout: 300000, // 300 seconds = 5 minutes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Clerkからトークンを取得する関数（AuthProviderから設定される）
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

// Request interceptor to add base URL and auth header
apiClient.interceptors.request.use(async (config) => {
  // Set the base URL dynamically from runtime config
  if (!config.baseURL) {
    const apiUrl = await getApiUrl();
    config.baseURL = `${apiUrl}/api`;
  }

  // Clerkからトークンを取得してAuthorizationヘッダーに設定
  if (getAuthToken) {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
  }

  // Handle FormData vs JSON content types
  if (config.data instanceof FormData) {
    // Remove any Content-Type header to let browser set multipart boundary
    delete config.headers["Content-Type"];
  } else if (
    config.method &&
    ["post", "put", "patch"].includes(config.method.toLowerCase())
  ) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on auth error
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;