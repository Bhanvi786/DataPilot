import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Table,
  BarChart3,
  Cpu,
  GitCompare,
  Sparkles,
  FileText,
  Settings,
  Database,
  Layers,
  ChevronRight,
  X,
  Trash2
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Dataset', href: '/upload', icon: UploadCloud },
  { name: 'Data Preview', href: '/preview', icon: Table },
  { name: 'Data Analysis', href: '/analysis', icon: BarChart3 },
  { name: 'Model Training', href: '/training', icon: Cpu },
  { name: 'Model Comparison', href: '/comparison', icon: GitCompare },
  { name: 'Predictions', href: '/predictions', icon: Sparkles },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { activeDataset, clearActiveDataset, backendOnline } = useDataset();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-navy-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-navy-100">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-violet flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-navy-950 flex items-center gap-1">
                DataPilot
                <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-1 rounded uppercase tracking-wider">v2.0</span>
              </span>
              <p className="text-[10px] text-navy-400 font-medium tracking-tight">AutoML Platform</p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-navy-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Platform Menu
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative
                  ${isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-navy-600 hover:bg-slate-100/70 hover:text-navy-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-600' : 'text-navy-400 group-hover:text-navy-700'
                    }`} />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Active Workspace / Dataset Indicator */}
        <div className="p-4 border-t border-navy-100 bg-slate-50/60 m-3 rounded-xl border">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeDataset ? 'bg-emerald-500 animate-pulse' : 'bg-navy-300'}`}></span>
              <span className="text-[11px] font-semibold text-navy-700">
                {activeDataset ? 'Active Dataset' : 'No Dataset Selected'}
              </span>
            </div>
            {activeDataset && (
              <button
                onClick={clearActiveDataset}
                title="Remove active dataset"
                className="text-navy-400 hover:text-rose-600 p-0.5 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {activeDataset ? (
            <>
              <p className="text-xs font-mono font-medium text-navy-900 truncate" title={activeDataset.filename}>
                {activeDataset.filename}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-navy-500">
                <span>{activeDataset.row_count?.toLocaleString()} rows</span>
                <span>{activeDataset.column_count} columns</span>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-navy-400 mt-1">
              Upload a CSV or XLSX to begin analysis.
            </p>
          )}

          {/* Backend Status Pill */}
          <div className="mt-3 pt-2.5 border-t border-navy-200/60 flex items-center justify-between text-[10px] text-navy-400">
            <span>FastAPI Backend:</span>
            <span className={`font-semibold ${backendOnline === true ? 'text-emerald-600' : backendOnline === false ? 'text-rose-600' : 'text-amber-600'}`}>
              {backendOnline === true ? 'Online (8000)' : backendOnline === false ? 'Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
