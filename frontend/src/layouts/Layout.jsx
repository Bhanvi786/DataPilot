import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  UploadCloud, 
  LayoutDashboard,
  HelpCircle,
  Table2, 
  Sparkles,
  BarChart3,
  Database,
  ChevronDown,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

const mainNavigation = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload Data', path: '/upload', icon: UploadCloud },
  { name: 'Help & Guide', path: '/about', icon: HelpCircle },
];

const advancedNavigation = [
  { name: 'Inspect Table & Columns', path: '/overview', icon: Table2, desc: 'Preview raw rows & column summaries' },
  { name: 'Clean & Fix Data', path: '/cleaning', icon: Sparkles, desc: 'Fill missing data & fix unusual rows' },
  { name: 'Explore All Graphs', path: '/eda', icon: BarChart3, desc: 'Deep statistical distributions & charts' },
];

export const Layout = ({ children }) => {
  const { metadata } = useDataset();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#080D0C] text-white">
      {/* Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-[#0D1512] border-r border-[#244536] flex flex-col z-30">
        {/* Brand */}
        <div className="p-6 border-b border-[#244536]">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#20C997] to-[#14231E] border border-[#20C997]/60 flex items-center justify-center shadow-lg shadow-[#20C997]/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-white leading-tight">DataPilot</div>
              <div className="text-[11px] font-semibold text-[#6EE7B7] tracking-wider uppercase">Auto Intelligence</div>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
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

          {/* Expandable Advanced Analysis */}
          <div className="pt-4 mt-4 border-t border-[#244536]/80">
            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#A7B5AE] hover:text-white hover:bg-[#14231E]/40 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders size={14} className="text-[#20C997]" /> Advanced Tools
              </span>
              {advancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {advancedOpen && (
              <div className="mt-2 space-y-1 pl-2 border-l border-[#244536]/60">
                {advancedNavigation.map((adv) => {
                  const Icon = adv.icon;
                  return (
                    <NavLink
                      key={adv.path}
                      to={adv.path}
                      className={({ isActive }) =>
                        `flex flex-col px-3 py-2 rounded-lg text-xs transition-all ${
                          isActive
                            ? 'bg-[#14231E] text-[#20C997] font-semibold'
                            : 'text-[#A7B5AE] hover:text-[#6EE7B7] hover:bg-[#14231E]/30'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Icon size={14} className="shrink-0 text-[#20C997]" />
                        <span>{adv.name}</span>
                      </div>
                      <span className="text-[10px] text-[#A7B5AE]/70 mt-0.5 pl-5">{adv.desc}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Active Dataset Status Widget */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-[#14231E] border border-[#244536]">
          <div className="text-[10px] font-bold text-[#A7B5AE] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Database size={12} className="text-[#20C997]" /> Active Dataset
          </div>
          {metadata ? (
            <div>
              <div className="text-xs font-bold text-[#6EE7B7] truncate max-w-[190px]" title={metadata.file_name}>
                {metadata.file_name}
              </div>
              <div className="text-[11px] text-[#A7B5AE] mt-0.5">
                {metadata.records?.toLocaleString()} rows • {metadata.features} columns
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#A7B5AE]/70 italic">No dataset uploaded</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-[#244536] text-[11px] text-[#A7B5AE] flex items-center justify-between">
          <span>DataPilot</span>
          <span className="flex items-center gap-1.5 text-[#20C997]">
            <span className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse"></span>
            Online
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#080D0C]/90 backdrop-blur-md border-b border-[#244536] px-8 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#A7B5AE]">Current Project:</div>
            <div className="text-sm font-bold text-white truncate max-w-md">
              {metadata?.file_name || 'Upload a dataset to begin'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/upload"
              className="px-4 py-2 rounded-xl bg-[#20C997] hover:bg-[#6EE7B7] text-[#080D0C] text-xs font-bold transition-all shadow-md shadow-[#20C997]/20 flex items-center gap-1.5"
            >
              <UploadCloud size={14} /> Upload New File
            </NavLink>
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

export default Layout;
