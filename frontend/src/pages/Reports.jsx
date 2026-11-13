import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Share2,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Cpu
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { MOCK_DATASETS, MOCK_MODELS, MOCK_ANALYSIS_DATA } from '../data/mockData';

export default function Reports() {
  const [downloading, setDownloading] = useState(false);
  const activeDataset = MOCK_DATASETS[0];
  const topModel = MOCK_MODELS[0];

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Report export simulation complete! (PDF generation will hook into Phase 2)');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Analytical Reports & Model Audit"
        subtitle="Consolidated technical summaries covering exploratory data distributions, missing handling, and model benchmark evaluations."
        badge="Executive Summary"
        actions={
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Generating PDF...' : 'Download Full PDF Report'}
          </button>
        }
      />

      {/* Report Canvas Container */}
      <div className="bg-white rounded-2xl border border-navy-200 p-8 shadow-subtle space-y-8">
        {/* Report Header */}
        <div className="border-b border-navy-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Automated ML Dossier
              </span>
              <span className="text-xs text-navy-400">• Generated Nov 13, 2026</span>
            </div>
            <h2 className="text-2xl font-black text-navy-950">
              Technical Audit: {activeDataset.name}
            </h2>
            <p className="text-xs text-navy-500 mt-1">
              Optimization Target: <span className="font-mono font-bold text-navy-800">{activeDataset.targetCandidate}</span> ({activeDataset.defaultProblemType})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg border border-navy-200 text-navy-600 hover:bg-navy-50 transition-colors"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Dataset Analysis Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900">
              1. Dataset Quality & Schema Analysis
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-navy-100 text-xs">
            <div>
              <span className="text-navy-400 block text-[11px]">Total Records</span>
              <span className="text-base font-bold text-navy-900 font-mono">
                {activeDataset.rowCount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-navy-400 block text-[11px]">Feature Dimensions</span>
              <span className="text-base font-bold text-navy-900 font-mono">
                {activeDataset.columnCount} columns
              </span>
            </div>
            <div>
              <span className="text-navy-400 block text-[11px]">Data Quality Index</span>
              <span className="text-base font-bold text-emerald-600 font-mono">
                98.4 / 100
              </span>
            </div>
            <div>
              <span className="text-navy-400 block text-[11px]">Missing Records Imputed</span>
              <span className="text-base font-bold text-navy-900 font-mono">
                15 cells
              </span>
            </div>
          </div>

          <p className="text-xs text-navy-600 leading-relaxed">
            The dataset was parsed without truncation. Continuous distributions for <code className="text-brand-700 bg-brand-50 px-1 py-0.5 rounded font-mono">tenure_months</code> and <code className="text-brand-700 bg-brand-50 px-1 py-0.5 rounded font-mono">monthly_charges</code> display normal variance with zero duplicate row anomalies.
          </p>
        </div>

        {/* Section 2: Model Performance Summary */}
        <div className="space-y-4 pt-4 border-t border-navy-100">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-900">
              2. Best Model Benchmark & Feature Attributions
            </h3>
          </div>

          <div className="p-4 rounded-xl border border-brand-200 bg-purple-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-brand-700">Winning Pipeline</span>
              <h4 className="text-base font-bold text-navy-950 font-mono">{topModel.name}</h4>
              <p className="text-xs text-navy-500 font-mono mt-0.5">{topModel.algorithm}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center">
                <span className="text-[10px] text-navy-400 block">ROC-AUC</span>
                <span className="text-sm font-bold text-brand-700">{topModel.metrics.rocAuc}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-navy-400 block">Accuracy</span>
                <span className="text-sm font-bold text-navy-900">{topModel.metrics.accuracy}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-navy-400 block">F1 Score</span>
                <span className="text-sm font-bold text-navy-900">{topModel.metrics.f1Score}</span>
              </div>
            </div>
          </div>

          {/* Feature Importance Table */}
          <div className="mt-3">
            <h4 className="text-xs font-semibold text-navy-700 mb-2">Key Drivers (SHAP Value Attributions):</h4>
            <div className="space-y-2">
              {topModel.featuresImportance.map((fi) => (
                <div key={fi.feature} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-navy-700 w-44 truncate">{fi.feature}</span>
                  <div className="flex-1 bg-navy-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-full"
                      style={{ width: `${fi.importance * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-mono text-navy-500 text-[11px] w-12 text-right">
                    {(fi.importance * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Next Actions */}
        <div className="pt-4 border-t border-navy-100 flex items-center justify-between text-xs text-navy-400">
          <span>DataPilot Engine • Phase 1 Documentation Draft</span>
          <span className="font-mono">Export format: Markdown / HTML / PDF</span>
        </div>
      </div>
    </div>
  );
}

