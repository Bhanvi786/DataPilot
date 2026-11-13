import React from 'react';
import { Menu, Bell, Search, Sparkles, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-navy-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-navy-500 hover:text-navy-800 hover:bg-navy-50 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-navy-500">
          <span className="font-semibold text-navy-800">Workspace:</span>
          <span className="px-2 py-0.5 rounded-md bg-navy-100 text-navy-700 font-mono text-[11px]">
            Production / Sandbox
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NavLink
          to="/training"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100/70 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          Quick Train
        </NavLink>

        <button
          className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        <div className="h-4 w-px bg-navy-200"></div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-xs border border-brand-200">
            DP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-navy-900 leading-none">Research Analyst</p>
            <p className="text-[10px] text-navy-400 leading-none mt-1">analyst@datapilot.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}

