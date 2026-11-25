import React from 'react';
import { UploadBox } from '../components/UploadBox';
import { KPICards } from '../components/KPICards';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { useDataset } from '../context/DatasetContext';
import { ArrowRight, LayoutDashboard, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UploadPage = () => {
  const { metadata } = useDataset();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Upload Your Spreadsheet</h1>
        <p className="text-sm text-[#A7B5AE] mt-1">
          Upload an Excel or CSV file. DataPilot will immediately prepare your automatic dashboard.
        </p>
      </div>

      <UploadBox autoRedirect={true} />

      {metadata && (
        <div className="space-y-6 pt-6 border-t border-[#244536]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Loaded File Snapshot</h2>
              <p className="text-xs text-[#A7B5AE]">{metadata.file_name} ({metadata.records?.toLocaleString()} rows)</p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#20C997] text-[#080D0C] font-extrabold text-xs hover:bg-[#6EE7B7] transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard size={14} />
              <span>Go to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <KPICards kpis={metadata.kpis} />
          <DatasetPreviewTable />
        </div>
      )}
    </div>
  );
};

export default UploadPage;
