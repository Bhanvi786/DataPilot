import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useDataset } from '../context/DatasetContext';
import {
  getEDAOverview,
  getEDAStatistics,
  getEDANumerical,
  getEDACategorical,
  getEDACorrelation,
  getEDATimeSeries,
  getEDAInsights,
  generateCustomChart
} from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Table2,
  PieChart,
  Calendar,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Clock,
  KeyRound,
  Layers,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EDAPage = () => {
  const { datasetId } = useDataset();
  const [version, setVersion] = useState('cleaned'); // 'cleaned' | 'original'
  const [loading, setLoading] = useState(false);

  // Data states
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [numerical, setNumerical] = useState([]);
  const [temporalDists, setTemporalDists] = useState([]);
  const [categorical, setCategorical] = useState([]);
  const [identifiers, setIdentifiers] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [corrMethod, setCorrMethod] = useState('pearson');
  const [timeSeries, setTimeSeries] = useState(null);
  const [insights, setInsights] = useState([]);

  // Numerical Log-scale toggles per column
  const [logScaleMap, setLogScaleMap] = useState({});

  // Numerical Boxplot Show Individual Outliers toggle per column
  const [showOutlierPointsMap, setShowOutlierPointsMap] = useState({});

  // Numerical Sample Outlier Values modal/drawer or toggle per column
  const [expandedOutliersMap, setExpandedOutliersMap] = useState({});

  // Temporal Month Name format toggle per column
  const [temporalMonthNameMap, setTemporalMonthNameMap] = useState({});

  // Categorical Top-N selector per column (5, 10, 20)
  const [catTopMap, setCatTopMap] = useState({});

  // Time Series selector state
  const [tsDateCol, setTsDateCol] = useState('');
  const [tsMetricCol, setTsMetricCol] = useState('');
  const [tsFreq, setTsFreq] = useState('M');
  const [tsAgg, setTsAgg] = useState('mean');
  const [tsLoading, setTsLoading] = useState(false);

  // Custom chart builder state
  const [customChartType, setCustomChartType] = useState('bar');
  const [customX, setCustomX] = useState('');
  const [customY, setCustomY] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [customAgg, setCustomAgg] = useState('mean');
  const [customResult, setCustomResult] = useState(null);
  const [customError, setCustomError] = useState(null);
  const [customWarning, setCustomWarning] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    stats: true,
    numerical: true,
    temporal: true,
    categorical: true,
    identifiers: true,
    correlation: true,
    timeseries: true,
    insights: true,
    custom: true
  });

  const toggleSection = (sec) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const updateCustomChartDefaults = (ov, targetType = 'bar') => {
    if (!ov || !ov.column_breakdown) return;
    const { numerical: nums, categorical: cats, datetime: dates, all_columns: allCols } = ov.column_breakdown;

    if (targetType === 'bar' || targetType === 'donut' || targetType === 'pie') {
      if (cats && cats.length > 0) setCustomX(cats[0]);
      else if (allCols && allCols.length > 0) setCustomX(allCols[0]);

      if (nums && nums.length > 0) setCustomY(nums[0]);
      else setCustomY('');
    } else if (targetType === 'line') {
      if (dates && dates.length > 0) setCustomX(dates[0]);
      else if (cats && cats.length > 0) setCustomX(cats[0]);
      else if (allCols && allCols.length > 0) setCustomX(allCols[0]);

      if (nums && nums.length > 0) setCustomY(nums[0]);
      else setCustomY('');
    } else if (targetType === 'scatter') {
      if (nums && nums.length >= 2) {
        setCustomX(nums[0]);
        setCustomY(nums[1]);
      } else if (nums && nums.length === 1) {
        setCustomX(nums[0]);
        setCustomY(nums[0]);
      }
    } else if (targetType === 'histogram' || targetType === 'box') {
      if (nums && nums.length > 0) setCustomX(nums[0]);
      else if (allCols && allCols.length > 0) setCustomX(allCols[0]);
      setCustomY('');
    }
  };

  const fetchAllEDA = async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      const [ov, st, num, cat, corr, ins] = await Promise.all([
        getEDAOverview(datasetId, version),
        getEDAStatistics(datasetId, version),
        getEDANumerical(datasetId, version),
        getEDACategorical(datasetId, version),
        getEDACorrelation(datasetId, corrMethod, version),
        getEDAInsights(datasetId, version)
      ]);

      setOverview(ov.overview);
      setStats(st);
      setNumerical(num.distributions || []);
      setTemporalDists(num.temporal_distributions || []);
      setCategorical(cat.distributions || []);
      setIdentifiers(cat.identifiers || []);
      setCorrelations(corr.correlations);
      setInsights(ins.insights || []);

      updateCustomChartDefaults(ov.overview, customChartType);

      if (ov.overview.datetime_count > 0 && ov.overview.numerical_count > 0) {
        const dCol = ov.overview.column_breakdown.datetime[0];
        const mCol = ov.overview.column_breakdown.numerical[0];
        setTsDateCol(dCol);
        setTsMetricCol(mCol);
        const ts = await getEDATimeSeries(datasetId, { date_col: dCol, metric_col: mCol, freq: 'M', agg_func: 'mean' }, version);
        setTimeSeries(ts);
      } else {
        setTimeSeries(null);
      }

    } catch (err) {
      console.error('Error fetching EDA data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEDA();
  }, [datasetId, version, corrMethod]);

  const handleUpdateTimeSeries = async (dCol, mCol, fr, ag) => {
    setTsLoading(true);
    try {
      const ts = await getEDATimeSeries(datasetId, {
        date_col: dCol || tsDateCol,
        metric_col: mCol || tsMetricCol,
        freq: fr || tsFreq,
        agg_func: ag || tsAgg
      }, version);
      setTimeSeries(ts);
    } catch (err) {
      console.error('Error updating timeseries', err);
    } finally {
      setTsLoading(false);
    }
  };

  const handleChartTypeChange = (newType) => {
    setCustomChartType(newType);
    setCustomResult(null);
    setCustomError(null);
    setCustomWarning(null);
    updateCustomChartDefaults(overview, newType);
  };

  const handleBuildCustomChart = async () => {
    setCustomError(null);
    setCustomWarning(null);
    setCustomLoading(true);
    try {
      const res = await generateCustomChart(datasetId, {
        chart_type: customChartType,
        x_column: customX,
        y_column: customY || undefined,
        color_column: customColor || undefined,
        agg_func: customAgg
      }, version);

      if (res.warning) {
        setCustomWarning(res.warning);
      }
      setCustomResult(res);
    } catch (err) {
      setCustomError(err.response?.data?.detail || err.message);
      setCustomResult(null);
    } finally {
      setCustomLoading(false);
    }
  };

  if (!datasetId) {
    return (
      <div className="bg-[#14231E] border border-[#244536] rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mx-auto">
          <BarChart3 size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Dataset Uploaded</h2>
        <p className="text-sm text-[#A7B5AE] max-w-md mx-auto">
          Please upload a CSV or Excel dataset to explore dynamic graphs, statistical profiling, and automated insights.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#20C997] text-[#080D0C] font-bold text-sm hover:bg-[#6EE7B7] transition-all"
        >
          Go to Upload
        </Link>
      </div>
    );
  }

  // Dark Plotly theme configuration with clean paddings to avoid truncation
  const darkPlotLayout = {
    paper_bgcolor: '#0D1512',
    plot_bgcolor: '#0D1512',
    font: { family: 'Plus Jakarta Sans, sans-serif', color: '#A7B5AE', size: 11 },
    xaxis: { gridcolor: '#1F382C', zerolinecolor: '#244536', linecolor: '#244536' },
    yaxis: { gridcolor: '#1F382C', zerolinecolor: '#244536', linecolor: '#244536' },
    margin: { t: 30, r: 25, b: 50, l: 55 },
    autosize: true,
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Version Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#244536] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Phase 3 Automated Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Exploratory Data Analysis (EDA)
          </h1>
          <p className="text-sm text-[#A7B5AE] mt-1">
            Intelligent statistical distribution profiling, correlation discovery, and interactive Plotly visual analytics.
          </p>
        </div>

        {/* Dataset Version Selector */}
        <div className="flex items-center gap-2 bg-[#14231E] border border-[#244536] rounded-xl p-1.5">
          <span className="text-xs text-[#A7B5AE] px-2 font-medium">Dataset Source:</span>
          <button
            onClick={() => setVersion('cleaned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              version === 'cleaned'
                ? 'bg-[#20C997] text-[#080D0C] shadow-md shadow-[#20C997]/20'
                : 'text-[#A7B5AE] hover:text-white'
            }`}
          >
            Cleaned Version
          </button>
          <button
            onClick={() => setVersion('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              version === 'original'
                ? 'bg-[#20C997] text-[#080D0C] shadow-md shadow-[#20C997]/20'
                : 'text-[#A7B5AE] hover:text-white'
            }`}
          >
            Original Version
          </button>
        </div>
      </div>

      {/* A. EDA OVERVIEW CARDS */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Continuous Numerical</div>
            <div className="text-2xl font-black text-[#6EE7B7] mt-1">{overview.numerical_count} features</div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Discrete Temporal Units</div>
            <div className="text-2xl font-black text-white mt-1">{overview.temporal_components_count || 0} features</div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Categorical Features</div>
            <div className="text-2xl font-black text-white mt-1">{overview.categorical_count} features</div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Detected Identifiers</div>
            <div className="text-2xl font-black text-[#6EE7B7] mt-1">{overview.identifier_count} columns</div>
          </div>
        </div>
      )}

      {/* H. AUTOMATED STATISTICAL INSIGHTS */}
      {insights.length > 0 && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#244536]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-[#20C997]" /> Automated Statistical Insights
            </h3>
            <span className="text-xs text-[#A7B5AE]">{insights.length} mathematical observations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, idx) => (
              <div
                key={idx}
                className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 space-y-1.5 hover:border-[#20C997]/60 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{ins.title}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#244536]/60 text-[#6EE7B7]">
                    {ins.category}
                  </span>
                </div>
                <p className="text-xs text-[#A7B5AE] leading-relaxed">
                  {ins.observation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. STATISTICAL SUMMARY TABLE */}
      {stats && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('stats')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Table2 size={18} className="text-[#20C997]" /> Comprehensive Descriptive Statistics
              </h3>
              <p className="text-xs text-[#A7B5AE]">Mean, median, variance, skewness, and quartiles across all features</p>
            </div>
            {openSections.stats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.stats && (
            <div className="space-y-6">
              {stats.numerical_statistics.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="text-xs font-bold text-[#6EE7B7] uppercase mb-2">Numerical Feature Summary</div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0D1512] border-b border-[#244536]">
                      <tr>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Column</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Mean</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Median</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Std Dev</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Min</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Max</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">IQR</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Skewness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#244536]/50 font-mono">
                      {stats.numerical_statistics.map((n) => (
                        <tr key={n.column_name} className="hover:bg-[#0D1512]/50">
                          <td className="py-2.5 px-3 font-sans font-semibold text-white">{n.column_name}</td>
                          <td className="py-2.5 px-3 text-[#6EE7B7]">{n.mean}</td>
                          <td className="py-2.5 px-3 text-white">{n.median}</td>
                          <td className="py-2.5 px-3 text-[#A7B5AE]">{n.std}</td>
                          <td className="py-2.5 px-3 text-white">{n.min}</td>
                          <td className="py-2.5 px-3 text-white">{n.max}</td>
                          <td className="py-2.5 px-3 text-[#A7B5AE]">{n.iqr}</td>
                          <td className="py-2.5 px-3 text-white">{n.skewness}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {stats.categorical_statistics.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="text-xs font-bold text-[#6EE7B7] uppercase mb-2">Categorical Cardinality Summary</div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0D1512] border-b border-[#244536]">
                      <tr>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Column</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Unique Classes</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Top Category</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Top Frequency</th>
                        <th className="py-2.5 px-3 uppercase text-white font-bold">Concentration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#244536]/50">
                      {stats.categorical_statistics.map((c) => (
                        <tr key={c.column_name} className="hover:bg-[#0D1512]/50">
                          <td className="py-2.5 px-3 font-semibold text-white">{c.column_name}</td>
                          <td className="py-2.5 px-3 font-mono text-[#6EE7B7]">{c.unique_categories}</td>
                          <td className="py-2.5 px-3 text-white font-mono">{c.most_frequent_category}</td>
                          <td className="py-2.5 px-3 font-mono text-[#A7B5AE]">{c.frequency}</td>
                          <td className="py-2.5 px-3 font-mono text-white">{c.top_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* C. NUMERICAL FEATURE DISTRIBUTIONS - SEPARATED HISTOGRAM & BOX PLOT */}
      {numerical.length > 0 && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('numerical')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-[#20C997]" /> Numerical Feature Distributions
              </h3>
              <p className="text-xs text-[#A7B5AE]">Independent non-overlapping Histogram and Box Plot visual analytics</p>
            </div>
            {openSections.numerical ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.numerical && (
            <div className="space-y-8">
              {numerical.map((item) => {
                const col = item.column_name;
                const isLog = !!logScaleMap[col];
                const showPoints = !!showOutlierPointsMap[col];
                const showSampleOutliers = !!expandedOutliersMap[col];

                const activeData = (isLog && item.log_data) ? item.log_data : item.data;
                const activeStats = (isLog && item.log_stats) ? item.log_stats : item.stats;

                return (
                  <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-xl p-5 space-y-4">
                    {/* Header with stats, log toggle & outlier controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#244536]/60 gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span>{col}</span>
                          {isLog && (
                            <span className="px-2 py-0.5 rounded bg-[#20C997]/20 text-[#20C997] text-[10px] font-bold border border-[#20C997]/40">
                              📊 Logarithmic Scale Active
                            </span>
                          )}
                          {item.is_skewed && !isLog && (
                            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px] font-bold border border-amber-800/60">
                              ⚠️ Skewed (Skewness: {item.skewness})
                            </span>
                          )}
                        </div>
                        {isLog && item.log_note && (
                          <div className="text-[11px] text-[#20C997] font-mono mt-0.5">
                            Transformation: {item.log_note} (Original dataset remains unchanged)
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A7B5AE] mt-1 font-mono">
                          <span>Mean: <strong className="text-[#6EE7B7]">{activeStats.mean}</strong></span>
                          <span>Median: <strong className="text-white">{activeStats.median}</strong></span>
                          <span>Q1: <strong className="text-white">{activeStats.q1}</strong></span>
                          <span>Q3: <strong className="text-white">{activeStats.q3}</strong></span>
                          <span>IQR: <strong className="text-[#6EE7B7]">{activeStats.iqr}</strong></span>
                          <span>Bounds: <strong className="text-white">[{activeStats.lower_bound ?? (activeStats.q1 - 1.5 * activeStats.iqr).toFixed(2)}, {activeStats.upper_bound ?? (activeStats.q3 + 1.5 * activeStats.iqr).toFixed(2)}]</strong></span>
                          <span>Outliers: <strong className={item.stats.outliers_count > 0 ? 'text-rose-400 font-bold' : 'text-white'}>{item.stats.outliers_count}</strong></span>
                        </div>
                      </div>

                      {/* Control buttons: Log Scale & Outlier Points */}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.log_data && (
                          <div className="flex items-center gap-2 bg-[#14231E] px-3 py-1.5 rounded-lg border border-[#244536]">
                            <span className="text-[11px] text-[#A7B5AE] font-semibold">Log Scale:</span>
                            <button
                              onClick={() => setLogScaleMap(prev => ({ ...prev, [col]: !prev[col] }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                isLog
                                  ? 'bg-[#20C997] text-[#080D0C]'
                                  : 'bg-[#0D1512] text-[#A7B5AE] border border-[#244536] hover:text-white'
                              }`}
                            >
                              {isLog ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        )}

                        {item.stats.outliers_count > 0 && (
                          <div className="flex items-center gap-2 bg-[#14231E] px-3 py-1.5 rounded-lg border border-[#244536]">
                            <span className="text-[11px] text-[#A7B5AE] font-semibold">Outlier Dots:</span>
                            <button
                              onClick={() => setShowOutlierPointsMap(prev => ({ ...prev, [col]: !prev[col] }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                showPoints
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-[#0D1512] text-[#A7B5AE] border border-[#244536] hover:text-white'
                              }`}
                              title="Toggle rendering of individual outlier points"
                            >
                              {showPoints ? 'SHOWING' : 'HIDDEN'}
                            </button>
                          </div>
                        )}

                        {item.stats.outlier_samples && item.stats.outlier_samples.length > 0 && (
                          <button
                            onClick={() => setExpandedOutliersMap(prev => ({ ...prev, [col]: !prev[col] }))}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              showSampleOutliers
                                ? 'bg-[#244536] text-[#6EE7B7] border-[#20C997]'
                                : 'bg-[#14231E] text-[#A7B5AE] border-[#244536] hover:text-white'
                            }`}
                          >
                            {showSampleOutliers ? 'Hide Outliers' : `Inspect Outliers (${item.stats.outliers_count})`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sample Outliers Inspection Panel */}
                    {showSampleOutliers && item.stats.outlier_samples && (
                      <div className="bg-[#14231E]/80 border border-[#244536] rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[#6EE7B7] font-bold">
                          <span>Sample Outlier Records for {col} ({item.stats.outliers_count} total detected outside [{item.stats.lower_bound}, {item.stats.upper_bound}]):</span>
                          <span className="text-[10px] text-[#A7B5AE] font-normal">Showing up to {item.stats.outlier_samples.length} sample points</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.stats.outlier_samples.map((val, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300 font-mono text-[11px]">
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dual Chart Layout: Separate Histogram & Separate Boxplot */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 1. Histogram */}
                      <div className="bg-[#14231E]/60 border border-[#244536] rounded-xl p-3">
                        <div className="text-xs font-bold text-[#6EE7B7] mb-1 flex items-center justify-between">
                          <span>Frequency Distribution (Histogram)</span>
                          {isLog && <span className="text-[10px] text-[#20C997] font-mono">Log Axis</span>}
                        </div>
                        <Plot
                          data={[
                            {
                              x: activeData,
                              type: 'histogram',
                              marker: { color: '#20C997', opacity: 0.8 },
                              hovertemplate: 'Range: %{x}<br>Count: %{y}<extra></extra>'
                            }
                          ]}
                          layout={{
                            ...darkPlotLayout,
                            height: 240,
                            xaxis: {
                              ...darkPlotLayout.xaxis,
                              title: { text: isLog ? `log scale of ${col}` : col, font: { size: 10, color: '#A7B5AE' } }
                            },
                            yaxis: {
                              ...darkPlotLayout.yaxis,
                              title: { text: 'Count', font: { size: 10, color: '#A7B5AE' } }
                            }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {/* 2. Box Plot */}
                      <div className="bg-[#14231E]/60 border border-[#244536] rounded-xl p-3">
                        <div className="text-xs font-bold text-[#6EE7B7] mb-1 flex items-center justify-between">
                          <span>Quartiles & Outlier Spread (Box Plot)</span>
                          <span className="text-[10px] text-[#A7B5AE] font-mono">
                            {showPoints ? 'Outlier points rendered' : 'Summary whiskers (points hidden for speed)'}
                          </span>
                        </div>
                        <Plot
                          data={[
                            {
                              y: activeData,
                              type: 'box',
                              name: isLog ? `log(${col})` : col,
                              marker: { color: '#6EE7B7', outliercolor: '#F43F5E', size: 4 },
                              boxpoints: showPoints ? 'outliers' : false,
                              boxmean: true,
                              hovertemplate: `<b>${col}</b><br>Value: %{y:.2f}<extra></extra>`
                            }
                          ]}
                          layout={{
                            ...darkPlotLayout,
                            height: 240,
                            xaxis: {
                              ...darkPlotLayout.xaxis,
                              showticklabels: false
                            },
                            yaxis: {
                              ...darkPlotLayout.yaxis,
                              title: { text: isLog ? `log scale of ${col}` : col, font: { size: 10, color: '#A7B5AE' } }
                            }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DISCRETE TEMPORAL COMPONENTS (Year, Month, Quarter) */}
      {temporalDists.length > 0 && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('temporal')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-[#20C997]" /> Discrete Temporal Component Frequencies
              </h3>
              <p className="text-xs text-[#A7B5AE]">Discrete integer components (Year, Month, Quarter) preserved in chronological sequence</p>
            </div>
            {openSections.temporal ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.temporal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {temporalDists.map((item) => {
                const col = item.column_name;
                const isNamedMonth = !!temporalMonthNameMap[col];
                const activeLabels = (item.is_month && isNamedMonth && item.named_labels) ? item.named_labels : item.labels;

                return (
                  <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{col} Component</span>
                        <span className="text-[#20C997] font-mono text-[11px]">({item.unique_count} Unique Periods, {item.total_count} records)</span>
                      </div>

                      {/* Optional Month Name Toggle */}
                      {item.is_month && item.named_labels && (
                        <div className="flex items-center gap-1.5 bg-[#14231E] px-2.5 py-1 rounded-lg border border-[#244536]">
                          <span className="text-[10px] text-[#A7B5AE] font-semibold">Format:</span>
                          <button
                            onClick={() => setTemporalMonthNameMap(prev => ({ ...prev, [col]: !prev[col] }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                              isNamedMonth
                                ? 'bg-[#20C997] text-[#080D0C]'
                                : 'bg-[#0D1512] text-[#A7B5AE] border border-[#244536]'
                            }`}
                          >
                            {isNamedMonth ? 'Month Names (Jan..Dec)' : 'Integers (1..12)'}
                          </button>
                        </div>
                      )}
                    </div>

                    <Plot
                      data={[
                        {
                          x: activeLabels,
                          y: item.values,
                          type: 'bar',
                          marker: { color: '#20C997' },
                          customdata: item.percentages,
                          hovertemplate: '<b>%{x}</b><br>Count: %{y:,}<br>Share: %{customdata}%<extra></extra>'
                        }
                      ]}
                      layout={{
                        ...darkPlotLayout,
                        height: 250,
                        xaxis: {
                          ...darkPlotLayout.xaxis,
                          type: 'category',
                          categoryorder: 'array',
                          categoryarray: activeLabels,
                          title: { text: isNamedMonth ? 'Month' : col, font: { size: 10, color: '#A7B5AE' } }
                        },
                        yaxis: {
                          ...darkPlotLayout.yaxis,
                          title: { text: 'Frequency Count', font: { size: 10, color: '#A7B5AE' } }
                        },
                        margin: { t: 20, r: 25, b: 50, l: 50 }
                      }}
                      config={{ responsive: true, displayModeBar: false }}
                      style={{ width: '100%' }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* D. CATEGORICAL FEATURE DISTRIBUTIONS - HIGH VS LOW CARDINALITY */}
      {categorical.length > 0 && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('categorical')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieChart size={18} className="text-[#20C997]" /> Categorical Feature Distributions
              </h3>
              <p className="text-xs text-[#A7B5AE]">High-cardinality ranking bars and clean low-cardinality donut charts</p>
            </div>
            {openSections.categorical ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.categorical && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categorical.map((item) => {
                const col = item.column_name;
                const topN = catTopMap[col] || 10;
                const currentData = topN === 5 ? item.top5 : topN === 20 ? item.top20 : item.top10;
                // Use horizontal bar if high cardinality OR if labels are long to prevent clipping
                const useHorizontalBar = item.is_high_cardinality || item.has_long_labels;

                return (
                  <div key={col} className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-white text-sm">{col}</span>
                        <div className="text-[11px] text-[#A7B5AE]">
                          {item.total_unique} Unique Classes | Top: <strong className="text-white">{item.top_category}</strong> ({item.top_category_pct}%)
                        </div>
                      </div>

                      {/* Top N toggle for high cardinality or long labels */}
                      {useHorizontalBar && (
                        <div className="flex items-center gap-1 bg-[#14231E] p-1 rounded-lg border border-[#244536]">
                          {[5, 10, 20].map((n) => (
                            <button
                              key={n}
                              onClick={() => setCatTopMap(prev => ({ ...prev, [col]: n }))}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                topN === n
                                  ? 'bg-[#20C997] text-[#080D0C]'
                                  : 'text-[#A7B5AE] hover:text-white'
                              }`}
                            >
                              Top {n}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chart rendering: Horizontal bar for high-cardinality or long labels, Donut for clean low-cardinality */}
                    {useHorizontalBar ? (
                      <div>
                        <Plot
                          data={[
                            {
                              y: [...currentData.labels].reverse(),
                              x: [...currentData.values].reverse(),
                              customdata: [...currentData.percentages].reverse(),
                              type: 'bar',
                              orientation: 'h',
                              marker: { color: '#20C997' },
                              hovertemplate: '<b>%{y}</b><br>Count: %{x:,}<br>Percentage: %{customdata}%<extra></extra>'
                            }
                          ]}
                          layout={{
                            ...darkPlotLayout,
                            height: Math.max(260, currentData.labels.length * 28),
                            margin: { t: 20, r: 25, b: 40, l: Math.min(160, Math.max(90, (item.max_label_length || 10) * 8)) },
                            yaxis: {
                              ...darkPlotLayout.yaxis,
                              tickfont: { size: 10, color: '#FFFFFF' },
                              automargin: true
                            },
                            xaxis: {
                              ...darkPlotLayout.xaxis,
                              title: { text: 'Count', font: { size: 10, color: '#A7B5AE' } }
                            }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          style={{ width: '100%' }}
                        />
                        {item.remaining_categories_count > 0 && (
                          <div className="text-[11px] text-[#A7B5AE] text-right mt-1">
                            +{item.remaining_categories_count} other categories in dataset
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Plot
                          data={[
                            {
                              labels: item.top10.labels,
                              values: item.top10.values,
                              type: 'pie',
                              hole: 0.45,
                              textinfo: 'percent',
                              hoverinfo: 'label+value+percent',
                              hovertemplate: '<b>%{label}</b><br>Count: %{value:,}<br>Share: %{percent}<extra></extra>',
                              marker: {
                                colors: ['#20C997', '#6EE7B7', '#17A57B', '#244536', '#34D399', '#059669', '#10B981', '#A7B5AE']
                              }
                            }
                          ]}
                          layout={{
                            ...darkPlotLayout,
                            height: 260,
                            showlegend: true,
                            legend: {
                              orientation: 'v',
                              x: 1.02,
                              y: 0.5,
                              font: { color: '#A7B5AE', size: 10 },
                              bgcolor: 'transparent'
                            },
                            margin: { t: 20, r: 80, b: 20, l: 20 }
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* IDENTIFIER SUMMARY SECTION (Excludes keys from default pie charts) */}
      {identifiers.length > 0 && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('identifiers')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound size={18} className="text-[#20C997]" /> Detected Identifier Columns
              </h3>
              <p className="text-xs text-[#A7B5AE]">High-cardinality keys excluded from default pie charts to preserve visual clarity</p>
            </div>
            {openSections.identifiers ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.identifiers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {identifiers.map((idCol) => (
                <div key={idCol.column_name} className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{idCol.column_name}</span>
                    <span className="px-2 py-0.5 rounded bg-[#244536]/60 text-[#6EE7B7] text-[10px] font-mono">
                      {idCol.data_type}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#6EE7B7]">
                    {idCol.unique_keys.toLocaleString()} <span className="text-xs font-normal text-[#A7B5AE]">unique keys</span>
                  </div>
                  <div className="text-[11px] text-[#A7B5AE] truncate">
                    Samples: {idCol.sample_values.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* F. CORRELATION ANALYSIS (HEATMAP) */}
      <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
        <div
          onClick={() => toggleSection('correlation')}
          className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
        >
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#20C997]" /> Bivariate Correlation Heatmap
            </h3>
            <p className="text-xs text-[#A7B5AE]">Pairwise correlation matrix across continuous features</p>
          </div>
          {openSections.correlation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {openSections.correlation && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A7B5AE]">Method:</span>
              <select
                value={corrMethod}
                onChange={(e) => setCorrMethod(e.target.value)}
                className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs focus:border-[#20C997] outline-none"
              >
                <option value="pearson">Pearson (Linear)</option>
                <option value="spearman">Spearman (Rank / Monotonic)</option>
              </select>
            </div>

            {correlations && correlations.matrix.length >= 2 ? (
              <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 overflow-hidden space-y-3">
                <Plot
                  data={[
                    {
                      z: correlations.matrix,
                      x: correlations.columns,
                      y: correlations.columns,
                      text: correlations.annotations || undefined,
                      texttemplate: '%{text}',
                      customdata: correlations.hover_texts || undefined,
                      hovertemplate: correlations.hover_texts ? '%{customdata}<extra></extra>' : '<b>%{x} vs %{y}</b><br>Correlation: %{z:.3f}<extra></extra>',
                      textfont: { family: 'Plus Jakarta Sans, monospace', size: 11, color: '#FFFFFF' },
                      type: 'heatmap',
                      colorscale: [
                        [0.0, '#E11D48'],
                        [0.5, '#0D1512'],
                        [1.0, '#20C997']
                      ],
                      zmin: -1.0,
                      zmax: 1.0,
                      colorbar: {
                        tickfont: { color: '#A7B5AE', size: 10 },
                        outlinecolor: '#244536',
                        thickness: 14,
                        len: 0.9
                      }
                    }
                  ]}
                  layout={{
                    ...darkPlotLayout,
                    height: Math.max(320, correlations.columns.length * 50),
                    xaxis: {
                      tickangle: -30,
                      tickfont: { size: 11, color: '#FFFFFF' },
                      gridcolor: '#1F382C',
                      autorange: true
                    },
                    yaxis: {
                      tickfont: { size: 11, color: '#FFFFFF' },
                      gridcolor: '#1F382C',
                      autorange: 'reversed'
                    },
                    margin: { t: 30, r: 40, b: 80, l: 110 }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />

                {correlations.excluded_columns && correlations.excluded_columns.length > 0 && (
                  <div className="bg-[#14231E]/80 border border-[#244536] rounded-lg p-3 text-xs">
                    <span className="font-bold text-[#6EE7B7] block mb-1">Excluded Columns Justification:</span>
                    <ul className="space-y-1 text-[#A7B5AE]">
                      {correlations.excluded_columns.map((ex, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#20C997] font-semibold">{ex.column}:</span>
                          <span>{ex.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#A7B5AE] bg-[#080D0C]/40 rounded-xl border border-[#244536]">
                ⚠️ At least two varying numerical features are required to compute a bivariate correlation matrix.
              </div>
            )}

            {correlations && correlations.matrix.length >= 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0D1512] border border-[#244536] rounded-lg p-3">
                  <div className="text-[11px] font-bold text-[#6EE7B7] uppercase mb-1">Strong Positive Correlations (r ≥ 0.5)</div>
                  {correlations.strong_positive?.length === 0 ? (
                    <div className="text-xs text-[#A7B5AE]">None identified (|r| &lt; 0.5)</div>
                  ) : (
                    <ul className="text-xs text-white space-y-1">
                      {correlations.strong_positive?.map((p, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{p.col1} ↔ {p.col2}</span>
                          <span className="font-mono text-[#6EE7B7]">+{p.correlation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-[#0D1512] border border-[#244536] rounded-lg p-3">
                  <div className="text-[11px] font-bold text-rose-400 uppercase mb-1">Inverse Correlations (r ≤ -0.5)</div>
                  {correlations.strong_negative?.length === 0 ? (
                    <div className="text-xs text-[#A7B5AE]">None identified (|r| &lt; 0.5)</div>
                  ) : (
                    <ul className="text-xs text-white space-y-1">
                      {correlations.strong_negative?.map((n, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{n.col1} ↔ {n.col2}</span>
                          <span className="font-mono text-rose-400">{n.correlation}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* G. TIME-SERIES ANALYSIS */}
      {timeSeries && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div
            onClick={() => toggleSection('timeseries')}
            className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
          >
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-[#20C997]" /> Chronological Time-Series Analysis
              </h3>
              <p className="text-xs text-[#A7B5AE]">
                {timeSeries.has_timeseries
                  ? `Temporal sequence over ${timeSeries.analysis?.total_periods} periods | Directional Trend: ${timeSeries.analysis?.trend}`
                  : 'Temporal analysis not applicable for this dataset'}
              </p>
            </div>
            {openSections.timeseries ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openSections.timeseries && (
            <div className="space-y-4">
              {timeSeries.has_timeseries ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A7B5AE]">Date:</span>
                      <select
                        value={tsDateCol}
                        onChange={(e) => {
                          setTsDateCol(e.target.value);
                          handleUpdateTimeSeries(e.target.value, tsMetricCol, tsFreq, tsAgg);
                        }}
                        className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs outline-none"
                      >
                        {timeSeries.available_date_columns?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A7B5AE]">Metric:</span>
                      <select
                        value={tsMetricCol}
                        onChange={(e) => {
                          setTsMetricCol(e.target.value);
                          handleUpdateTimeSeries(tsDateCol, e.target.value, tsFreq, tsAgg);
                        }}
                        className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs outline-none"
                      >
                        {timeSeries.available_metric_columns?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A7B5AE]">Interval:</span>
                      <select
                        value={tsFreq}
                        onChange={(e) => {
                          setTsFreq(e.target.value);
                          handleUpdateTimeSeries(tsDateCol, tsMetricCol, e.target.value, tsAgg);
                        }}
                        className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs outline-none"
                      >
                        <option value="D">Daily</option>
                        <option value="W">Weekly</option>
                        <option value="M">Monthly</option>
                        <option value="Q">Quarterly</option>
                        <option value="Y">Yearly</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#A7B5AE]">Aggregation:</span>
                      <select
                        value={tsAgg}
                        onChange={(e) => {
                          setTsAgg(e.target.value);
                          handleUpdateTimeSeries(tsDateCol, tsMetricCol, tsFreq, e.target.value);
                        }}
                        className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs outline-none"
                      >
                        <option value="mean">Mean</option>
                        <option value="sum">Sum</option>
                        <option value="median">Median</option>
                        <option value="count">Count</option>
                        <option value="min">Min</option>
                        <option value="max">Max</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 space-y-3">
                    <Plot
                      data={[
                        {
                          x: timeSeries.analysis?.dates,
                          y: timeSeries.analysis?.values,
                          type: 'scatter',
                          mode: 'lines+markers',
                          line: { color: '#20C997', width: 2.5 },
                          marker: { color: '#6EE7B7', size: 6 },
                          hovertemplate: '<b>%{x}</b><br>Value: %{y:.2f}<extra></extra>'
                        }
                      ]}
                      layout={{
                        ...darkPlotLayout,
                        height: 290,
                        xaxis: {
                          ...darkPlotLayout.xaxis,
                          title: { text: tsDateCol, font: { size: 10, color: '#A7B5AE' } }
                        },
                        yaxis: {
                          ...darkPlotLayout.yaxis,
                          title: { text: timeSeries.analysis?.readable_y_label || `${tsAgg.toUpperCase()} (${tsMetricCol})`, font: { size: 10, color: '#A7B5AE' } }
                        }
                      }}
                      config={{ responsive: true, displayModeBar: false }}
                      style={{ width: '100%' }}
                    />
                    {timeSeries.analysis?.trend_explanation && (
                      <div className="bg-[#14231E]/60 border border-[#244536] rounded-lg p-2.5 text-xs text-[#A7B5AE] flex items-center justify-between">
                        <span className="font-mono">{timeSeries.analysis.trend_explanation}</span>
                        <span className="px-2 py-0.5 rounded bg-[#20C997]/10 text-[#6EE7B7] text-[10px] font-bold border border-[#20C997]/30">
                          OLS Regression
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-[#A7B5AE] bg-[#080D0C]/40 rounded-xl border border-[#244536]">
                  ℹ️ {timeSeries.message || 'No date or timestamp columns found in this dataset for chronological analysis.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* I. CUSTOM VISUALIZATION BUILDER */}
      <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
        <div
          onClick={() => toggleSection('custom')}
          className="flex items-center justify-between pb-3 border-b border-[#244536] cursor-pointer"
        >
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-[#20C997]" /> Custom Visualization Builder
            </h3>
            <p className="text-xs text-[#A7B5AE]">Build customized charts with selective axes, groupings, and aggregation</p>
          </div>
          {openSections.custom ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {openSections.custom && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] text-[#A7B5AE] uppercase font-bold block mb-1">Chart Type</label>
                <select
                  value={customChartType}
                  onChange={(e) => handleChartTypeChange(e.target.value)}
                  className="w-full bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#20C997]"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="histogram">Histogram</option>
                  <option value="box">Box Plot</option>
                  <option value="donut">Donut / Pie</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#A7B5AE] uppercase font-bold block mb-1">X-Axis Column</label>
                <select
                  value={customX}
                  onChange={(e) => setCustomX(e.target.value)}
                  className="w-full bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#20C997]"
                >
                  {overview?.column_breakdown?.categorical?.length > 0 && (
                    <optgroup label="Categorical Features (Recommended for Bar / Pie)">
                      {overview.column_breakdown.categorical.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {overview?.column_breakdown?.temporal_components?.length > 0 && (
                    <optgroup label="Temporal Components (Year, Month, etc.)">
                      {overview.column_breakdown.temporal_components.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {overview?.column_breakdown?.datetime?.length > 0 && (
                    <optgroup label="Date Features (Recommended for Line)">
                      {overview.column_breakdown.datetime.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {overview?.column_breakdown?.numerical?.length > 0 && (
                    <optgroup label="Numerical Features (Recommended for Scatter / Histogram)">
                      {overview.column_breakdown.numerical.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  )}
                  {overview?.column_breakdown?.identifiers?.length > 0 && (
                    <optgroup label="Identifiers (Not Recommended for Aggregation)">
                      {overview.column_breakdown.identifiers.map(c => <option key={c} value={c}>{c} (ID)</option>)}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#A7B5AE] uppercase font-bold block mb-1">Y-Axis Column (Optional)</label>
                <select
                  value={customY}
                  onChange={(e) => setCustomY(e.target.value)}
                  className="w-full bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#20C997]"
                >
                  <option value="">None / Frequency Count</option>
                  {overview?.column_breakdown?.numerical?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#A7B5AE] uppercase font-bold block mb-1">Aggregation</label>
                <select
                  value={customAgg}
                  onChange={(e) => setCustomAgg(e.target.value)}
                  className="w-full bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1.5 text-xs outline-none focus:border-[#20C997]"
                >
                  <option value="mean">Mean</option>
                  <option value="sum">Sum</option>
                  <option value="median">Median</option>
                  <option value="count">Count</option>
                  <option value="min">Min</option>
                  <option value="max">Max</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleBuildCustomChart}
                  disabled={customLoading}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#20C997] to-[#17A57B] hover:from-[#6EE7B7] hover:to-[#20C997] text-[#080D0C] font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {customLoading ? 'Rendering...' : 'Generate Chart'}
                </button>
              </div>
            </div>

            {customWarning && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
                <HelpCircle size={15} className="shrink-0" /> {customWarning}
              </div>
            )}

            {customError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" /> {customError}
              </div>
            )}

            {customResult && (
              <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#244536]/60 text-xs">
                  <span className="font-bold text-white capitalize">{customResult.chart_type} Chart</span>
                  <span className="text-[#A7B5AE]">X: {customResult.x_column} {customResult.y_column && `| Y: ${customResult.y_column}`}</span>
                </div>
                <Plot
                  data={[
                    customResult.chart_type === 'scatter' ? {
                      x: customResult.x,
                      y: customResult.y,
                      mode: 'markers',
                      type: 'scatter',
                      marker: { color: '#20C997', size: 8, opacity: 0.8 },
                      hovertemplate: `<b>${customResult.x_column}</b>: %{x}<br><b>${customResult.y_column}</b>: %{y}<extra></extra>`
                    } : customResult.chart_type === 'line' ? {
                      x: customResult.x,
                      y: customResult.y,
                      mode: 'lines+markers',
                      type: 'scatter',
                      line: { color: '#20C997', width: 2 },
                      marker: { color: '#6EE7B7', size: 5 }
                    } : customResult.chart_type === 'histogram' ? {
                      x: customResult.data,
                      type: 'histogram',
                      marker: { color: '#20C997', opacity: 0.8 }
                    } : customResult.chart_type === 'donut' ? {
                      labels: customResult.labels,
                      values: customResult.values,
                      type: 'pie',
                      hole: 0.45,
                      textinfo: 'label+percent',
                      marker: {
                        colors: ['#20C997', '#6EE7B7', '#17A57B', '#244536', '#34D399', '#059669', '#10B981', '#A7B5AE']
                      }
                    } : customResult.chart_type === 'box' ? {
                      x: customResult.x || undefined,
                      y: customResult.y,
                      type: 'box',
                      marker: { color: '#20C997' }
                    } : {
                      x: customResult.labels || customResult.x,
                      y: customResult.values || customResult.y,
                      type: 'bar',
                      marker: { color: '#20C997' }
                    }
                  ]}
                  layout={{
                    ...darkPlotLayout,
                    height: 340,
                    xaxis: {
                      ...darkPlotLayout.xaxis,
                      title: { text: customResult.x_column, font: { size: 10, color: '#A7B5AE' } }
                    },
                    yaxis: {
                      ...darkPlotLayout.yaxis,
                      title: { text: customResult.y_column || 'Count', font: { size: 10, color: '#A7B5AE' } }
                    }
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
