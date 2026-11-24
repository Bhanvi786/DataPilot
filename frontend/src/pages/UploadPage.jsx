import React from 'react';
import { UploadBox } from '../components/UploadBox';
import { KPICards } from '../components/KPICards';
import { DatasetPreviewTable } from '../components/DatasetPreviewTable';
import { ColumnInfoTable } from '../components/ColumnInfoTable';
import { useDataset } from '../context/DatasetContext';

export const UploadPage = () => {
  const { metadata } = useDataset();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Upload Dataset</h1>
        <p className="text-sm text-[#A7B5AE] mt-1">
          Upload your tabular data file (CSV or XLSX). DataPilot dynamically verifies file structure, character encoding, and content.
        </p>
      </div>

      <UploadBox />

      {metadata && (
        <div className="space-y-6 pt-6 border-t border-[#244536]">
          <KPICards kpis={metadata.kpis} />
          <DatasetPreviewTable />
          <ColumnInfoTable />
        </div>
      )}
    </div>
  );
};
