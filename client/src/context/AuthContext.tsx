import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types/index.js";
import { authService } from "../services/auth.service.js";
import { tokenService } from "../services/token.service.js";

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
  const [token, setToken] = useState<string | null>(tokenService.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      const storedToken = tokenService.getToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          tokenService.removeToken();
          setToken(null);
          setUser(null);
        }
      } catch {
        tokenService.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authService.login(email, password);
    if (response.data) {
      tokenService.setToken(response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const response = await authService.register(name, email, password);
    if (response.data) {
      tokenService.setToken(response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = (): void => {
    tokenService.removeToken();
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
