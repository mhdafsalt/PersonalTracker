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
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[28px] border border-dashed border-[#d2d2ce] bg-[#f6f6f5]/60 my-4">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[#f1f1ef] border border-[#e8e8e5] flex items-center justify-center text-[#0f110f] mb-4">
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
      )}
      <h4 className="font-semibold text-lg text-[#0f110f]">{title}</h4>
      {description && <p className="text-sm text-[#6b6b68] max-w-md mt-1 mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
