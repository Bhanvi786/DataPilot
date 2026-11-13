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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTaskType === 'Classification'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-[#0e131a] border border-[#1f2836] text-navy-400 hover:text-white'
              }`}
            >
              Classification Models
            </button>
            <button
              onClick={() => setSelectedTaskType('Regression')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTaskType === 'Regression'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-[#0e131a] border border-[#1f2836] text-navy-400 hover:text-white'
              }`}
            >
              Regression Models
            </button>
          </div>
        }
      />

      {/* Best Model Highlight Ribbon */}
      {bestModel && (
        <div className="p-5 rounded-2xl bg-[#0e131a] border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Best Performer
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  {bestModel.problemType}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{bestModel.name}</h3>
              <p className="text-xs text-navy-400">
                Algorithm: {bestModel.algorithm} • Trained on {bestModel.dataset}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/predictions"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 transition-all"
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
            <CartesianGrid strokeDasharray="3 3" stroke="#1a212d" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#768390' }} axisLine={{ stroke: '#1a212d' }} />
            <YAxis tick={{ fontSize: 11, fill: '#768390' }} axisLine={{ stroke: '#1a212d' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0d12',
                borderColor: '#10b981',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {selectedTaskType === 'Classification' ? (
              <>
                <Bar dataKey="ROCAUC" fill="#10b981" radius={[4, 4, 0, 0]} name="ROC-AUC (%)" />
                <Bar dataKey="Accuracy" fill="#34d399" radius={[4, 4, 0, 0]} name="Accuracy (%)" />
                <Bar dataKey="F1Score" fill="#059669" radius={[4, 4, 0, 0]} name="F1 Score (%)" />
              </>
            ) : (
              <>
                <Bar dataKey="R2Score" fill="#10b981" radius={[4, 4, 0, 0]} name="R² Score (%)" />
                <Bar dataKey="RMSE" fill="#34d399" radius={[4, 4, 0, 0]} name="RMSE (Loss)" />
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
            className={`bg-[#0e131a] rounded-xl border p-5 shadow-subtle flex flex-col justify-between transition-all ${
              model.isBest ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.08)]' : 'border-[#1a212d]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
                  {model.problemType}
                </span>
                {model.isBest && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    Top Choice
                  </span>
                )}
              </div>

              <h4 className="text-base font-bold text-white">{model.name}</h4>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">{model.algorithm}</p>

              {/* Metrics Grid */}
              <div className="mt-4 pt-3 border-t border-[#1a212d] grid grid-cols-2 gap-2 text-xs">
                {model.problemType === 'Classification' ? (
                  <>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">ROC-AUC</span>
                      <span className="font-bold text-emerald-400 font-mono">{model.metrics.rocAuc}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">Accuracy</span>
                      <span className="font-bold text-white font-mono">{model.metrics.accuracy}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">Precision</span>
                      <span className="font-bold text-white font-mono">{model.metrics.precision}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">Recall</span>
                      <span className="font-bold text-white font-mono">{model.metrics.recall}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">R² Score</span>
                      <span className="font-bold text-emerald-400 font-mono">{model.metrics.r2}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">RMSE</span>
                      <span className="font-bold text-white font-mono">{model.metrics.rmse}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">MAE</span>
                      <span className="font-bold text-white font-mono">{model.metrics.mae}</span>
                    </div>
                    <div className="p-2 rounded bg-[#0a0d12] border border-[#1a212d]">
                      <span className="text-[10px] text-navy-400 block">MAPE</span>
                      <span className="font-bold text-white font-mono">{model.metrics.mape}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1a212d] flex items-center justify-between text-xs text-navy-400">
              <span>Time: {model.trainingDuration}</span>
              <NavLink
                to="/predictions"
                className="font-semibold text-emerald-400 hover:text-emerald-300"
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
