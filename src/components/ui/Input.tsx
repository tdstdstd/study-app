import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-lg border bg-bg-secondary px-3 py-2 text-sm text-text-primary",
          "placeholder:text-gray-500 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent",
          error ? "border-danger" : "border-border",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";