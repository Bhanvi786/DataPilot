import React from 'react';

export default function StatCard({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  description,
  accentColor = 'brand'
}) {
  return (
    <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-navy-500 uppercase">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-navy-900">{value}</p>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
            }`}>
            {change}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-navy-400">{description}</p>
      )}
    </div>
  );
}

