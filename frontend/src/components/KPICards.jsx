import React from 'react';
import { Layers, Columns, AlertCircle, Copy } from 'lucide-react';

export const KPICards = ({ kpis }) => {
  if (!kpis) return null;

  const cards = [
    {
      label: 'Total Rows',
      value: kpis.total_rows?.toLocaleString() ?? 0,
      icon: Layers,
      accent: 'text-white',
    },
    {
      label: 'Total Columns',
      value: kpis.total_columns?.toLocaleString() ?? 0,
      icon: Columns,
      accent: 'text-[#6EE7B7]',
    },
    {
      label: 'Missing Values',
      value: kpis.missing_values?.toLocaleString() ?? 0,
      icon: AlertCircle,
      accent: kpis.missing_values > 0 ? 'text-amber-400' : 'text-white',
    },
    {
      label: 'Duplicate Rows',
      value: kpis.duplicate_rows?.toLocaleString() ?? 0,
      icon: Copy,
      accent: kpis.duplicate_rows > 0 ? 'text-rose-400' : 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#14231E] to-[#0F1B17] border border-[#244536] rounded-xl p-5 hover:border-[#20C997] transition-all duration-200 shadow-lg shadow-black/30 group"
          >
            <div className="flex items-center justify-between text-[#A7B5AE] text-xs font-semibold uppercase tracking-wider mb-2">
              <span>{card.label}</span>
              <Icon size={16} className="text-[#20C997] group-hover:scale-110 transition-transform" />
            </div>
            <div className={`text-3xl font-extrabold tracking-tight ${card.accent}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
