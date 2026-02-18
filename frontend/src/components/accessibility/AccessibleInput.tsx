import React, { useId } from 'react';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  showLabel?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * AccessibleInput Component
 * Fully accessible input field with proper labels, error messages, hints
 *
 * WCAG 2.1 Success Criteria:
 * - 1.3.1 (Info and Relationships) - Level A
 * - 3.3.1 (Error Identification) - Level A
 * - 3.3.2 (Labels or Instructions) - Level A
 * - 4.1.2 (Name, Role, Value) - Level A
 */
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  hint,
  showLabel = true,
  icon,
  iconPosition = 'left',
  required,
  disabled,
  className = '',
  ...props
}) => {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  const hasError = Boolean(error);
  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${!showLabel ? 'sr-only' : ''}`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>

      {hint && (
        <p
          id={hintId}
          className="text-sm text-gray-600 dark:text-gray-400 mb-2"
        >
          {hint}
        </p>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
          aria-required={required}
          className={`
            block w-full rounded-lg border px-4 py-2
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${hasError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:text-white
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AccessibleInput;
