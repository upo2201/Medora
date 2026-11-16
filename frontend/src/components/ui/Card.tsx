import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'beige' | 'burgundy' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'white',
  ...props
}) => {
  const variants = {
    white: 'bg-white border border-beige-pale/80 shadow-soft',
    cream: 'bg-cream-warm border border-beige-pale shadow-soft',
    beige: 'bg-beige-pale/60 border border-beige-subtle',
    burgundy: 'bg-burgundy-deep text-white shadow-soft-lg',
    outline: 'bg-transparent border-2 border-dashed border-beige-pale',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-6 pb-3', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('font-serif text-xl font-semibold tracking-tight text-text-dark', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-sm text-text-muted mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-6 pt-3', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-6 pt-0 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

