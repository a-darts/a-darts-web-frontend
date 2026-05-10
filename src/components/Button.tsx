import React from 'react';
import Icon, { IconName } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: IconName;
  rightIcon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  leftIcon,
  rightIcon,
  loading,
  fullWidth,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClass = `
    ${variant}
    ${size}
    ${fullWidth ? 'full-width' : ''}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
      style={{
        ...props.style,
        width: fullWidth ? '100%' : undefined,
        opacity: (disabled || loading) ? 0.5 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? (
        <Icon
          name="Loader"
          size={size === 'small' ? 14 : 16}
          className="btn-icon animate-spin"
        />
      ) : (
        leftIcon && (
          <Icon
            name={leftIcon}
            size={size === 'small' ? 14 : 16}
            className="btn-icon left"
          />
        )
      )}
      <span className="btn-text">{children}</span>
      {!loading && rightIcon && (
        <Icon
          name={rightIcon}
          size={size === 'small' ? 14 : 16}
          className="btn-icon right"
        />
      )}
    </button>
  );
};

export default Button;
