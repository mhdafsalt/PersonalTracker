import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  className = '',
}) => {
  const isLime = variant === 'lime';
  const isBlue = variant === 'blue';

  return (
    <Card variant={variant} hover className={`relative overflow-hidden flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isLime ? 'text-black/70' : isBlue ? 'text-sky-800' : 'text-[#7E8590]'
            }`}
          >
            {title}
          </span>
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isLime
                  ? 'bg-black text-[#D4F648]'
                  : trend >= 0
                  ? 'bg-[#D4F648] text-black'
                  : 'bg-[#FEE2E2] text-[#EF4444]'
              }`}
            >
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3 stroke-[2.5]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111315]">
          {value}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/[0.05]">
        {subtitle && (
          <p
            className={`text-xs ${
              isLime ? 'text-black/80 font-medium' : isBlue ? 'text-sky-900/80' : 'text-[#7E8590]'
            }`}
          >
            {subtitle}
          </p>
        )}
        {Icon && (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isLime
                ? 'bg-black/10 text-black'
                : isBlue
                ? 'bg-sky-200/60 text-sky-900'
                : 'bg-[#F0F2F5] text-[#111315]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
    </Card>
  );
};
