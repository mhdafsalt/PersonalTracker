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
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-[24px] border border-dashed border-[#E5E8ED] bg-[#F7F8FA] my-3">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-white border border-[#E5E8ED] flex items-center justify-center text-[#111315] shadow-xs mb-3">
          <Icon className="w-5 h-5 text-[#686E77]" />
        </div>
      )}
      <h4 className="font-semibold text-base text-[#111315]">{title}</h4>
      {description && <p className="text-xs text-[#686E77] max-w-sm mt-1 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};


