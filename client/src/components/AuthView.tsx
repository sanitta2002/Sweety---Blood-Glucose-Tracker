import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { VALIDATION_MESSAGES } from "../constants/messages.js";

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
      if (!name.trim()) {
        setError(VALIDATION_MESSAGES.NAME_REQUIRED);
        return;
      }
    }

    if (!email.trim()) {
      setError(VALIDATION_MESSAGES.EMAIL_REQUIRED);
      return;
    }

    if (!password) {
      setError(VALIDATION_MESSAGES.PASSWORD_REQUIRED);
      return;
    }

    if (password.length < 6) {
      setError(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
      return;
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

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="input"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Processing..." : isRegister ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="demo-box">
          <p className="demo-hint">Testing the application?</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleDemoFill}
          >
            Fill Demo Account (demo@sweety.com)
          </button>
        </div>
      </div>
    </div>
  );
};
