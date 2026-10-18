import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'pink' | 'green' | 'amber' | 'slate' | 'rose' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  const variantStyles = {
    blue: 'bg-softBlue text-navyInk-700 border border-navyInk-200',
    pink: 'bg-softCoral-100 text-softCoral-500 border border-softCoral-200',
    green: 'bg-sageGreen text-deepSage border border-sageGreen-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    slate: 'bg-slateGray-100 text-slateGray-700 border border-slateGray-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-navyInk-50 text-navyInk-700 border border-navyInk-200',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
