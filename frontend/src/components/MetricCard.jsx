import React from 'react';

export default function MetricCard({ 
  label, 
  value, 
  subtitle, 
  status, 
  badge 
}) {
  return (
    <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-4 shadow-subtle hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-navy-400">{label}</span>
        {badge && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#161c24] text-emerald-400 border border-emerald-500/20">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 text-xl font-bold text-white font-mono">
        {value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-navy-400">{subtitle}</p>
      )}
    </div>
  );
}
