import React, { useState } from 'react';
import { getDatasetPreview } from '../services/api';
import { useDataset } from '../context/DatasetContext';

export const DatasetPreviewTable = () => {
  const { datasetId, previewRows, setPreviewRows } = useDataset();
  const [rowLimit, setRowLimit] = useState(15);
  const [loading, setLoading] = useState(false);

  if (!previewRows || previewRows.length === 0) {
    return null;
  }

  const columns = Object.keys(previewRows[0] || {});

  const handleLimitChange = async (newLimit) => {
    setRowLimit(newLimit);
    if (!datasetId) return;
    setLoading(true);
    try {
      const data = await getDatasetPreview(datasetId, newLimit);
      setPreviewRows(data.rows);
    } catch (err) {
      console.error('Error fetching preview with new limit', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 mt-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#244536] gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🔍</span> Dataset Preview
          </h3>
          <p className="text-xs text-[#A7B5AE] mt-0.5">
            Interactive table rendering first {previewRows.length} records dynamically
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A7B5AE]">Rows shown:</span>
          <div className="flex items-center gap-1.5">
            {[10, 15, 20, 50].map((num) => (
              <button
                key={num}
                onClick={() => handleLimitChange(num)}
                disabled={loading}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  rowLimit === num
                    ? 'bg-[#20C997] text-[#080D0C] font-bold'
                    : 'bg-[#0D1512] text-[#A7B5AE] border border-[#244536] hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mt-4 max-h-[480px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#0D1512] sticky top-0 z-10 border-b border-[#244536]">
            <tr>
              <th className="py-3 px-4 font-bold text-[#6EE7B7] uppercase tracking-wider w-12 text-center">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="py-3 px-4 font-bold text-white whitespace-nowrap uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#244536]/60">
            {previewRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#0D1512]/60 transition-colors font-mono"
              >
                <td className="py-2.5 px-4 text-[#A7B5AE] text-center bg-[#0D1512]/30 font-sans">
                  {idx + 1}
                </td>
                {columns.map((col) => {
                  const val = row[col];
                  return (
                    <td
                      key={col}
                      className="py-2.5 px-4 whitespace-nowrap text-[#FFFFFF]"
                    >
                      {val === null || val === undefined ? (
                        <span className="text-red-400/80 italic font-sans text-[11px]">NaN</span>
                      ) : typeof val === 'boolean' ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${val ? 'bg-[#20C997]/20 text-[#6EE7B7]' : 'bg-red-950/40 text-red-300'}`}>
                          {val ? 'TRUE' : 'FALSE'}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
