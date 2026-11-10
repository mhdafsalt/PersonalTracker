import React from 'react';
import { Card } from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#0f110f',
  trend,
  className = '',
}) => {
  const isPositiveTrend = trend && (typeof trend === 'string' ? !trend.startsWith('-') : trend > 0);

  return (
    <Card hover className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#6b6b68] truncate">
            {title}
          </p>
          <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0f110f] mt-1.5">
            {value}
          </h3>

          {(subtitle || trend) && (
            <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-[#6b6b68]">
              {trend !== undefined && trend !== null && (
                <span
                  className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center ${
                    isPositiveTrend
                      ? 'bg-[#f1f7da] text-[#3f7a1e]'
                      : 'bg-[#ffd9c7] text-[#b4501e]'
                  }`}
                >
                  {isPositiveTrend && typeof trend === 'number' ? `+${trend}%` : typeof trend === 'number' ? `${trend}%` : trend}
                </span>
              )}
              {subtitle && (
                <span className="text-[12px] text-[#6b6b68] truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#f1f1ef] text-[#0f110f]"
          >
            <Icon className="w-4 h-4 stroke-[2]" />
          </div>
        )}
      </div>
    </Card>
  );
};
