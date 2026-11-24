import React from 'react';
import { KPICards } from '../components/KPICards';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { ColumnInfoTable } from '../components/ColumnInfoTable';
import { useDataset } from '../context/DatasetContext';
import { Link } from 'react-router-dom';
import { Database, UploadCloud } from 'lucide-react';

export const OverviewPage = () => {
  const { metadata } = useDataset();

  if (!metadata) {
    return (
      <div className="bg-[#14231E] border border-[#244536] rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mx-auto">
          <Database size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Dataset Loaded Yet</h2>
        <p className="text-sm text-[#A7B5AE] max-w-md mx-auto">
          Please upload a CSV or Excel dataset to inspect dynamic metrics, tables, and column profiles.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#20C997] text-[#080D0C] font-bold text-sm hover:bg-[#6EE7B7] transition-all"
        >
          <UploadCloud size={18} /> Upload Dataset
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Data Overview & Schema Intelligence</h1>
        <p className="text-sm text-[#A7B5AE] mt-1">
          Active file: <strong className="text-white">{metadata.file_name}</strong> ({metadata.file_size})
        </p>
      </div>

      <KPICards kpis={metadata.kpis} />
      <DatasetPreviewTable />
      <ColumnInfoTable />
    </div>
  );
};
