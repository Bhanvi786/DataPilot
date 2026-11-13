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
        badge="Phase 1 UI Mock"
        actions={
          <NavLink
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Dataset
          </NavLink>
        }
      />

      {/* Notice Banner */}
      <div className="p-4 rounded-xl bg-purple-50/70 border border-brand-200/80 text-xs text-brand-900 flex items-start gap-3">
        <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></span>
        <div>
          <span className="font-semibold">Universal Machine Learning Platform:</span> Metrics, datasets, and benchmark results shown below are realistic mock entities simulating various domains (Customer Churn classification, Hospital Length of Stay regression, IoT Turbine efficiency).
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Recent Datasets</h3>
              <p className="text-xs text-navy-400">Datasets uploaded and available for exploratory analysis and ML training</p>
            </div>
            <NavLink
              to="/upload"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Upload New
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-navy-100 text-navy-500 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Dataset Name</th>
                  <th className="py-2.5 px-3">Rows</th>
                  <th className="py-2.5 px-3">Columns</th>
                  <th className="py-2.5 px-3">Target Candidate</th>
                  <th className="py-2.5 px-3">Problem Type</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 font-mono">
                {MOCK_DATASETS.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-navy-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate max-w-[170px]" title={ds.name}>{ds.name}</span>
                    </td>
                    <td className="py-3 px-3 text-navy-600">{ds.rowCount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-navy-600">{ds.columnCount}</td>
                    <td className="py-3 px-3 text-navy-800 font-semibold">{ds.targetCandidate}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ds.defaultProblemType === 'Classification'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                        {ds.defaultProblemType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <NavLink
                        to="/preview"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-800"
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
        <div className="bg-white rounded-xl border border-navy-200 shadow-subtle p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>
            <span className="text-[11px] text-navy-400">Live Workspace</span>
          </div>

          <div className="space-y-4">
            {MOCK_ACTIVITY_LOGS.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-xs pb-3 border-b border-navy-100 last:border-none last:pb-0">
                <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-navy-900">{item.action}</div>
                  <p className="text-navy-500 text-[11px] mt-0.5 leading-snug">{item.details}</p>
                  <span className="text-[10px] text-navy-400 mt-1 inline-block">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-navy-100">
            <NavLink
              to="/training"
              className="w-full py-2 px-3 rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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

