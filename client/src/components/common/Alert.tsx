import React from "react";

export type AlertType = "error" | "warning" | "success" | "info";

export interface AlertProps {
  type?: AlertType;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "error",
  children,
  className = "",
}) => {
  const icon =
    type === "error" ? "⚠️" : type === "warning" ? "⚡" : type === "success" ? "✅" : "ℹ️";

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <span className="alert-icon">{icon}</span>
      <span className="alert-content">{children}</span>
    </div>
  );
};
