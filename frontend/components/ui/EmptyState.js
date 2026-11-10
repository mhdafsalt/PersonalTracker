import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E9E8E1] bg-[#FAF8F5]/50 my-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#EFECE4] flex items-center justify-center text-[#6B8F71] mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="font-semibold text-lg text-[#252923]">{title}</h4>
      {description && <p className="text-sm text-[#777D75] max-w-md mt-1 mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

