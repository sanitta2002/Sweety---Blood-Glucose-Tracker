import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types/index.js";
import { api, getStoredToken, setStoredToken, clearStoredToken } from "../services/api.js";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          clearStoredToken();
          setToken(null);
          setUser(null);
        }
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await api.auth.login(email, password);
    if (response.data) {
      setStoredToken(response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const response = await api.auth.register(name, email, password);
    if (response.data) {
      setStoredToken(response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = (): void => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
