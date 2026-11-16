import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'revoked' | 'warning' | 'neutral' | 'blush' | 'burgundy';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  ...props
}) => {
  const variants = {
    active: 'bg-emerald-50 text-status-success border border-emerald-200/80 font-medium',
    revoked: 'bg-rose-50 text-medical-red border border-rose-200/80 font-medium',
    warning: 'bg-amber-50 text-status-warning border border-amber-200/80 font-medium',
    neutral: 'bg-beige-pale/70 text-text-dark border border-beige-subtle',
    blush: 'bg-blush text-burgundy-deep font-semibold',
    burgundy: 'bg-burgundy text-white font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'active' && (
        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
      )}
      {variant === 'revoked' && (
        <span className="w-1.5 h-1.5 rounded-full bg-medical-red" />
      )}
      {children}
    </span>
  );
};

