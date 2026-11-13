import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Hash, Type, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  pageSize = 5,
  showPagination = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('ALL');

  // Filter columns based on user search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const lower = searchTerm.toLowerCase();
    return data.filter((row) => {
      if (selectedColumnFilter !== 'ALL') {
        const val = row[selectedColumnFilter];
        return val !== undefined && String(val).toLowerCase().includes(lower);
      }
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      );
    });
  }, [data, searchTerm, selectedColumnFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-navy-200 shadow-subtle overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-navy-200/80 bg-navy-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records across all fields..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-navy-500">Filter column:</span>
          <select
            value={selectedColumnFilter}
            onChange={(e) => {
              setSelectedColumnFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-navy-200 rounded-lg px-2.5 py-1.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
          >
            <option value="ALL">All Columns</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-navy-50/70 border-b border-navy-200">
              <th className="py-3 px-4 font-semibold text-navy-600 uppercase tracking-wider text-[11px] w-12 text-center">
                #
              </th>
              {columns.map((col) => (
                <th key={col.name} className="py-3 px-4 font-semibold text-navy-700 tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span>{col.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${col.type === 'number'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                      {col.type === 'number' ? 'num' : 'str'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {currentRows.length > 0 ? (
              currentRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-navy-400">
                    {startIndex + idx + 1}
                  </td>
                  {columns.map((col) => {
                    const val = row[col.name];
                    return (
                      <td key={col.name} className="py-3 px-4 text-navy-800 font-mono">
                        {val !== undefined && val !== null ? String(val) : (
                          <span className="text-navy-300 italic">null</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-navy-400">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-navy-300" />
                  No matching records found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="p-3 border-t border-navy-200/80 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-500">
          <div>
            Showing <span className="font-semibold text-navy-800">{filteredData.length === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-semibold text-navy-800">
              {Math.min(startIndex + pageSize, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-navy-800">{filteredData.length}</span> rows
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-navy-200 hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-navy-200 hover:bg-navy-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

