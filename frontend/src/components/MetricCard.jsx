import React from 'react';

export default function MetricCard({
  label,
  value,
  subtitle,
  status,
  badge
}) {
  return (
    <div className="bg-white rounded-xl border border-navy-200/80 p-4 shadow-subtle hover:border-brand-200 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-navy-500">{label}</span>
        {badge && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-navy-100 text-navy-600">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-xl font-bold text-navy-950 font-mono">
        {value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-navy-400">{subtitle}</p>
      )}
    </div>
  );
}

