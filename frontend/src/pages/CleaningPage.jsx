import React, { useState, useEffect } from 'react';
import { useDataset } from '../context/DatasetContext';
import { 
  getDatasetProfile, 
  getDatasetQuality, 
  previewCleaning, 
  applyCleaning, 
  resetCleaning,
  getExportUrl
} from '../services/api';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  Download, 
  Layers, 
  Table2, 
  ArrowRight,
  Sliders,
  Eye,
  Check,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CleaningPage = () => {
  const { datasetId, metadata, setDataset } = useDataset();
  const [profileData, setProfileData] = useState(null);
  const [qualityData, setQualityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('missing'); // 'missing' | 'duplicates' | 'types' | 'outliers' | 'standardize'
  
  // Cleaning configuration state
  const [missingConfig, setMissingConfig] = useState({});
  const [duplicateAction, setDuplicateAction] = useState('remove');
  const [duplicateKeep, setDuplicateKeep] = useState('first');
  const [typeConfig, setTypeConfig] = useState({});
  const [outlierConfig, setOutlierConfig] = useState({});
  const [stdConfig, setStdConfig] = useState({
    strip_whitespace: true,
    empty_strings_to_nan: true,
    case_standardization: {},
  });

  // Preview & Result states
  const [previewResult, setPreviewResult] = useState(null);
  const [applyResult, setApplyResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProfile = async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      const [prof, qual] = await Promise.all([
        getDatasetProfile(datasetId),
        getDatasetQuality(datasetId)
      ]);
      setProfileData(prof);
      setQualityData(qual);

      // Initialize default missing strategies
      const initialMissing = {};
      prof.missing_report.forEach((item) => {
        initialMissing[item.column_name] = {
          action: item.default_treatment,
          value: ''
        };
      });
      setMissingConfig(initialMissing);

      // Initialize outlier configs
      const initialOutliers = {};
      prof.outliers_report.forEach((item) => {
        initialOutliers[item.column_name] = 'keep';
      });
      setOutlierConfig(initialOutliers);

    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [datasetId]);

  if (!datasetId) {
    return (
      <div className="bg-[#14231E] border border-[#244536] rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997] mx-auto">
          <Sparkles size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No Dataset Uploaded</h2>
        <p className="text-sm text-[#A7B5AE] max-w-md mx-auto">
          Please upload a CSV or Excel dataset first to use the automated data cleaning engine.
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

  const buildPayload = () => ({
    missing_values: missingConfig,
    duplicates: {
      action: duplicateAction,
      keep: duplicateKeep
    },
    data_types: typeConfig,
    outliers: outlierConfig,
    standardization: stdConfig
  });

  const handlePreviewCleaning = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await previewCleaning(datasetId, buildPayload());
      setPreviewResult(res);
      setStatusMessage({ type: 'info', text: 'Cleaning preview generated! Inspect the proposed transformations below.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCleaning = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await applyCleaning(datasetId, buildPayload());
      setApplyResult(res);
      setStatusMessage({ type: 'success', text: 'Cleaned dataset version generated successfully!' });
      // Refresh profile with cleaned data
      await fetchProfile();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetCleaning = async () => {
    setIsProcessing(true);
    try {
      await resetCleaning(datasetId);
      setPreviewResult(null);
      setApplyResult(null);
      setStatusMessage({ type: 'info', text: 'Active dataset state reset back to original uploaded version.' });
      await fetchProfile();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#244536] gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Phase 2 Automated Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Dynamic Data Processing & Cleaning
          </h1>
          <p className="text-sm text-[#A7B5AE] mt-1">
            Configure column-wise imputations, outlier mitigation, type casting, and standardizations non-destructively.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviewCleaning}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D1512] border border-[#244536] text-white hover:border-[#20C997] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Eye size={15} className="text-[#20C997]" /> Preview Changes
          </button>
          <button
            onClick={handleApplyCleaning}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#20C997] to-[#17A57B] hover:from-[#6EE7B7] hover:to-[#20C997] text-[#080D0C] font-bold text-xs shadow-lg shadow-[#20C997]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Check size={16} /> Apply Selected Cleaning
          </button>
          <button
            onClick={handleResetCleaning}
            disabled={isProcessing}
            title="Reset to original uploaded data"
            className="p-2 rounded-lg bg-[#14231E] border border-[#244536] text-[#A7B5AE] hover:text-white hover:border-red-500/60 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
          statusMessage.type === 'success' 
            ? 'bg-[#20C997]/10 border-[#20C997]/40 text-[#6EE7B7]'
            : statusMessage.type === 'error'
            ? 'bg-red-950/40 border-red-800/60 text-red-300'
            : 'bg-blue-950/40 border-blue-800/60 text-blue-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* A. Data Quality Overview */}
      {qualityData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Health Score</div>
            <div className="text-2xl font-black text-[#6EE7B7] mt-1">{qualityData.quality_score}/100</div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Total Records</div>
            <div className="text-2xl font-black text-white mt-1">{qualityData.total_records.toLocaleString()}</div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Missing Values</div>
            <div className={`text-2xl font-black mt-1 ${qualityData.total_missing_values > 0 ? 'text-amber-400' : 'text-white'}`}>
              {qualityData.total_missing_values.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Duplicate Rows</div>
            <div className={`text-2xl font-black mt-1 ${qualityData.total_duplicate_rows > 0 ? 'text-rose-400' : 'text-white'}`}>
              {qualityData.total_duplicate_rows.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#14231E] border border-[#244536] rounded-xl p-4">
            <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Attention Columns</div>
            <div className="text-2xl font-black text-white mt-1">{qualityData.attention_columns.length}</div>
          </div>
        </div>
      )}

      {/* Cleaning Config Tabs */}
      <div className="bg-[#14231E] border border-[#244536] rounded-xl overflow-hidden shadow-xl">
        <div className="flex border-b border-[#244536] bg-[#0D1512] overflow-x-auto">
          {[
            { id: 'missing', label: '1. Missing Values', icon: AlertTriangle },
            { id: 'duplicates', label: '2. Duplicates', icon: Copy },
            { id: 'types', label: '3. Data Types', icon: Sliders },
            { id: 'outliers', label: '4. Outlier Analysis', icon: ShieldAlert },
            { id: 'standardize', label: '5. Standardization', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#20C997] text-[#6EE7B7] bg-[#14231E]'
                    : 'border-transparent text-[#A7B5AE] hover:text-white hover:bg-[#14231E]/40'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB 1: MISSING VALUES */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Missing Value Imputation</h3>
                <p className="text-xs text-[#A7B5AE]">Configure how missing fields are handled per column.</p>
              </div>

              {profileData?.missing_report.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6EE7B7] bg-[#080D0C]/40 rounded-xl border border-[#244536]">
                  🎉 No missing values detected in this dataset!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0D1512] border-b border-[#244536]">
                      <tr>
                        <th className="py-3 px-4 font-bold text-white uppercase">Column</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Missing Count</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Percentage</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Selected Treatment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#244536]/60">
                      {profileData?.missing_report.map((item) => {
                        const col = item.column_name;
                        const current = missingConfig[col] || { action: 'keep', value: '' };

                        return (
                          <tr key={col} className="hover:bg-[#0D1512]/40">
                            <td className="py-3 px-4 font-semibold text-white">{col}</td>
                            <td className="py-3 px-4 text-amber-400 font-bold">{item.missing_count}</td>
                            <td className="py-3 px-4 text-[#A7B5AE]">{item.missing_percentage}%</td>
                            <td className="py-3 px-4 flex items-center gap-2">
                              <select
                                value={current.action}
                                onChange={(e) =>
                                  setMissingConfig({
                                    ...missingConfig,
                                    [col]: { ...current, action: e.target.value }
                                  })
                                }
                                className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs focus:border-[#20C997] outline-none"
                              >
                                {item.is_numeric && <option value="mean">Mean Imputation</option>}
                                {item.is_numeric && <option value="median">Median Imputation</option>}
                                <option value="mode">Mode Imputation (Most Frequent)</option>
                                <option value="constant">Custom Constant</option>
                                <option value="drop_rows">Drop Rows</option>
                                <option value="keep">Keep Missing</option>
                              </select>

                              {current.action === 'constant' && (
                                <input
                                  type="text"
                                  placeholder="Replacement value..."
                                  value={current.value}
                                  onChange={(e) =>
                                    setMissingConfig({
                                      ...missingConfig,
                                      [col]: { ...current, value: e.target.value }
                                    })
                                  }
                                  className="bg-[#0D1512] border border-[#244536] text-white rounded px-2 py-1 text-xs focus:border-[#20C997] outline-none w-36"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DUPLICATES */}
          {activeTab === 'duplicates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Duplicate Detection & Management</h3>
                <p className="text-xs text-[#A7B5AE]">Identify identical records across all features.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-5">
                  <div className="text-xs font-bold text-[#A7B5AE] uppercase">Identified Duplicate Rows</div>
                  <div className="text-3xl font-extrabold text-[#6EE7B7] mt-2">
                    {profileData?.duplicates_report?.duplicate_count || 0}
                  </div>
                  <p className="text-xs text-[#A7B5AE] mt-2">
                    {profileData?.duplicates_report?.total_duplicate_cluster_records || 0} total records share identical values.
                  </p>
                </div>

                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-white uppercase">Duplicate Action Strategy</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        name="dup_action"
                        value="remove"
                        checked={duplicateAction === 'remove'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-[#20C997]"
                      />
                      <span>Remove duplicate rows (keep first occurrence)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input
                        type="radio"
                        name="dup_action"
                        value="keep"
                        checked={duplicateAction === 'keep'}
                        onChange={(e) => setDuplicateAction(e.target.value)}
                        className="accent-[#20C997]"
                      />
                      <span>Retain duplicate rows (do not remove)</span>
                    </label>
                  </div>
                </div>
              </div>

              {profileData?.duplicates_report?.preview_records?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-white">Previewing Sample Duplicate Records:</div>
                  <div className="overflow-x-auto max-h-48 border border-[#244536] rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#0D1512] border-b border-[#244536]">
                        <tr>
                          {Object.keys(profileData.duplicates_report.preview_records[0]).map((k) => (
                            <th key={k} className="py-2 px-3 text-[#6EE7B7] uppercase">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#244536]/40 font-mono">
                        {profileData.duplicates_report.preview_records.map((r, idx) => (
                          <tr key={idx} className="hover:bg-[#0D1512]/60">
                            {Object.values(r).map((v, cIdx) => (
                              <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap text-white">
                                {String(v ?? 'NaN')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA TYPES */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Data Type Castings</h3>
                <p className="text-xs text-[#A7B5AE]">Correct or standardize column data types explicitly.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0D1512] border-b border-[#244536]">
                    <tr>
                      <th className="py-3 px-4 font-bold text-white uppercase">Column</th>
                      <th className="py-3 px-4 font-bold text-white uppercase">Raw Type</th>
                      <th className="py-3 px-4 font-bold text-white uppercase">Classified Type</th>
                      <th className="py-3 px-4 font-bold text-white uppercase">Convert To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#244536]/60">
                    {profileData?.profile?.columns?.map((col) => {
                      const cName = col.column_name;
                      return (
                        <tr key={cName} className="hover:bg-[#0D1512]/40">
                          <td className="py-3 px-4 font-semibold text-white">{cName}</td>
                          <td className="py-3 px-4 font-mono text-[#A7B5AE]">{col.raw_data_type}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-[#244536]/60 text-[#6EE7B7] text-[11px] font-semibold">
                              {col.classified_type}
                            </span>
                            {col.is_date_candidate && (
                              <span className="ml-2 text-[10px] text-amber-400 font-bold">Date Candidate</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={typeConfig[cName] || ''}
                              onChange={(e) =>
                                setTypeConfig({
                                  ...typeConfig,
                                  [cName]: e.target.value
                                })
                              }
                              className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs focus:border-[#20C997] outline-none"
                            >
                              <option value="">Keep Original Type</option>
                              <option value="Integer">Integer</option>
                              <option value="Float">Float</option>
                              <option value="String">String / Text</option>
                              <option value="Boolean">Boolean</option>
                              <option value="Date">Date (YYYY-MM-DD)</option>
                              <option value="Categorical">Categorical</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OUTLIER ANALYSIS */}
          {activeTab === 'outliers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Interquartile Range (IQR) Outlier Mitigation</h3>
                <p className="text-xs text-[#A7B5AE]">Detects numerical anomalies outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR].</p>
              </div>

              {profileData?.outliers_report?.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#6EE7B7] bg-[#080D0C]/40 rounded-xl border border-[#244536]">
                  No numerical outliers detected in numeric feature columns.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#0D1512] border-b border-[#244536]">
                      <tr>
                        <th className="py-3 px-4 font-bold text-white uppercase">Column</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Bounds [Lower, Upper]</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Outliers Count</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Percentage</th>
                        <th className="py-3 px-4 font-bold text-white uppercase">Treatment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#244536]/60">
                      {profileData.outliers_report.map((item) => {
                        const col = item.column_name;
                        return (
                          <tr key={col} className="hover:bg-[#0D1512]/40">
                            <td className="py-3 px-4 font-semibold text-white">{col}</td>
                            <td className="py-3 px-4 font-mono text-[#A7B5AE]">
                              [{item.lower_bound}, {item.upper_bound}]
                            </td>
                            <td className="py-3 px-4 text-rose-400 font-bold">{item.outlier_count}</td>
                            <td className="py-3 px-4 text-[#A7B5AE]">{item.outlier_percentage}%</td>
                            <td className="py-3 px-4">
                              <select
                                value={outlierConfig[col] || 'keep'}
                                onChange={(e) =>
                                  setOutlierConfig({
                                    ...outlierConfig,
                                    [col]: e.target.value
                                  })
                                }
                                className="bg-[#0D1512] border border-[#244536] text-white rounded px-2.5 py-1 text-xs focus:border-[#20C997] outline-none"
                              >
                                <option value="keep">Keep Outliers</option>
                                <option value="cap">Cap to Boundaries</option>
                                <option value="remove">Remove Outlier Rows</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STANDARDIZATION */}
          {activeTab === 'standardize' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Text & Value Standardization</h3>
                <p className="text-xs text-[#A7B5AE]">Clean whitespace and handle empty representations.</p>
              </div>

              <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-5 space-y-4 max-w-xl">
                <label className="flex items-center gap-3 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stdConfig.strip_whitespace}
                    onChange={(e) => setStdConfig({ ...stdConfig, strip_whitespace: e.target.checked })}
                    className="accent-[#20C997] w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold">Strip Whitespace</div>
                    <div className="text-[11px] text-[#A7B5AE]">Removes leading and trailing spaces from all text columns</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stdConfig.empty_strings_to_nan}
                    onChange={(e) => setStdConfig({ ...stdConfig, empty_strings_to_nan: e.target.checked })}
                    className="accent-[#20C997] w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold">Convert Empty Strings to NaN</div>
                    <div className="text-[11px] text-[#A7B5AE]">Unifies whitespace-only strings into recognizable missing values</div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BEFORE & AFTER SUMMARY (If preview or applied) */}
      {(previewResult || applyResult) && (
        <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#244536]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📊</span> {applyResult ? 'Cleaned Dataset Summary' : 'Proposed Transformations Impact'}
              </h3>
              <p className="text-xs text-[#A7B5AE]">Before-and-after comparison across primary dataset dimensions</p>
            </div>

            {applyResult && (
              <div className="flex items-center gap-2">
                <a
                  href={getExportUrl(datasetId, 'csv', 'cleaned')}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20C997] text-[#080D0C] font-bold text-xs hover:bg-[#6EE7B7] transition-all"
                >
                  <Download size={14} /> Download Cleaned CSV
                </a>
                <a
                  href={getExportUrl(datasetId, 'xlsx', 'cleaned')}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1512] border border-[#244536] text-white hover:border-[#20C997] text-xs font-semibold transition-all"
                >
                  <Download size={14} /> Download Excel
                </a>
              </div>
            )}
          </div>

          {/* Comparison Cards */}
          {(() => {
            const summary = (applyResult || previewResult)?.summary;
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4">
                  <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Rows (Before → After)</div>
                  <div className="text-xl font-black text-white mt-1">
                    {summary.initial_rows} <span className="text-[#20C997]">→</span> {summary.cleaned_rows}
                  </div>
                </div>

                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4">
                  <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Missing (Before → After)</div>
                  <div className="text-xl font-black text-white mt-1">
                    {summary.initial_missing} <span className="text-[#20C997]">→</span>{' '}
                    <span className={summary.remaining_missing === 0 ? 'text-[#6EE7B7]' : 'text-amber-400'}>
                      {summary.remaining_missing}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4">
                  <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Duplicates (Before → After)</div>
                  <div className="text-xl font-black text-white mt-1">
                    {summary.initial_duplicates} <span className="text-[#20C997]">→</span>{' '}
                    <span className="text-[#6EE7B7]">{summary.remaining_duplicates}</span>
                  </div>
                </div>

                <div className="bg-[#0D1512] border border-[#244536] rounded-xl p-4">
                  <div className="text-[10px] text-[#A7B5AE] uppercase font-bold">Operations Performed</div>
                  <div className="text-xl font-black text-[#6EE7B7] mt-1">
                    {summary.transformations_applied?.length || 0}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Operations list */}
          {(applyResult || previewResult)?.summary?.transformations_applied?.length > 0 && (
            <div className="bg-[#080D0C]/40 border border-[#244536] rounded-lg p-3">
              <div className="text-[11px] font-bold text-[#6EE7B7] uppercase mb-1">Applied Transformation Log:</div>
              <ul className="list-disc list-inside text-xs text-[#A7B5AE] space-y-1">
                {(applyResult || previewResult).summary.transformations_applied.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview rows if from preview */}
          {previewResult?.preview_rows?.length > 0 && (
            <div className="space-y-2 mt-4">
              <div className="text-xs font-bold text-white">Previewing First 10 Proposed Cleaned Rows:</div>
              <div className="overflow-x-auto max-h-56 border border-[#244536] rounded-lg">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-[#0D1512] border-b border-[#244536]">
                    <tr>
                      {previewResult.columns.map((c) => (
                        <th key={c} className="py-2 px-3 text-[#6EE7B7] uppercase">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#244536]/40">
                    {previewResult.preview_rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#0D1512]/60">
                        {previewResult.columns.map((c) => (
                          <td key={c} className="py-1.5 px-3 whitespace-nowrap text-white">
                            {row[c] === null ? <span className="text-red-400 italic">null</span> : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
