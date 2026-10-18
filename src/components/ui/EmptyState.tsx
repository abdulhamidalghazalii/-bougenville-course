import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-dashed border-slateNavy-200 ${className}`}
    >
      <div className="p-4 rounded-3xl bg-brand-50 text-brand-500 mb-4">{icon}</div>
      <h3 className="text-base sm:text-lg font-bold text-slateNavy-800">{title}</h3>
      <p className="text-xs sm:text-sm text-slateNavy-500 max-w-sm mt-1 mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
