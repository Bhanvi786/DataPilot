import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useDataset } from '../context/DatasetContext';
import {
  getDashboardOverview,
  evaluateDashboardFilters,
  getDashboardChartData,
  processCrossFilter,
  saveDashboardConfig,
  exportDashboard
} from '../services/api';
import {
  LayoutDashboard,
  Filter,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Calendar,
  Sliders,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  X,
  Check,
  ChevronDown,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  MousePointerClick
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NaturalSearchEngine } from '../components/NaturalSearchEngine';

const darkPlotLayout = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'Plus Jakarta Sans, sans-serif', color: '#A7B5AE' },
  margin: { t: 30, r: 25, b: 45, l: 45 },
  xaxis: {
    gridcolor: '#1F382C',
    linecolor: '#244536',
    tickfont: { color: '#A7B5AE', size: 10 },
    zerolinecolor: '#244536'
  },
  yaxis: {
    gridcolor: '#1F382C',
    linecolor: '#244536',
    tickfont: { color: '#A7B5AE', size: 10 },
    zerolinecolor: '#244536'
  }
};

export const AnalyticsDashboard = () => {
  const { datasetId } = useDataset();
  const [version, setVersion] = useState('cleaned');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Overview payload
  const [dashboardData, setDashboardData] = useState(null);
  const [datasetName, setDatasetName] = useState('Dataset');
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredRecords, setFilteredRecords] = useState(0);

  // KPI & Chart States
  const [kpiCards, setKpiCards] = useState([]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [chartDataMap, setChartDataMap] = useState({});
  const [availableFilters, setAvailableFilters] = useState([]);

  // Active Filter state
  // key: column, value: Array for multi-select, {min, max} for num, {start, end} for date
  const [activeFilters, setActiveFilters] = useState({});

  // Cross-filter selection state
  const [activeCrossFilter, setActiveCrossFilter] = useState(null);

  // Modal states for adding KPI & Chart
  const [showAddKpiModal, setShowAddKpiModal] = useState(false);
  const [newKpiTitle, setNewKpiTitle] = useState('');
  const [newKpiCol, setNewKpiCol] = useState('');
  const [newKpiAgg, setNewKpiAgg] = useState('sum');

  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [newChartTitle, setNewChartTitle] = useState('');
  const [newChartType, setNewChartType] = useState('bar');
  const [newChartX, setNewChartX] = useState('');
  const [newChartY, setNewChartY] = useState('');
  const [newChartAgg, setNewChartAgg] = useState('sum');
  const [newChartGrid, setNewChartGrid] = useState('half');

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Last updated info
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Bootstrap Dashboard
  const loadDashboard = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      const data = await getDashboardOverview(datasetId, version);
      setDashboardData(data);
      setDatasetName(data.dataset_name || 'Dataset');
      setTotalRecords(data.total_records || 0);
      setFilteredRecords(data.total_records || 0);
      setAvailableFilters(data.available_filters || []);

      const cfg = data.config || {};
      const kpis = data.kpis || cfg.kpis || [];
      const charts = cfg.charts || [];

      setKpiCards(kpis);
      setChartConfigs(charts);
      setActiveFilters({});
      setActiveCrossFilter(null);
      setLastUpdated(new Date().toLocaleTimeString());

      // Fetch all charts data initially
      await refreshAllCharts(charts, {}, version);
    } catch (err) {
      console.error('Failed to load dashboard overview', err);
    } finally {
      setLoading(false);
    }
  }, [datasetId, version]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Execute chart calls concurrently across active filtered dataset
  const refreshAllCharts = async (charts, filters, currentVer) => {
    if (!datasetId || !charts || charts.length === 0) return;
    try {
      const promises = charts.map(ch =>
        getDashboardChartData(datasetId, { filters, chart_config: ch }, currentVer)
      );
      const responses = await Promise.all(promises);
      const newMap = {};
      responses.forEach((res, idx) => {
        const chId = charts[idx].id;
        newMap[chId] = res.chart_data;
      });
      setChartDataMap(newMap);
    } catch (err) {
      console.error('Failed to refresh charts', err);
    }
  };

  // Re-evaluate filters across KPIs and all charts
  const handleApplyFilters = async (updatedFilters) => {
    if (!datasetId) return;
    setRefreshing(true);
    try {
      // 1. Evaluate filter records and KPIs
      const kpiSpecs = kpiCards.map(k => ({
        id: k.id,
        title: k.title,
        column: k.column,
        aggregation: k.aggregation,
        format: k.format
      }));

      const filterRes = await evaluateDashboardFilters(
        datasetId,
        { filters: updatedFilters, kpi_specs: kpiSpecs },
        version
      );

      setFilteredRecords(filterRes.filtered_records);
      if (filterRes.kpis && filterRes.kpis.length > 0) {
        setKpiCards(filterRes.kpis);
      }

      // 2. Refresh all active charts
      await refreshAllCharts(chartConfigs, updatedFilters, version);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error applying filters', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter setters
  const handleCategoricalFilterChange = (col, val) => {
    const current = activeFilters[col] || [];
    let updated;
    if (current.includes(val)) {
      updated = current.filter(item => item !== val);
    } else {
      updated = [...current, val];
    }

    const nextFilters = { ...activeFilters };
    if (updated.length > 0) {
      nextFilters[col] = updated;
    } else {
      delete nextFilters[col];
    }
    setActiveFilters(nextFilters);
    handleApplyFilters(nextFilters);
  };

  const handleNumericalFilterChange = (col, bound, val) => {
    const current = activeFilters[col] || {};
    const updated = { ...current, [bound]: val === '' ? undefined : Number(val) };
    if (updated.min === undefined && updated.max === undefined) {
      const nextFilters = { ...activeFilters };
      delete nextFilters[col];
      setActiveFilters(nextFilters);
      handleApplyFilters(nextFilters);
    } else {
      const nextFilters = { ...activeFilters, [col]: updated };
      setActiveFilters(nextFilters);
      handleApplyFilters(nextFilters);
    }
  };

  const handleDateFilterChange = (col, bound, val) => {
    const current = activeFilters[col] || {};
    const updated = { ...current, [bound]: val || undefined };
    if (!updated.start && !updated.end) {
      const nextFilters = { ...activeFilters };
      delete nextFilters[col];
      setActiveFilters(nextFilters);
      handleApplyFilters(nextFilters);
    } else {
      const nextFilters = { ...activeFilters, [col]: updated };
      setActiveFilters(nextFilters);
      handleApplyFilters(nextFilters);
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setActiveCrossFilter(null);
    handleApplyFilters({});
  };

  // Cross filtering from chart clicks
  const handleChartPointClick = async (column, value) => {
    if (!column || value === undefined) return;
    try {
      const res = await processCrossFilter(
        datasetId,
        {
          active_filters: activeFilters,
          column,
          value
        },
        version
      );

      const updated = res.updated_filters;
      setActiveFilters(updated);
      setActiveCrossFilter(res.cross_filter_active ? updated.__cross_filter__ : null);
      await handleApplyFilters(updated);
    } catch (err) {
      console.error('Failed to process cross filter', err);
    }
  };

  const handleClearCrossFilter = async () => {
    if (!activeFilters.__cross_filter__) return;
    const nextFilters = { ...activeFilters };
    delete nextFilters.__cross_filter__;
    setActiveFilters(nextFilters);
    setActiveCrossFilter(null);
    await handleApplyFilters(nextFilters);
  };

  // Add KPI Card
  const handleAddKpi = () => {
    if (!newKpiCol) return;
    const newKpi = {
      id: `kpi_user_${Date.now()}`,
      title: newKpiTitle.trim() || `${newKpiAgg.toUpperCase()} of ${newKpiCol}`,
      column: newKpiCol,
      aggregation: newKpiAgg,
      format: 'auto'
    };
    const updated = [...kpiCards, newKpi];
    setKpiCards(updated);
    setShowAddKpiModal(false);
    setNewKpiTitle('');
    // Save config and recalculate
    handleApplyFilters(activeFilters);
    saveCurrentConfig(updated, chartConfigs);
  };

  const handleRemoveKpi = (id) => {
    const updated = kpiCards.filter(k => k.id !== id);
    setKpiCards(updated);
    saveCurrentConfig(updated, chartConfigs);
  };

  // Add Chart
  const handleAddChart = async () => {
    if (!newChartX) return;
    const newChart = {
      id: `chart_user_${Date.now()}`,
      title: newChartTitle.trim() || `${newChartType.toUpperCase()} Chart`,
      type: newChartType,
      x: newChartX,
      y: newChartY || undefined,
      aggregation: newChartAgg,
      grid_col: newChartGrid
    };
    const updated = [...chartConfigs, newChart];
    setChartConfigs(updated);
    setShowAddChartModal(false);
    setNewChartTitle('');
    await refreshAllCharts(updated, activeFilters, version);
    saveCurrentConfig(kpiCards, updated);
  };

  const handleRemoveChart = (id) => {
    const updated = chartConfigs.filter(c => c.id !== id);
    setChartConfigs(updated);
    const updatedData = { ...chartDataMap };
    delete updatedData[id];
    setChartDataMap(updatedData);
    saveCurrentConfig(kpiCards, updated);
  };

  const saveCurrentConfig = async (kpis, charts) => {
    if (!datasetId) return;
    try {
      await saveDashboardConfig(datasetId, {
        dataset_id: datasetId,
        title: 'Interactive Analytics Dashboard',
        kpis: kpis.map(k => ({ id: k.id, title: k.title, column: k.column, aggregation: k.aggregation, format: k.format })),
        charts
      });
    } catch (err) {
      console.error('Failed to save dashboard configuration', err);
    }
  };

  // Exports
  const handleExport = async (format) => {
    if (!datasetId) return;
    setShowExportMenu(false);
    try {
      if (format === 'report') {
        const html = await exportDashboard(
          datasetId,
          {
            format: 'report_html',
            filters: activeFilters,
            kpis: kpiCards,
            charts: chartConfigs.map(c => ({
              ...c,
              ...(chartDataMap[c.id] || {})
            }))
          },
          version
        );
        // Open report in new window for instant printing/saving to PDF
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
      } else {
        const blob = await exportDashboard(
          datasetId,
          {
            format,
            filters: activeFilters
          },
          version
        );
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${datasetName.split('.')[0]}_filtered.${format === 'excel' ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(activeFilters).forEach(([k, v]) => {
      if (k === '__cross_filter__') count += 1;
      else if (Array.isArray(v) && v.length > 0) count += 1;
      else if (typeof v === 'object' && v && (v.min !== undefined || v.max !== undefined || v.start || v.end)) count += 1;
      else if (v !== undefined && v !== '') count += 1;
    });
    return count;
  }, [activeFilters]);

  const allColumns = dashboardData?.column_breakdown?.all_columns || [];
  const numColumns = dashboardData?.column_breakdown?.numerical || [];
  const catColumns = dashboardData?.column_breakdown?.categorical || [];
  const dateColumns = dashboardData?.column_breakdown?.datetime || [];

  if (!datasetId) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-12 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#14231E] border border-[#244536] flex items-center justify-center mx-auto mb-4 text-[#20C997]">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Dataset Selected</h2>
          <p className="text-sm text-[#A7B5AE] max-w-md mx-auto mb-6">
            Upload or select a structured dataset to explore the Interactive Analytics Dashboard.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#20C997] text-[#080D0C] font-bold text-sm hover:bg-[#6EE7B7] transition-all shadow-lg shadow-[#20C997]/20"
          >
            Upload Dataset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* A. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#244536] gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
              <LayoutDashboard size={26} className="text-[#20C997]" /> Analytics Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#20C997]/15 border border-[#20C997]/40 text-[#20C997] text-xs font-mono font-bold">
              Phase 4 Interactive
            </span>
          </div>
          <p className="text-xs text-[#A7B5AE] mt-1 flex items-center gap-2">
            Dataset: <strong className="text-white">{datasetName}</strong>
            <span>•</span>
            <span>Last synchronized: {lastUpdated}</span>
            {refreshing && (
              <span className="text-[#20C997] flex items-center gap-1 font-mono">
                <RefreshCw size={12} className="animate-spin" /> Updating...
              </span>
            )}
          </p>
        </div>

        {/* Header Controls: Version Selector, Refresh, Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Version Selector */}
          <div className="flex items-center bg-[#0D1512] p-1 rounded-xl border border-[#244536]">
            <button
              onClick={() => { setVersion('cleaned'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${version === 'cleaned'
                ? 'bg-[#20C997] text-[#080D0C] shadow-md shadow-[#20C997]/20'
                : 'text-[#A7B5AE] hover:text-white'
                }`}
            >
              Cleaned Data
            </button>
            <button
              onClick={() => { setVersion('original'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${version === 'original'
                ? 'bg-[#20C997] text-[#080D0C] shadow-md shadow-[#20C997]/20'
                : 'text-[#A7B5AE] hover:text-white'
                }`}
            >
              Original Data
            </button>
          </div>

          {/* Synchronize */}
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0D1512] border border-[#244536] text-[#A7B5AE] hover:text-[#20C997] hover:border-[#20C997] transition-all"
            title="Reload Dashboard"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#14231E] border border-[#20C997]/50 text-white font-bold text-xs hover:border-[#20C997] transition-all shadow-md shadow-black/40"
            >
              <Download size={14} className="text-[#20C997]" />
              <span>Export</span>
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0D1512] border border-[#244536] rounded-xl shadow-2xl py-1.5 z-40">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#A7B5AE] hover:text-white hover:bg-[#14231E] flex items-center gap-2"
                >
                  <FileText size={14} className="text-[#20C997]" /> Filtered CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#A7B5AE] hover:text-white hover:bg-[#14231E] flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} className="text-[#6EE7B7]" /> Filtered Excel (.xlsx)
                </button>
                <div className="border-t border-[#244536] my-1"></div>
                <button
                  onClick={() => handleExport('report')}
                  className="w-full text-left px-3.5 py-2 text-xs text-white hover:bg-[#14231E] font-semibold flex items-center gap-2"
                >
                  <LayoutDashboard size={14} className="text-[#20C997]" /> Print / PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NATURAL LANGUAGE SEARCH ENGINE */}
      <NaturalSearchEngine datasetId={datasetId} version={version} />

      {/* B. DYNAMIC KPI SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A7B5AE] flex items-center gap-2">
            <Activity size={14} className="text-[#20C997]" /> Business Performance Indicators
            <span className="text-[11px] font-mono text-white">
              ({filteredRecords.toLocaleString()} of {totalRecords.toLocaleString()} records)
            </span>
          </div>

          <button
            onClick={() => setShowAddKpiModal(true)}
            className="flex items-center gap-1.5 text-xs text-[#20C997] hover:text-[#6EE7B7] font-bold"
          >
            <Plus size={14} /> Add KPI Card
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-[#0D1512] border border-[#244536] rounded-xl p-4.5 relative group hover:border-[#20C997]/60 transition-all shadow-lg shadow-black/20"
            >
              <div className="flex items-center justify-between text-xs text-[#A7B5AE] mb-1">
                <span className="font-semibold uppercase tracking-wider truncate max-w-[170px]" title={kpi.title}>
                  {kpi.title}
                </span>
                <button
                  onClick={() => handleRemoveKpi(kpi.id)}
                  className="text-[#A7B5AE] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove KPI"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="text-2xl font-black text-white tracking-tight mt-1">
                {kpi.formatted_value || '0'}
              </div>

              <div className="text-[11px] text-[#20C997] font-mono mt-1 flex items-center justify-between">
                <span>{kpi.aggregation?.toUpperCase()} of {kpi.column}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C. GLOBAL FILTER PANEL */}
      <div className="bg-[#14231E] border border-[#244536] rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#244536]/80">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[#20C997]" />
            <h3 className="text-sm font-bold text-white">Global Dataset Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#20C997] text-[#080D0C] text-[10px] font-black">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-[#A7B5AE] font-mono">
              Filtered Records: <strong className="text-[#6EE7B7]">{filteredRecords.toLocaleString()}</strong> / {totalRecords.toLocaleString()}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 hover:text-white text-xs font-bold transition-all"
              >
                <RotateCcw size={12} /> Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Cross Filter Alert Banner */}
        {activeCrossFilter && (
          <div className="flex items-center justify-between bg-[#0D1512] border border-[#20C997] rounded-lg p-2.5 px-3 text-xs">
            <div className="flex items-center gap-2">
              <MousePointerClick size={16} className="text-[#20C997]" />
              <span className="text-[#A7B5AE]">Interactive Cross-Filter:</span>
              <span className="font-bold text-white">{activeCrossFilter.column}</span> =
              <span className="px-2 py-0.5 rounded bg-[#20C997]/20 text-[#20C997] font-mono font-bold">
                {activeCrossFilter.value}
              </span>
            </div>
            <button
              onClick={handleClearCrossFilter}
              className="text-[#A7B5AE] hover:text-white text-[11px] font-bold flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}

        {/* Dynamic Filter Controls List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableFilters.map((flt) => {
            const col = flt.column;

            // 1. Categorical Filter
            if (flt.type === 'categorical') {
              const selectedVals = activeFilters[col] || [];
              return (
                <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[160px]">{flt.title}</span>
                    <span className="text-[10px] text-[#A7B5AE] font-mono">
                      {selectedVals.length > 0 ? `${selectedVals.length} selected` : 'All'}
                    </span>
                  </div>

                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                    {flt.options?.slice(0, 12).map((opt) => {
                      const isSelected = selectedVals.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => handleCategoricalFilterChange(col, opt)}
                          className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-all ${isSelected
                            ? 'bg-[#20C997]/20 text-[#6EE7B7] border border-[#20C997]/40 font-bold'
                            : 'text-[#A7B5AE] hover:bg-[#14231E] hover:text-white'
                            }`}
                        >
                          <span className="truncate max-w-[170px]">{opt}</span>
                          {isSelected && <Check size={12} className="text-[#20C997]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // 2. Numerical Range Filter
            if (flt.type === 'numerical') {
              const range = activeFilters[col] || {};
              return (
                <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[160px]">{flt.title}</span>
                    <span className="text-[10px] text-[#A7B5AE] font-mono">
                      [{flt.min}, {flt.max}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <input
                      type="number"
                      placeholder={`Min (${flt.min})`}
                      value={range.min !== undefined ? range.min : ''}
                      onChange={(e) => handleNumericalFilterChange(col, 'min', e.target.value)}
                      className="w-1/2 bg-[#14231E] border border-[#244536] text-white rounded px-2 py-1 outline-none text-xs focus:border-[#20C997]"
                    />
                    <span className="text-[#A7B5AE]">-</span>
                    <input
                      type="number"
                      placeholder={`Max (${flt.max})`}
                      value={range.max !== undefined ? range.max : ''}
                      onChange={(e) => handleNumericalFilterChange(col, 'max', e.target.value)}
                      className="w-1/2 bg-[#14231E] border border-[#244536] text-white rounded px-2 py-1 outline-none text-xs focus:border-[#20C997]"
                    />
                  </div>
                </div>
              );
            }

            // 3. Date Range Filter
            if (flt.type === 'date') {
              const dRange = activeFilters[col] || {};
              return (
                <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[160px]">{flt.title}</span>
                    <span className="text-[10px] text-[#20C997] font-mono">Date Range</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <input
                      type="date"
                      value={dRange.start || ''}
                      onChange={(e) => handleDateFilterChange(col, 'start', e.target.value)}
                      className="w-1/2 bg-[#14231E] border border-[#244536] text-white rounded px-1.5 py-1 outline-none text-xs focus:border-[#20C997]"
                    />
                    <span className="text-[#A7B5AE]">to</span>
                    <input
                      type="date"
                      value={dRange.end || ''}
                      onChange={(e) => handleDateFilterChange(col, 'end', e.target.value)}
                      className="w-1/2 bg-[#14231E] border border-[#244536] text-white rounded px-1.5 py-1 outline-none text-xs focus:border-[#20C997]"
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* D. INTERACTIVE VISUALIZATIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#A7B5AE] flex items-center gap-2">
            <Layers size={14} className="text-[#20C997]" /> Interactive Dynamic Charts
          </div>

          <button
            onClick={() => setShowAddChartModal(true)}
            className="flex items-center gap-1.5 text-xs text-[#20C997] hover:text-[#6EE7B7] font-bold"
          >
            <Plus size={14} /> Add Visualization
          </button>
        </div>

        {/* Charts Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartConfigs.map((cfg) => {
            const chartData = chartDataMap[cfg.id];
            const isFullWidth = cfg.grid_col === 'full';

            return (
              <div
                key={cfg.id}
                className={`bg-[#0D1512] border border-[#244536] rounded-xl p-5 shadow-xl relative group ${isFullWidth ? 'lg:col-span-2' : ''
                  }`}
              >
                {/* Chart Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#244536]/80 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {cfg.title}
                      {chartData?.trend_direction && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${chartData.trend_direction === 'Upward'
                            ? 'bg-emerald-950/80 text-[#6EE7B7] border border-emerald-800/80'
                            : chartData.trend_direction === 'Downward'
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                              : 'bg-zinc-800 text-zinc-300'
                            }`}
                        >
                          Trend: {chartData.trend_direction} ({chartData.trend_percentage}%)
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#A7B5AE]">
                      {cfg.type?.toUpperCase()} • {cfg.y ? `${cfg.aggregation?.toUpperCase()} (${cfg.y})` : cfg.x}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveChart(cfg.id)}
                    className="text-[#A7B5AE] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Chart"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Chart Rendering */}
                {chartData && !chartData.empty ? (
                  <div>
                    {/* 1. Line / Time Series */}
                    {cfg.type === 'line' && (
                      <Plot
                        data={[
                          {
                            x: chartData.dates,
                            y: chartData.values,
                            type: 'scatter',
                            mode: 'lines+markers',
                            line: { color: '#20C997', width: 2.5 },
                            marker: { color: '#6EE7B7', size: 6 },
                            hovertemplate: '<b>%{x}</b><br>Value: %{y:,.2f}<extra></extra>'
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          xaxis: { ...darkPlotLayout.xaxis, title: { text: chartData.x_label, font: { size: 10, color: '#A7B5AE' } } },
                          yaxis: { ...darkPlotLayout.yaxis, title: { text: chartData.y_label, font: { size: 10, color: '#A7B5AE' } } }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%' }}
                      />
                    )}

                    {/* 2. Categorical Bar (With Cross Filter Click) */}
                    {cfg.type === 'bar' && (
                      <Plot
                        data={[
                          {
                            x: chartData.labels,
                            y: chartData.values,
                            type: 'bar',
                            marker: { color: '#20C997' },
                            customdata: chartData.percentages,
                            hovertemplate: '<b>%{x}</b><br>Value: %{y:,.2f}<br>Share: %{customdata}%<extra></extra>'
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          xaxis: { ...darkPlotLayout.xaxis, tickangle: -25, title: { text: chartData.x_label, font: { size: 10, color: '#A7B5AE' } } },
                          yaxis: { ...darkPlotLayout.yaxis, title: { text: chartData.y_label, font: { size: 10, color: '#A7B5AE' } } }
                        }}
                        onClick={(event) => {
                          if (event.points && event.points[0]) {
                            const pt = event.points[0];
                            handleChartPointClick(cfg.x, pt.x);
                          }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    )}

                    {/* 3. Categorical Donut */}
                    {(cfg.type === 'donut' || cfg.type === 'pie') && (
                      <Plot
                        data={[
                          {
                            labels: chartData.labels,
                            values: chartData.values,
                            type: 'pie',
                            hole: 0.45,
                            textinfo: 'percent',
                            hovertemplate: '<b>%{label}</b><br>Value: %{value:,.2f}<br>Share: %{percent}<extra></extra>',
                            marker: {
                              colors: ['#20C997', '#6EE7B7', '#17A57B', '#244536', '#34D399', '#059669', '#10B981', '#A7B5AE']
                            }
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          showlegend: true,
                          legend: { font: { color: '#A7B5AE', size: 10 }, bgcolor: 'transparent' }
                        }}
                        onClick={(event) => {
                          if (event.points && event.points[0]) {
                            const pt = event.points[0];
                            handleChartPointClick(cfg.x, pt.label);
                          }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    )}

                    {/* 4. Numerical Box Plot */}
                    {cfg.type === 'box' && (
                      <Plot
                        data={[
                          {
                            y: chartData.data,
                            type: 'box',
                            name: chartData.column,
                            marker: { color: '#6EE7B7', outliercolor: '#F43F5E' },
                            boxpoints: false,
                            hovertemplate: `<b>${chartData.column}</b><br>Value: %{y:,.2f}<extra></extra>`
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          xaxis: { ...darkPlotLayout.xaxis, showticklabels: false },
                          yaxis: { ...darkPlotLayout.yaxis, title: { text: chartData.column, font: { size: 10, color: '#A7B5AE' } } }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%' }}
                      />
                    )}

                    {/* 5. Numerical Histogram */}
                    {cfg.type === 'histogram' && (
                      <Plot
                        data={[
                          {
                            x: chartData.data,
                            type: 'histogram',
                            marker: { color: '#20C997', opacity: 0.8 },
                            hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>'
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          xaxis: { ...darkPlotLayout.xaxis, title: { text: chartData.column, font: { size: 10, color: '#A7B5AE' } } },
                          yaxis: { ...darkPlotLayout.yaxis, title: { text: 'Count', font: { size: 10, color: '#A7B5AE' } } }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%' }}
                      />
                    )}

                    {/* 6. Relationship Scatter */}
                    {cfg.type === 'scatter' && (
                      <Plot
                        data={[
                          {
                            x: chartData.x_values,
                            y: chartData.y_values,
                            mode: 'markers',
                            type: 'scatter',
                            marker: { color: '#20C997', size: 6, opacity: 0.7 },
                            hovertemplate: `<b>${chartData.x_label}</b>: %{x}<br><b>${chartData.y_label}</b>: %{y}<extra></extra>`
                          }
                        ]}
                        layout={{
                          ...darkPlotLayout,
                          height: 270,
                          xaxis: { ...darkPlotLayout.xaxis, title: { text: chartData.x_label, font: { size: 10, color: '#A7B5AE' } } },
                          yaxis: { ...darkPlotLayout.yaxis, title: { text: chartData.y_label, font: { size: 10, color: '#A7B5AE' } } }
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%' }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-[270px] flex items-center justify-center text-xs text-[#A7B5AE] bg-[#080D0C]/40 rounded-xl border border-[#244536]/50">
                    ℹ️ {chartData?.message || 'No data available for this chart configuration under active filters.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD KPI CARD */}
      {showAddKpiModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#244536] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-[#20C997]" /> Add New KPI Card
              </h3>
              <button onClick={() => setShowAddKpiModal(false)} className="text-[#A7B5AE] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A7B5AE] font-semibold mb-1">Target Column</label>
                <select
                  value={newKpiCol}
                  onChange={(e) => setNewKpiCol(e.target.value)}
                  className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                >
                  <option value="">Select column...</option>
                  {allColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[#A7B5AE] font-semibold mb-1">Aggregation</label>
                <select
                  value={newKpiAgg}
                  onChange={(e) => setNewKpiAgg(e.target.value)}
                  className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                >
                  <option value="sum">Sum (Total)</option>
                  <option value="mean">Mean (Average)</option>
                  <option value="median">Median</option>
                  <option value="count">Count (Records)</option>
                  <option value="unique">Unique Count</option>
                  <option value="min">Minimum</option>
                  <option value="max">Maximum</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A7B5AE] font-semibold mb-1">Custom Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Total Revenue"
                  value={newKpiTitle}
                  onChange={(e) => setNewKpiTitle(e.target.value)}
                  className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#244536]">
              <button
                onClick={() => setShowAddKpiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A7B5AE] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKpi}
                disabled={!newKpiCol}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#20C997] text-[#080D0C] hover:bg-[#6EE7B7] disabled:opacity-40"
              >
                Create KPI Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHART */}
      {showAddChartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#244536] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-[#20C997]" /> Add New Visualization
              </h3>
              <button onClick={() => setShowAddChartModal(false)} className="text-[#A7B5AE] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A7B5AE] font-semibold mb-1">Chart Type</label>
                  <select
                    value={newChartType}
                    onChange={(e) => setNewChartType(e.target.value)}
                    className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="donut">Donut Chart</option>
                    <option value="line">Trend Line (Time Series)</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="histogram">Histogram</option>
                    <option value="box">Box Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A7B5AE] font-semibold mb-1">Card Width</label>
                  <select
                    value={newChartGrid}
                    onChange={(e) => setNewChartGrid(e.target.value)}
                    className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                  >
                    <option value="half">Half Width (1 Column)</option>
                    <option value="full">Full Width (2 Columns)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A7B5AE] font-semibold mb-1">Primary Dimension / X-Axis</label>
                <select
                  value={newChartX}
                  onChange={(e) => setNewChartX(e.target.value)}
                  className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                >
                  <option value="">Select column...</option>
                  {allColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {['bar', 'donut', 'line', 'scatter'].includes(newChartType) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A7B5AE] font-semibold mb-1">Metric / Y-Axis</label>
                    <select
                      value={newChartY}
                      onChange={(e) => setNewChartY(e.target.value)}
                      className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                    >
                      <option value="">(Record count)</option>
                      {numColumns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A7B5AE] font-semibold mb-1">Aggregation</label>
                    <select
                      value={newChartAgg}
                      onChange={(e) => setNewChartAgg(e.target.value)}
                      className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                    >
                      <option value="sum">Sum</option>
                      <option value="mean">Mean</option>
                      <option value="count">Count</option>
                      <option value="min">Min</option>
                      <option value="max">Max</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#A7B5AE] font-semibold mb-1">Chart Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sales by Category"
                  value={newChartTitle}
                  onChange={(e) => setNewChartTitle(e.target.value)}
                  className="w-full bg-[#14231E] border border-[#244536] rounded-lg p-2.5 text-white outline-none focus:border-[#20C997]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#244536]">
              <button
                onClick={() => setShowAddChartModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A7B5AE] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChart}
                disabled={!newChartX}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#20C997] text-[#080D0C] hover:bg-[#6EE7B7] disabled:opacity-40"
              >
                Create Visualization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
