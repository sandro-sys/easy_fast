"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  "aria-label"?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
  className = "input-field",
  "aria-label": ariaLabel,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        style={{ paddingRight: "2.5rem" }}
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={className}
        aria-label={ariaLabel}
        autoComplete={id === "password" ? "current-password" : "new-password"}
      />
      <button
        type="button"
        onClick={() => setShowPassword((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#32C76A] rounded p-0.5"
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
