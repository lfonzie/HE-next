import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className = '',
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full',
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </form>
  );
};

interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const ResponsiveFormField: React.FC<ResponsiveFormFieldProps> = ({
  children,
  label,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="type-body font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="type-small text-destructive">{error}</p>
      )}
    </div>
  );
};

interface ResponsiveFormGroupProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3;
}

const ResponsiveFormGroup: React.FC<ResponsiveFormGroupProps> = ({
  children,
  className = '',
  cols = 1
}) => {
  const gridClasses = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={cn(gridClasses[cols], 'gap-4 sm:gap-6', className)}>
      {children}
    </div>
  );
};

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

const ResponsiveFormActions: React.FC<ResponsiveFormActionsProps> = ({
  children,
  className = '',
  align = 'right'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3 sm:gap-4',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
};

export {
  ResponsiveForm,
  ResponsiveFormField,
  ResponsiveFormGroup,
  ResponsiveFormActions
};
