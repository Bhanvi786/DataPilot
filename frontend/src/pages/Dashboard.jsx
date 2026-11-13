import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Database,
  Cpu,
  BarChart3,
  UploadCloud,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { MOCK_DATASETS, MOCK_ACTIVITY_LOGS } from '../data/mockData';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Welcome back, Research Analyst"
        subtitle="Manage your enterprise datasets, inspect automated analysis, and train dynamic ML models."
        badge="Phase 2 Backend Connected"
        actions={
          <NavLink
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Dataset
          </NavLink>
        }
      />

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-[#0e131a] border border-emerald-500/20 text-xs text-navy-400 flex items-start gap-3 shadow-subtle">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] mt-1.5 shrink-0"></span>
        <div>
          <span className="font-bold text-white">Universal Machine Learning Platform:</span> Upload any custom dataset or test with multi-domain benchmarks (Classification & Regression) with automated FastAPI schema parsing.
        </div>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Datasets Staged"
          value="3 Active"
          change="+1 this week"
          trend="up"
          icon={Database}
          description="2 CSVs, 1 XLSX formatted"
        />
        <StatCard
          title="Models Trained & Benchmarked"
          value="12 Models"
          change="+4 runs today"
          trend="up"
          icon={Cpu}
          description="Classification & Regression"
        />
        <StatCard
          title="Analyses Performed"
          value="28 EDA Runs"
          change="99.2% Health"
          trend="up"
          icon={BarChart3}
          description="Statistical distribution reports"
        />
      </div>

      {/* Main Content Grid: Recent Datasets & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Datasets */}
        <div className="lg:col-span-2 bg-[#0e131a] rounded-xl border border-[#1a212d] shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Datasets</h3>
              <p className="text-xs text-navy-400">Datasets uploaded and available for exploratory analysis and ML training</p>
            </div>
            <NavLink
              to="/upload"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              Upload New
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1a212d] text-navy-400 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Dataset Name</th>
                  <th className="py-2.5 px-3">Rows</th>
                  <th className="py-2.5 px-3">Columns</th>
                  <th className="py-2.5 px-3">Target Candidate</th>
                  <th className="py-2.5 px-3">Problem Type</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a212d] font-mono">
                {MOCK_DATASETS.map((ds) => (
                  <tr key={ds.id} className="hover:bg-[#121721] transition-colors">
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-[170px]" title={ds.name}>{ds.name}</span>
                    </td>
                    <td className="py-3 px-3 text-navy-400">{ds.rowCount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-navy-400">{ds.columnCount}</td>
                    <td className="py-3 px-3 text-white font-semibold">{ds.targetCandidate}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ds.defaultProblemType === 'Classification' 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                      }`}>
                        {ds.defaultProblemType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <NavLink
                        to="/preview"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        Explore →
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Activity Logs Feed */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">Live Workspace</span>
          </div>

          <div className="space-y-4">
            {MOCK_ACTIVITY_LOGS.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-xs pb-3 border-b border-[#1a212d] last:border-none last:pb-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">{item.action}</div>
                  <p className="text-navy-400 text-[11px] mt-0.5 leading-snug">{item.details}</p>
                  <span className="text-[10px] text-navy-400 mt-1 inline-block">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[#1a212d]">
            <NavLink
              to="/training"
              className="w-full py-2 px-3 rounded-lg bg-[#121721] hover:bg-[#18202c] border border-[#1f2836] text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Start Automated ML Run
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
