import type { ApiResponse } from "../types/index.js";
import { tokenService } from "./token.service.js";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, headers: customHeaders, ...restOptions } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = tokenService.getToken();
  const headers = new Headers(customHeaders || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: "Network request failed. Please check your connection.",
  }));

  if (!response.ok) {
    const errorMessage = body.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return body;
}
