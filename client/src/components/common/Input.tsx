import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  id,
  className = "",
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...rest}
      />
      {error && <span className="form-error-text">{error}</span>}
      {!error && helpText && <span className="help-text">{helpText}</span>}
    </div>
  );
};
