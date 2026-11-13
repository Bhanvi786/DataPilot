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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { MOCK_ANALYSIS_DATA, MOCK_DATASETS } from '../data/mockData';

const GRADIENT_GREEN_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857'];

export default function DataAnalysis() {
  const [activeDataset] = useState(MOCK_DATASETS[0]);
  const { summary, distributions, categoricalBreakdown, correlationMatrix, missingValues, outliers } = MOCK_ANALYSIS_DATA;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Automated Data Analysis (EDA)"
        subtitle="Automated statistical distributions, correlation matrices, missing value diagnostics, and outlier assessments for staged datasets."
        badge="Autonomous EDA"
        actions={
          <NavLink
            to="/training"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            Proceed to Model Training
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        }
      />

      {/* Health & Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Dataset Quality Score"
          value={`${summary.healthScore}%`}
          subtitle="Calculated on completeness"
          badge="Healthy"
        />
        <MetricCard
          label="Numerical Columns"
          value={summary.numericalFeatures}
          subtitle="Continuous & discrete numbers"
          badge="Features"
        />
        <MetricCard
          label="Categorical Columns"
          value={summary.categoricalFeatures}
          subtitle="Nominal & ordinal labels"
          badge="Features"
        />
        <MetricCard
          label="Missing Cells Identified"
          value={summary.missingCells}
          subtitle="0.1% of entire matrix"
          badge="Attention"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Numerical Distributions */}
        <ChartCard
          title="Numerical Distributions (Sample: tenure_months)"
          subtitle="Histogram of record frequency across continuous tenure ranges"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distributions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a212d" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#768390' }} axisLine={{ stroke: '#1a212d' }} />
              <YAxis tick={{ fontSize: 11, fill: '#768390' }} axisLine={{ stroke: '#1a212d' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0d12',
                  borderColor: '#10b981',
                  borderRadius: '10px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Record Count" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Categorical Distributions */}
        <ChartCard
          title="Categorical Distribution (Sample: contract_type)"
          subtitle="Relative breakdown across contract subscription classifications"
        >
          <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-4">
            <ResponsiveContainer width={200} height={220}>
              <PieChart>
                <Pie
                  data={categoricalBreakdown}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {categoricalBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADIENT_GREEN_COLORS[index % GRADIENT_GREEN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0d12',
                    borderColor: '#10b981',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 text-xs">
              {categoricalBreakdown.map((item, idx) => (
                <div key={item.category} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: GRADIENT_GREEN_COLORS[idx % GRADIENT_GREEN_COLORS.length] }}
                  ></span>
                  <span className="font-medium text-white">{item.category}:</span>
                  <span className="text-emerald-400 font-mono">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Correlation Heatmap Section */}
      <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Feature Correlation Matrix (Pearson r)</h3>
            <p className="text-xs text-navy-400 mt-0.5">
              Identifies multicollinearity and high-impact relationships between numeric attributes.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            r ∈ [-1.0, +1.0]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="border-b border-[#1a212d] bg-[#0a0d12] text-navy-400 font-semibold font-mono">
                <th className="py-2.5 px-3 text-left">Feature</th>
                <th className="py-2.5 px-3">tenure_months</th>
                <th className="py-2.5 px-3">monthly_charges</th>
                <th className="py-2.5 px-3">total_charges</th>
                <th className="py-2.5 px-3">tickets</th>
                <th className="py-2.5 px-3">satisfaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a212d] font-mono">
              {correlationMatrix.map((row) => (
                <tr key={row.feature} className="hover:bg-[#121721]">
                  <td className="py-2.5 px-3 text-left font-semibold text-white bg-[#0a0d12]">
                    {row.feature}
                  </td>
                  {['tenure_months', 'monthly_charges', 'total_charges', 'tickets', 'satisfaction'].map((colKey) => {
                    const val = row[colKey] !== undefined ? row[colKey] : 1.0;
                    const isHigh = Math.abs(val) >= 0.6 && Math.abs(val) < 1.0;
                    return (
                      <td key={colKey} className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            val === 1.0
                              ? 'bg-[#18202c] text-white'
                              : isHigh
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold'
                              : val < 0
                              ? 'text-rose-400 bg-rose-950/40 border border-rose-500/20'
                              : 'text-navy-300'
                          }`}
                        >
                          {val.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics: Missing Values & Outliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Values Table */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle">
          <h3 className="text-sm font-bold text-white mb-1">Missing Value Analysis & Imputation Strategy</h3>
          <p className="text-xs text-navy-400 mb-4">Recommended handling prior to training execution.</p>

          <div className="space-y-3">
            {missingValues.map((mv) => (
              <div key={mv.column} className="flex items-center justify-between p-3 rounded-lg border border-[#1a212d] bg-[#0a0d12] text-xs">
                <div>
                  <span className="font-semibold font-mono text-white">{mv.column}</span>
                  <div className="text-[11px] text-navy-400 mt-0.5">
                    {mv.missingCount} null entries ({mv.missingPercent}%)
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  mv.missingCount > 0 
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {mv.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Outlier Diagnostics */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle">
          <h3 className="text-sm font-bold text-white mb-1">Outlier Diagnostics</h3>
          <p className="text-xs text-navy-400 mb-4">Interquartile range (IQR) and standard deviation analysis.</p>

          <div className="space-y-3">
            {outliers.map((ot) => (
              <div key={ot.column} className="flex items-center justify-between p-3 rounded-lg border border-[#1a212d] bg-[#0a0d12] text-xs">
                <div>
                  <span className="font-semibold font-mono text-white">{ot.column}</span>
                  <div className="text-[11px] text-navy-400 mt-0.5">
                    Method: {ot.method} • {ot.outlierCount} outliers
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
                  {ot.actionRecommended}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
