export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },
  READINGS: {
    BASE: "/api/readings",
    BY_ID: (id: string): string => `/api/readings/${id}`,
    REPORTS: "/api/readings/reports",
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "sweety_auth_token",
} as const;
