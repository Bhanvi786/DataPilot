import React from 'react';
import { useDataset } from '../context/DatasetContext';

export const ColumnInfoTable = () => {
  const { columnsData } = useDataset();

  if (!columnsData || columnsData.length === 0) return null;

  return (
    <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 mt-8 shadow-xl">
      <div className="pb-4 border-b border-[#244536]">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📋</span> Column Schema & Attributes
        </h3>
        <p className="text-xs text-[#A7B5AE] mt-0.5">
          Detailed breakdown of data types, missing statistics, and cardinality
        </p>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#0D1512] border-b border-[#244536]">
            <tr>
              <th className="py-3 px-4 font-bold text-white uppercase tracking-wider">Column Name</th>
              <th className="py-3 px-4 font-bold text-white uppercase tracking-wider">Data Type</th>
              <th className="py-3 px-4 font-bold text-white uppercase tracking-wider">Missing Values</th>
              <th className="py-3 px-4 font-bold text-white uppercase tracking-wider">Unique Values</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#244536]/60">
            {columnsData.map((col, idx) => (
              <tr key={idx} className="hover:bg-[#0D1512]/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-white">
                  {col.column_name}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-[#244536]/60 text-[#6EE7B7] font-mono text-[11px] border border-[#244536]">
                    {col.data_type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={
                      col.missing_values_count > 0
                        ? 'text-amber-400 font-semibold'
                        : 'text-[#A7B5AE]'
                    }
                  >
                    {col.missing_values_formatted}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-white">
                  {col.unique_values?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
