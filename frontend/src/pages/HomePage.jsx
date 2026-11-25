import React from 'react';
import { UploadBox } from '../components/UploadBox';
import { useDataset } from '../context/DatasetContext';
import { Sparkles, BarChart3, LayoutDashboard, FileSpreadsheet, ArrowRight, ShieldCheck, Zap, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { metadata } = useDataset();

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* 1. Main Welcome Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider">
          <Sparkles size={14} /> Automatic Dashboard Generator
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Turn Your Data Into <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#6EE7B7] to-[#20C997]">
            Beautiful Dashboards
          </span>
        </h1>

        <p className="text-[#A7B5AE] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your Excel or CSV file and let DataPilot automatically transform your data into meaningful insights and interactive visualisations.
        </p>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <div className="bg-[#0D1512] border border-[#244536] rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#20C997]/10 rounded-full blur-3xl pointer-events-none"></div>
        <UploadBox autoRedirect={true} />
        <div className="flex flex-wrap items-center justify-between text-xs text-[#A7B5AE] px-2 pt-2 border-t border-[#244536]/60">
          <span className="flex items-center gap-1.5">
            <FileSpreadsheet size={14} className="text-[#20C997]" /> Supported formats: .csv, .xlsx, .xls
          </span>
          <span>Max file size: 50MB</span>
        </div>
      </div>

      {/* 3. Three-Step Visual Explanation */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">How DataPilot Works</h2>
          <p className="text-xs text-[#A7B5AE] mt-1">Zero technical configuration required — completely automatic</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-6 relative group hover:border-[#20C997]/50 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#14231E] border border-[#244536] flex items-center justify-center text-[#20C997] font-black text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">Upload Your Data</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              Upload any raw Excel or CSV spreadsheet. Never worry about formatting or pre-cleaning beforehand.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-6 relative group hover:border-[#20C997]/50 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#14231E] border border-[#244536] flex items-center justify-center text-[#6EE7B7] font-black text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">Automatic Analysis</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              DataPilot detects metrics, categories, dates and relationships in the background without needing your guidance.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-6 relative group hover:border-[#20C997]/50 transition-all shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#14231E] border border-[#244536] flex items-center justify-center text-[#20C997] font-black text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">Explore Your Dashboard</h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              Get an instant dashboard with vibrant graphs, dynamic KPI cards, plain English observations, and exportable reports.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Active Project Banner if dataset loaded */}
      {metadata && (
        <div className="bg-[#14231E] border border-[#20C997]/50 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#20C997]/20 border border-[#20C997]/40 flex items-center justify-center text-[#20C997]">
              <Database size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#A7B5AE] uppercase tracking-wider">Active Loaded Dataset</div>
              <div className="text-base font-extrabold text-white">{metadata.file_name}</div>
              <div className="text-xs text-[#6EE7B7]">
                {metadata.records?.toLocaleString()} records • {metadata.features} attributes analyzed
              </div>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-[#20C997] hover:bg-[#6EE7B7] text-[#080D0C] font-extrabold text-xs transition-all shadow-lg shadow-[#20C997]/20 flex items-center gap-2"
          >
            <span>Open Dashboard</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
