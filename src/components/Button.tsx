import React from 'react';
import Icon, { IconName } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  const buttonClass = `${variant} ${className}`.trim();

  return (
    <button className={buttonClass} {...props}>
      {leftIcon &&
        <Icon
          name={leftIcon}
          size={16}
          className="btn-icon left"
        />
      }
      <span className="btn-text">{children}</span>
      {rightIcon &&
        <Icon
          name={rightIcon}
          size={16}
          className="btn-icon right"
        />
      }
    </button>
  );
};

export default Button;
