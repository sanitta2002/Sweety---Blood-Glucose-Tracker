import React from "react";

export interface SpinnerProps {
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ label = "Loading..." }) => {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      {label && <p>{label}</p>}
    </div>
  );
};
