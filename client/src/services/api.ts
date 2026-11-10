import type {
  ApiResponse,
  AuthResponse,
  Reading,
  ComprehensiveReport,
  ReadingSlot,
} from "../types/index.js";

const TOKEN_KEY = "sweety_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: "Network request failed. Please check your connection.",
  }));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
      request<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
      request<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    getMe: (): Promise<ApiResponse<{ user: AuthResponse["user"] }>> =>
      request<{ user: AuthResponse["user"] }>("/api/auth/me", {
        method: "GET",
      }),
  },

  readings: {
    getAll: (params?: { date?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Reading[]>> => {
      const query = new URLSearchParams();
      if (params?.date) query.set("date", params.date);
      if (params?.startDate) query.set("startDate", params.startDate);
      if (params?.endDate) query.set("endDate", params.endDate);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return request<Reading[]>(`/api/readings${queryString}`, { method: "GET" });
    },

    getById: (id: string): Promise<ApiResponse<Reading>> =>
      request<Reading>(`/api/readings/${id}`, { method: "GET" }),

    create: (readingDate: string, slot: ReadingSlot, value: number): Promise<ApiResponse<Reading>> =>
      request<Reading>("/api/readings", {
        method: "POST",
        body: JSON.stringify({ readingDate, slot, value }),
      }),

    update: (id: string, data: { readingDate?: string; slot?: ReadingSlot; value?: number }): Promise<ApiResponse<Reading>> =>
      request<Reading>(`/api/readings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<ApiResponse<void>> =>
      request<void>(`/api/readings/${id}`, { method: "DELETE" }),

    getReports: (date?: string): Promise<ApiResponse<ComprehensiveReport>> => {
      const query = date ? `?date=${encodeURIComponent(date)}` : "";
      return request<ComprehensiveReport>(`/api/readings/reports${query}`, { method: "GET" });
    },
  },
};
