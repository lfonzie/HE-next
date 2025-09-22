import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
  className?: string;
}

const ResponsiveRadio: React.FC<ResponsiveRadioProps> = ({
  label,
  error,
  description,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            className={cn(
              'peer h-5 w-5 min-h-5 min-w-5 rounded-full border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              'checked:bg-primary checked:border-primary'
            )}
            {...props}
          />
          <div className="absolute h-2 w-2 rounded-full bg-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="flex-1 min-w-0">
          {label && (
            <label className="type-body font-medium text-foreground cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="type-small text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="type-small text-destructive">{error}</p>
      )}
    </div>
  );
};

interface ResponsiveRadioGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

const ResponsiveRadioGroup: React.FC<ResponsiveRadioGroupProps> = ({
  children,
  label,
  error,
  className = '',
  orientation = 'vertical'
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <legend className="type-body font-medium text-foreground">
          {label}
        </legend>
      )}
      <div className={cn(
        orientation === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-4 sm:gap-6'
      )}>
        {children}
      </div>
      {error && (
        <p className="type-small text-destructive">{error}</p>
      )}
    </div>
  );
};

export { ResponsiveRadio, ResponsiveRadioGroup };
