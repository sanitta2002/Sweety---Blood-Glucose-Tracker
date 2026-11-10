import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { loginZodSchema, registerZodSchema } from "../validators/index.js";
import { Button, Input, Alert } from "./common/index.js";

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      const result = registerZodSchema.safeParse({ name, email, password });
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Invalid input.");
        return;
      }
    } else {
      const result = loginZodSchema.safeParse({ email, password });
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Invalid input.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (): void => {
    setIsRegister(false);
    setEmail("demo@sweety.com");
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🩸</div>
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p>
            {isRegister
              ? "Track your daily blood glucose and stay healthy"
              : "Sign in to access your glucose readings & reports"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? "active" : ""}`}
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button type="submit" variant="primary" block isLoading={loading}>
            {isRegister ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="demo-box">
          <p className="demo-hint">Testing the application?</p>
          <Button type="button" variant="ghost" size="sm" onClick={handleDemoFill}>
            Fill Demo Account (demo@sweety.com)
          </Button>
        </div>
      </div>
    </div>
  );
};
