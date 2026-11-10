import React from "react";
import { useAuth } from "../context/AuthContext.js";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon">🩸</span>
          <div>
            <h1 className="brand-title">Sweety</h1>
            <p className="brand-subtitle">Blood Glucose Tracker</p>
          </div>
        </div>

        {user && (
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
