import React from 'react';
import Icon, { IconName } from './Icon';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName;
  size?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  name,
  size = 16,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClass = `icon-btn ${className}`.trim();

  return (
    <button
      type="button"
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      <Icon name={name} size={size} />
    </button>
  );
};

export default IconButton;
