import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Trophy,
  CheckCircle2,
  GitCompare,
  ArrowRight,
  TrendingUp,
  Cpu,
  Download,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { MOCK_MODELS } from '../data/mockData';

export default function ModelComparison() {
  const [selectedTaskType, setSelectedTaskType] = useState('Classification');

  const filteredModels = MOCK_MODELS.filter((m) => m.problemType === selectedTaskType);
  const bestModel = filteredModels.find((m) => m.isBest) || filteredModels[0];

  // Benchmark chart data
  const comparisonChartData = filteredModels.map((m) => {
    if (m.problemType === 'Classification') {
      return {
        name: m.name.split(' ')[0],
        Accuracy: +(m.metrics.accuracy * 100).toFixed(1),
        F1Score: +(m.metrics.f1Score * 100).toFixed(1),
        ROCAUC: +(m.metrics.rocAuc * 100).toFixed(1)
      };
    } else {
      return {
        name: m.name.split(' ')[0],
        R2Score: +(m.metrics.r2 * 100).toFixed(1),
        RMSE: +m.metrics.rmse,
        MAE: +m.metrics.mae
      };
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Model Benchmark & Evaluation"
        subtitle="Compare algorithm performance across accuracy, ROC-AUC, F1 score, or regression RMSE/R² metrics. Automatically highlights the winning model."
        badge="Multi-Model Benchmark"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTaskType('Classification')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTaskType === 'Classification'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-navy-200 text-navy-700 hover:bg-slate-50'
                }`}
            >
              Classification Models
            </button>
            <button
              onClick={() => setSelectedTaskType('Regression')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTaskType === 'Regression'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-navy-200 text-navy-700 hover:bg-slate-50'
                }`}
            >
              Regression Models
            </button>
          </div>
        }
      />

      {/* Best Model Highlight Ribbon */}
      {bestModel && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border border-brand-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  Recommended Best Performer
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-100 text-brand-800">
                  {bestModel.problemType}
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy-950 mt-0.5">{bestModel.name}</h3>
              <p className="text-xs text-navy-500">
                Algorithm: {bestModel.algorithm} • Trained on {bestModel.dataset}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/predictions"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deploy & Predict
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      )}

      {/* Performance Comparison Chart */}
      <ChartCard
        title={`Benchmark Comparison (${selectedTaskType})`}
        subtitle="Cross-validated performance metrics across candidate algorithms"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {selectedTaskType === 'Classification' ? (
              <>
                <Bar dataKey="ROCAUC" fill="#9333ea" radius={[4, 4, 0, 0]} name="ROC-AUC (%)" />
                <Bar dataKey="Accuracy" fill="#c084fc" radius={[4, 4, 0, 0]} name="Accuracy (%)" />
                <Bar dataKey="F1Score" fill="#d8b4fe" radius={[4, 4, 0, 0]} name="F1 Score (%)" />
              </>
            ) : (
              <>
                <Bar dataKey="R2Score" fill="#9333ea" radius={[4, 4, 0, 0]} name="R² Score (%)" />
                <Bar dataKey="RMSE" fill="#c084fc" radius={[4, 4, 0, 0]} name="RMSE (Loss)" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Multiple Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className={`bg-white rounded-xl border p-5 shadow-subtle flex flex-col justify-between transition-all ${model.isBest ? 'border-brand-300 ring-1 ring-brand-300' : 'border-navy-200'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  {model.problemType}
                </span>
                {model.isBest && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                    <Trophy className="w-3 h-3 text-brand-600" />
                    Top Choice
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-navy-950">{model.name}</h4>
              <p className="text-xs text-navy-500 font-mono mt-0.5">{model.algorithm}</p>

              {/* Metrics Grid */}
              <div className="mt-4 pt-3 border-t border-navy-100 grid grid-cols-2 gap-2 text-xs">
                {model.problemType === 'Classification' ? (
                  <>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">ROC-AUC</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.rocAuc}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">Accuracy</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.accuracy}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">Precision</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.precision}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">Recall</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.recall}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">R² Score</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.r2}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">RMSE</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.rmse}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">MAE</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.mae}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-navy-100">
                      <span className="text-[10px] text-navy-400 block">MAPE</span>
                      <span className="font-bold text-navy-900 font-mono">{model.metrics.mape}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-navy-100 flex items-center justify-between text-xs text-navy-400">
              <span>Time: {model.trainingDuration}</span>
              <NavLink
                to="/predictions"
                className="font-semibold text-brand-600 hover:text-brand-800"
              >
                Inference →
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

