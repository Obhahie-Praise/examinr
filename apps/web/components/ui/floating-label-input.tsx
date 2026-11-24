"use client";

import React, { useState, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingLabelInputProps {
  /** Floating label text */
  label?: string;
  /** Controlled input value */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Callback fired when input value changes */
  onChange?: (value: string) => void;
  /** Input type. Default: "text" */
  type?: "text" | "email" | "password" | "url";
  /** Optional helper text below the field */
  helperText?: string;
  /** Optional error message (renders error ring and alert icon) */
  error?: string;
  /** Show clear (X) button when field has text. Default: true */
  clearable?: boolean;
  /** Disable input */
  disabled?: boolean;
  className?: string;
}

export function FloatingLabelInput({
  label = "Apple ID or Email Address",
  value: controlledValue,
  defaultValue = "rishabh@boseui.com",
  onChange,
  type = "email",
  helperText = "Your email is used for CLI registry authentication.",
  error,
  clearable = true,
  disabled = false,
  className,
}: FloatingLabelInputProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const inputId = useId();
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentValue = isControlled ? controlledValue : internalValue;
  const isFloated = focused || currentValue.length > 0;

  const updateValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const resolvedType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex h-14 w-full items-center rounded-full border bg-white px-6 transition-all dark:bg-[#0A0A0A]",
          error
            ? "border-red-500 ring-3 ring-red-500/15 dark:border-red-500"
            : focused
              ? "border-neutral-900 ring-3 ring-neutral-900/10 dark:border-white dark:ring-white/15"
              : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-700",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* Floating Label */}
        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: isFloated ? -16 : 0,
            scale: isFloated ? 0.82 : 1,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 30 }
          }
          style={{ originX: 0 }}
          className={cn(
            "pointer-events-none absolute left-6 select-none font-medium transition-colors",
            error
              ? "text-red-600 dark:text-red-400"
              : focused
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400 dark:text-neutral-500"
          )}
        >
          {label}
        </motion.label>

        {/* Native Input */}
        <input
          id={inputId}
          type={resolvedType}
          disabled={disabled}
          value={currentValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => updateValue(e.target.value)}
          className="mt-4 w-full bg-transparent text-sm font-medium text-neutral-950 focus:outline-none disabled:cursor-not-allowed dark:text-white"
        />

        {/* Right Controls: Clear / Password Toggle / Status */}
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {type === "password" && (
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {clearable && currentValue.length > 0 && !disabled && (
            <button
              type="button"
              aria-label="Clear input"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => updateValue("")}
              className="rounded-full bg-neutral-100 p-1 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Helper or Error Caption */}
      {(error || helperText) && (
        <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[11px]">
          {error ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">
                {error}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="text-neutral-500 dark:text-neutral-400">
                {helperText}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FloatingLabelInput;
