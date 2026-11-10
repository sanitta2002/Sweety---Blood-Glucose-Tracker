import { apiClient } from "./apiClient.js";
import { API_ENDPOINTS } from "../constants/api.js";
import type { ApiResponse, AuthResponse, User } from "../types/index.js";

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiClient<{ user: User }>(API_ENDPOINTS.AUTH.ME, {
      method: "GET",
    });
  },
};
