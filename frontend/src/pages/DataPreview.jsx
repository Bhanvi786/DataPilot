import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Table,
  Database,
  ArrowRight,
  BarChart3,
  Filter,
  SlidersHorizontal,
  Layers,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import { apiService } from '../services/api';
import { useDataset } from '../context/DatasetContext';

export default function DataPreview() {
  const { activeDataset, clearActiveDataset } = useDataset();
  const navigate = useNavigate();

  // Paginated data state from backend
  const [pageData, setPageData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Client-side quick filter on current page rows
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColFilter, setSelectedColFilter] = useState('ALL');

  // Load paginated data whenever activeDataset, currentPage, or pageSize changes
  useEffect(() => {
    if (!activeDataset?.dataset_id) return;

    let mounted = true;
    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiService.getDatasetPreview(
          activeDataset.dataset_id,
          currentPage,
          pageSize
        );
        if (mounted) {
          setPageData(result);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch dataset preview:', err);
          setError(err.detail || err.message || 'Failed to load dataset rows.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPage();
    return () => {
      mounted = false;
    };
  }, [activeDataset?.dataset_id, currentPage, pageSize]);

  // If no dataset is uploaded yet, render empty state
  if (!activeDataset) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <PageHeader
          title="Data Preview & Schema"
          subtitle="Inspect columns, data types, and tabular records loaded from the backend."
          badge="Awaiting Upload"
        />

        <div className="bg-[#0e131a] rounded-2xl border border-[#1a212d] p-12 text-center shadow-subtle space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Dataset Uploaded Yet</h3>
          <p className="text-xs text-navy-400 max-w-md mx-auto leading-relaxed">
            Upload any CSV or Excel file to preview its actual rows, inspect inferred column data types, and verify dataset integrity.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload a Dataset Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const columns = pageData?.columns || activeDataset.columns || [];
  const rows = pageData?.rows || activeDataset.preview_rows || [];
  const totalRows = pageData?.total_rows ?? activeDataset.row_count ?? 0;
  const totalPages = pageData?.total_pages ?? Math.max(1, Math.ceil(totalRows / pageSize));

  // Search filter applied to current page rows
  const filteredRows = rows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    if (selectedColFilter !== 'ALL') {
      const val = row[selectedColFilter];
      return val !== undefined && val !== null && String(val).toLowerCase().includes(lower);
    }
    return Object.values(row).some((val) =>
      val !== undefined && val !== null && String(val).toLowerCase().includes(lower)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Data Preview & Inferred Schema"
        subtitle={`Viewing actual uploaded dataset: ${activeDataset.filename}. Inspect columns, non-null counts, and paginated records from the backend.`}
        badge={`ID: ${activeDataset.dataset_id}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete and unload this dataset?')) {
                  clearActiveDataset();
                  navigate('/upload');
                }
              }}
              className="p-2 rounded-lg border border-[#1a212d] text-navy-400 hover:text-rose-400 hover:bg-[#161c24] transition-colors"
              title="Delete dataset"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <NavLink
              to="/upload"
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#1f2836] bg-[#0e131a] hover:bg-[#141b24] text-navy-300 transition-colors"
            >
              Upload Different File
            </NavLink>

            <NavLink
              to="/analysis"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
            >
              Analyze EDA
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        }
      />

      {/* Dataset Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Rows"
          value={totalRows.toLocaleString()}
          subtitle="Processed by Pandas"
          badge="Rows"
        />
        <MetricCard
          label="Total Columns"
          value={columns.length}
          subtitle="Dynamic Features"
          badge="Columns"
        />
        <MetricCard
          label="File Size"
          value={activeDataset.size || 'N/A'}
          subtitle={`Type: ${activeDataset.file_type || 'CSV'}`}
          badge={activeDataset.file_type || 'CSV'}
        />
        <MetricCard
          label="Backend Storage"
          value="Loaded"
          subtitle={activeDataset.dataset_id}
          badge="Active"
        />
      </div>

      {/* Dynamic Column Schema Badges */}
      <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">
            Dynamically Inferred Column Types ({columns.length})
          </h3>
          <span className="text-[11px] text-emerald-400">
            Evaluated by backend dtype parser
          </span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
          {columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a212d] bg-[#0a0d12] text-xs text-white font-mono"
            >
              <span className="font-semibold text-emerald-400">{col.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                col.type === 'number'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : col.type === 'datetime'
                  ? 'bg-teal-950 text-teal-300 border border-teal-500/30'
                  : 'bg-[#18202c] text-navy-300 border border-[#2d3748]'
              }`}>
                {col.type}
              </span>
              {col.missing > 0 && (
                <span className="text-[10px] text-amber-400 font-sans" title={`${col.missing} missing values`}>
                  • {col.missing} null
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Server Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-2.5 py-1 bg-black/40 border border-rose-500/30 rounded text-rose-400 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabular Records Explorer Component */}
      <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] shadow-subtle overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 border-b border-[#1a212d] bg-[#0a0d12]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in current page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0e131a] border border-[#1f2836] rounded-lg text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400">Filter column:</span>
              <select
                value={selectedColFilter}
                onChange={(e) => setSelectedColFilter(e.target.value)}
                className="text-xs bg-[#0e131a] border border-[#1f2836] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
              >
                <option value="ALL">All Columns</option>
                {columns.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-navy-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs bg-[#0e131a] border border-[#1f2836] rounded-lg px-2.5 py-1.5 text-white font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="overflow-x-auto min-h-[220px] relative">
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-[#0e131a] px-4 py-2 rounded-xl shadow-lg border border-emerald-500/30">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                Loading dataset rows from backend...
              </div>
            </div>
          )}

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0a0d12] border-b border-[#1a212d]">
                <th className="py-3 px-4 font-semibold text-navy-400 uppercase tracking-wider text-[11px] w-14 text-center sticky left-0 bg-[#0a0d12] z-10 border-r border-[#1a212d]">
                  #
                </th>
                {columns.map((col) => (
                  <th key={col.name} className="py-3 px-4 font-semibold text-white tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-tight ${
                        col.type === 'number'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : col.type === 'datetime'
                          ? 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                          : 'bg-[#18202c] text-navy-300 border border-[#2d3748]'
                      }`}>
                        {col.type === 'number' ? 'num' : col.type === 'datetime' ? 'date' : 'str'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a212d]">
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => {
                  const globalRowIndex = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-[#121721] transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-navy-400 sticky left-0 bg-[#0e131a] border-r border-[#1a212d]">
                        {globalRowIndex}
                      </td>
                      {columns.map((col) => {
                        const val = row[col.name];
                        return (
                          <td key={col.name} className="py-3 px-4 text-white font-mono whitespace-nowrap">
                            {val !== undefined && val !== null ? (
                              String(val)
                            ) : (
                              <span className="text-navy-400 italic">null</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-navy-400">
                    <AlertCircle className="w-5 h-5 mx-auto mb-1 text-navy-400" />
                    {searchTerm ? `No records matching "${searchTerm}" on this page.` : 'No records available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Footer */}
        <div className="p-3 border-t border-[#1a212d] bg-[#0a0d12]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-400">
          <div>
            Showing rows <span className="font-semibold text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-white">
              {Math.min(currentPage * pageSize, totalRows)}
            </span>{' '}
            of <span className="font-semibold text-emerald-400 font-mono">{totalRows.toLocaleString()}</span> total records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-[#1f2836] bg-[#0e131a] hover:bg-[#18202c] disabled:opacity-30 disabled:hover:bg-[#0e131a] transition-all text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-2 text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-lg border border-[#1f2836] bg-[#0e131a] hover:bg-[#18202c] disabled:opacity-30 disabled:hover:bg-[#0e131a] transition-all text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
