import React from 'react';
import { Card } from './Card';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = '#6B8F71', trend }) => {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#777D75]">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#252923] mt-1.5">{value}</h3>
          {subtitle && (
            <p className="text-xs text-[#777D75] mt-1.5 flex items-center gap-1">
              {trend && (
                <span className={trend > 0 ? 'text-[#4F9B72] font-semibold' : 'text-[#D96C6C] font-semibold'}>
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15`, color }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
};

