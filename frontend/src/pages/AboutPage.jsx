import React from 'react';
import { Layers, Sparkles, Database, ShieldCheck } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#14231E] via-[#0D1512] to-[#080D0C] border border-[#244536] rounded-2xl p-8 md:p-10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} /> SaaS Architecture
        </div>
        <h1 className="text-3xl font-extrabold text-white">DataPilot Platform</h1>
        <p className="text-lg font-medium text-[#20C997]">
          Turn Raw Data Into Intelligence.
        </p>
        <p className="text-sm text-[#A7B5AE] leading-relaxed max-w-2xl">
          DataPilot is an AI-powered automated data analytics platform designed to bridge the gap between raw data collection and actionable business intelligence. Built on a modular FastAPI backend and responsive React frontend.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="bg-[#080D0C] border border-[#244536] rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-[#6EE7B7] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#20C997]"></span> Phase 1 (Active)
            </div>
            <div className="text-xs text-[#A7B5AE]">
              React + FastAPI migration, CSV & Excel ingest, dynamic KPIs, table viewer, column profiling.
            </div>
          </div>

          <div className="bg-[#080D0C] border border-[#244536] rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-[#A7B5AE] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A7B5AE]/40"></span> Phase 2 (Upcoming)
            </div>
            <div className="text-xs text-[#A7B5AE]">
              Automated exploratory data analysis, interactive Plotly charts, correlation matrices, and distribution graphs.
            </div>
          </div>

          <div className="bg-[#080D0C] border border-[#244536] rounded-xl p-5 space-y-2">
            <div className="text-xs font-bold text-[#A7B5AE] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A7B5AE]/40"></span> Phase 3 (Upcoming)
            </div>
            <div className="text-xs text-[#A7B5AE]">
              AutoML predictive models, automated feature engineering, and executive PDF/HTML reports.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
