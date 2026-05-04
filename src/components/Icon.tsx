import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideIcons.LucideProps {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  // Lucide icons are exported as PascalCase (e.g., ArrowRight)
  const LucideIcon = LucideIcons[name] as React.ElementType;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon {...props} />;
};

export default Icon;
