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
    <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.07)] transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wider text-navy-400 uppercase">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-white font-mono">{value}</p>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
            trend === 'up' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-rose-400 bg-rose-950/60 border border-rose-500/30'
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
