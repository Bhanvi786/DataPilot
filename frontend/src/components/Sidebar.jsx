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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a0d12] border-r border-[#1a212d] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1a212d]">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-black shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                DataPilot
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded uppercase tracking-wider">v2.0</span>
              </span>
              <p className="text-[10px] text-emerald-500/80 font-medium tracking-tight">AutoML Platform</p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-white lg:hidden"
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
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-400 font-semibold border-l-2 border-emerald-500'
                    : 'text-navy-500 hover:bg-[#121721] hover:text-navy-800'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-navy-400 group-hover:text-emerald-400'
                    }`} />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Active Workspace / Dataset Indicator */}
        <div className="p-4 border border-[#1a212d] bg-[#0e131a] m-3 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeDataset ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse' : 'bg-navy-300'}`}></span>
              <span className="text-[11px] font-semibold text-navy-700">
                {activeDataset ? 'Active Dataset' : 'No Dataset Selected'}
              </span>
            </div>
            {activeDataset && (
              <button
                onClick={clearActiveDataset}
                title="Remove active dataset"
                className="text-navy-400 hover:text-rose-400 p-0.5 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          {activeDataset ? (
            <>
              <p className="text-xs font-mono font-medium text-white truncate" title={activeDataset.filename}>
                {activeDataset.filename}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-navy-400">
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
          <div className="mt-3 pt-2.5 border-t border-[#1a212d] flex items-center justify-between text-[10px] text-navy-400">
            <span>FastAPI Backend:</span>
            <span className={`font-semibold ${backendOnline === true ? 'text-emerald-400' : backendOnline === false ? 'text-rose-400' : 'text-amber-400'}`}>
              {backendOnline === true ? 'Online (8000)' : backendOnline === false ? 'Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
