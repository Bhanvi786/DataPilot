import React from 'react';

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-xl border border-navy-200/80 shadow-subtle p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-navy-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="shrink-0">{action}</div>
        )}
      </div>
      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

