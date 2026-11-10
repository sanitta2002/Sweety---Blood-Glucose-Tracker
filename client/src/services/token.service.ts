import { STORAGE_KEYS } from "../constants/api.js";

export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  hasToken(): boolean {
    return Boolean(this.getToken());
  },
};
