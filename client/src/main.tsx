import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.js";
import App from "./App.js";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}
