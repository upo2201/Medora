import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'cream';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none disabled:active:scale-100";

  const variants = {
    primary: "bg-burgundy text-white hover:bg-burgundy-hover shadow-soft hover:shadow-burgundy-glow focus:ring-burgundy",
    secondary: "bg-beige-pale text-burgundy-deep hover:bg-beige-subtle focus:ring-burgundy",
    cream: "bg-cream-warm text-burgundy-deep border border-beige-pale hover:bg-white focus:ring-burgundy",
    outline: "border-2 border-burgundy text-burgundy bg-transparent hover:bg-blush-soft focus:ring-burgundy",
    danger: "bg-medical-red text-white hover:bg-medical-dark shadow-soft focus:ring-medical-red",
    ghost: "bg-transparent text-text-dark hover:bg-beige-pale/60 focus:ring-burgundy",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 rounded-2xl",
    icon: "p-2.5 rounded-xl",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

