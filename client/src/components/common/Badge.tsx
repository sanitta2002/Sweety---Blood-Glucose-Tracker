import React from "react";

export type BadgeVariant = "hypo" | "normal" | "elevated" | "high" | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  return (
    <span className={`glucose-tag badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
