import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-text-dark/80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-white border border-beige-pale rounded-xl px-4 py-2.5 text-sm text-text-dark placeholder:text-text-light transition-all duration-200",
              "focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15",
              icon && "pl-10",
              error && "border-medical-red focus:border-medical-red focus:ring-medical-red/15",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-medical-red font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

