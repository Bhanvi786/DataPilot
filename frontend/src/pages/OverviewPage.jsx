import React from 'react';
import { KPICards } from '../components/KPICards';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { ColumnInfoTable } from '../components/ColumnInfoTable';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';
import { Database, UploadCloud, LayoutDashboard, ArrowRight } from 'lucide-react';

export const OverviewPage = () => {
  const { metadata } = useDataset();

  if (!metadata) {
    return (
      <div className="bg-[#0D1512] border border-[#244536] rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mx-auto">
          <Database size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Dataset Loaded Yet</h2>
        <p className="text-xs text-[#A7B5AE] max-w-md mx-auto">
          Please upload a CSV or Excel dataset to inspect dynamic metrics, tables, and column profiles.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#20C997] text-[#080D0C] font-extrabold text-xs hover:bg-[#6EE7B7] transition-all"
        >
          <UploadCloud size={16} /> Upload Spreadsheet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#244536] gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Table Preview & Column Summary</h1>
          <p className="text-xs text-[#A7B5AE] mt-1">
            File: <strong className="text-white">{metadata.file_name}</strong> • {metadata.records?.toLocaleString()} rows • {metadata.features} columns
          </p>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-[#20C997] hover:bg-[#6EE7B7] text-[#080D0C] font-extrabold text-xs transition-all shadow-md shadow-[#20C997]/20 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <LayoutDashboard size={14} /> View Dashboard <ArrowRight size={14} />
        </Link>
      </div>

      <KPICards kpis={metadata.kpis} />
      <DatasetPreviewTable />
      <ColumnInfoTable />
    </div>
  );
};

export default OverviewPage;
