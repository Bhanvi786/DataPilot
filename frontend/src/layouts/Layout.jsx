import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  UploadCloud, 
  Table2, 
  Sparkles,
  BarChart3,
  LayoutDashboard,
  Settings, 
  Info, 
  Database,
  Activity
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

const navigationItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Upload Dataset', path: '/upload', icon: UploadCloud },
  { name: 'Data Overview', path: '/overview', icon: Table2 },
  { name: 'Data Cleaning', path: '/cleaning', icon: Sparkles },
  { name: 'Automated EDA', path: '/eda', icon: BarChart3 },
  { name: 'Analytics Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'About DataPilot', path: '/about', icon: Info },
];

export const Layout = ({ children }) => {
  const { metadata } = useDataset();

  return (
    <div className="flex min-h-screen bg-[#080D0C] text-white">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-[#0D1512] border-r border-[#244536] flex flex-col z-30">
        {/* Brand */}
        <div className="p-6 border-b border-[#244536]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20C997] to-[#14231E] border border-[#20C997]/60 flex items-center justify-center shadow-lg shadow-[#20C997]/20">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white leading-tight">DataPilot</div>
              <div className="text-[11px] font-semibold text-[#6EE7B7] tracking-wider uppercase">Auto Intelligence</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#14231E] text-[#20C997] border border-[#244536] shadow-md shadow-black/40 font-semibold'
                      : 'text-[#A7B5AE] hover:text-[#6EE7B7] hover:bg-[#14231E]/50'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Active Dataset Status Widget */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-[#14231E] border border-[#244536]">
          <div className="text-[10px] font-bold text-[#A7B5AE] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Database size={12} className="text-[#20C997]" /> Active Dataset
          </div>
          {metadata ? (
            <div>
              <div className="text-xs font-bold text-[#6EE7B7] truncate max-w-[190px]">
                {metadata.file_name}
              </div>
              <div className="text-[11px] text-[#A7B5AE] mt-0.5">
                {metadata.records?.toLocaleString()} rows • {metadata.features} cols
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#A7B5AE]/70 italic">No dataset uploaded</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-[#244536] text-[11px] text-[#A7B5AE] flex items-center justify-between">
          <span>v3.0.0-phase3</span>
          <span className="flex items-center gap-1.5 text-[#20C997]">
            <span className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse"></span>
            Online
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#080D0C]/90 backdrop-blur-md border-b border-[#244536] px-8 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#20C997]">⚡</span> DataPilot Workspace
            </div>
            <div className="text-xs text-[#A7B5AE]">
              Project: <span className="text-white font-medium">{metadata?.file_name || 'New Analytics Project'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#20C997] animate-ping"></span>
              EDA ENGINE ACTIVE
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
