import React from 'react';
import { UploadBox } from '../components/UploadBox';
import { KPICards } from '../components/KPICards';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { ColumnInfoTable } from '../components/ColumnInfoTable';
import { useDataset } from '../context/DatasetContext';
import { Sparkles, BarChart3, Cpu, FileText, HardDrive, Hash, Layers } from 'lucide-react';

export const HomePage = () => {
  const { metadata } = useDataset();

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#14231E] via-[#0D1512] to-[#080D0C] border border-[#244536] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#20C997]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> AI-Powered Analytics
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#6EE7B7] to-[#20C997]">DataPilot</span>
          </h1>
          <p className="text-lg font-medium text-[#20C997]">
            Your intelligent data analytics companion.
          </p>
          <p className="text-[#A7B5AE] text-sm md:text-base leading-relaxed">
            DataPilot automates modern data ingestion, profiling, and quality validation. Upload any raw CSV or Excel dataset to automatically uncover dimensions, analyze distributions, inspect schema types, and prepare for automated decision intelligence.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📤</span> Upload Dataset
          </h2>
          <span className="text-xs text-[#A7B5AE]">Supported: CSV, XLSX (Drag & Drop)</span>
        </div>
        <UploadBox />
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl bg-[#20C997]/5 border-l-4 border-[#20C997] text-xs text-[#A7B5AE] leading-relaxed">
        💡 <strong className="text-white">What happens after uploading:</strong> Your file is parsed in-memory, key quality metrics (missing values, duplicate rows) are computed dynamically, and an interactive schema preview is generated in real-time.
      </div>

      {/* Active Dataset Inspection (if loaded) */}
      {metadata && (
        <div className="space-y-6 pt-4 border-t border-[#244536]">
          {/* Metadata Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4 flex items-center gap-3">
              <FileText size={22} className="text-[#20C997] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">File Name</div>
                <div className="text-xs font-bold text-white truncate">{metadata.file_name}</div>
              </div>
            </div>
            <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4 flex items-center gap-3">
              <HardDrive size={22} className="text-[#20C997] shrink-0" />
              <div>
                <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">File Size</div>
                <div className="text-xs font-bold text-white">{metadata.file_size}</div>
              </div>
            </div>
            <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4 flex items-center gap-3">
              <Layers size={22} className="text-[#6EE7B7] shrink-0" />
              <div>
                <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Records</div>
                <div className="text-xs font-bold text-[#6EE7B7]">{metadata.records?.toLocaleString()}</div>
              </div>
            </div>
            <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4 flex items-center gap-3">
              <Hash size={22} className="text-[#6EE7B7] shrink-0" />
              <div>
                <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Features</div>
                <div className="text-xs font-bold text-[#6EE7B7]">{metadata.features} columns</div>
              </div>
            </div>
          </div>

          {/* Dynamic KPI Cards */}
          <KPICards kpis={metadata.kpis} />

          {/* Interactive Preview Table */}
          <DatasetPreviewTable />

          {/* Column Profile Table */}
          <ColumnInfoTable />
        </div>
      )}

      {/* Feature Capabilities Grid */}
      <div className="space-y-4 pt-4 border-t border-[#244536]">
        <h2 className="text-lg font-bold text-white">Platform Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 hover:border-[#20C997] transition-all duration-200 shadow-lg shadow-black/40 group">
            <div className="w-11 h-11 rounded-lg bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mb-4 group-hover:scale-105 transition-transform">
              <Sparkles size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automated Data Analysis</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed mb-4">
              Comprehensive exploratory data analysis, statistical summaries, correlation profiling, and automated anomaly detection.
            </p>
            <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded bg-[#244536]/60 text-[#6EE7B7] border border-[#244536]">
              Planned for Phase 2
            </span>
          </div>

          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 hover:border-[#20C997] transition-all duration-200 shadow-lg shadow-black/40 group">
            <div className="w-11 h-11 rounded-lg bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Interactive Visualizations</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed mb-4">
              Dynamic Plotly dashboards, custom charting engines, distribution plots, and executive visual metrics on demand.
            </p>
            <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded bg-[#244536]/60 text-[#6EE7B7] border border-[#244536]">
              Planned for Phase 2
            </span>
          </div>

          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 hover:border-[#20C997] transition-all duration-200 shadow-lg shadow-black/40 group">
            <div className="w-11 h-11 rounded-lg bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mb-4 group-hover:scale-105 transition-transform">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Machine Learning Predictions</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed mb-4">
              Automated model selection, feature engineering, classification, regression pipelines, and predictive intelligence.
            </p>
            <span className="inline-block text-[10px] font-semibold px-2.5 py-1 rounded bg-[#244536]/60 text-[#6EE7B7] border border-[#244536]">
              Planned for Phase 3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
