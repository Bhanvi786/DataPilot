import React from 'react';
import { Menu, Bell, Search, Sparkles, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="h-16 bg-[#0a0d12]/90 backdrop-blur-md border-b border-[#1a212d] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-[#121721] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-navy-400">
          <span className="font-semibold text-white">Workspace:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-[#121721] text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
            Production / Sandbox
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NavLink
          to="/training"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-500/50 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Quick Train
        </NavLink>

        <button 
          className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-[#121721] relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-[#0a0d12]"></span>
        </button>

        <div className="h-4 w-px bg-[#1a212d]"></div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-black font-extrabold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(16,185,129,0.25)]">
            DP
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-none">Research Analyst</p>
            <p className="text-[10px] text-navy-400 leading-none mt-1">analyst@datapilot.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}
