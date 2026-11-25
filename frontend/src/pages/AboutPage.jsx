import React from 'react';
import { HelpCircle, Sparkles, Database, CheckCircle2, FileQuestion, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#14231E] via-[#0D1512] to-[#080D0C] border border-[#244536] rounded-3xl p-8 md:p-10 shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#6EE7B7] text-xs font-bold uppercase tracking-wider">
          <HelpCircle size={14} /> Help & Guidance
        </div>
        <h1 className="text-3xl font-black text-white">How to Get the Most from DataPilot</h1>
        <p className="text-sm text-[#A7B5AE] leading-relaxed max-w-2xl">
          DataPilot automatically turns spreadsheets into decision-ready analytics dashboards. Here are quick answers and tips to help you analyze your data effortlessly.
        </p>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileQuestion size={18} className="text-[#20C997]" /> Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#20C997]" /> What file formats are supported?
            </h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              DataPilot supports Microsoft Excel spreadsheets (<code>.xlsx</code>, <code>.xls</code>) and standard Comma-Separated Values (<code>.csv</code>) files up to 50MB.
            </p>
          </div>

          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#20C997]" /> Do I need to format my columns?
            </h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              No. DataPilot automatically detects dates, numbers, currencies, and categories without requiring you to manually rename or format your table headers.
            </p>
          </div>

          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#20C997]" /> How does Cross-Filtering work?
            </h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              Click any bar or slice on any chart. The entire dashboard and all KPI metrics will instantly recalculate to focus specifically on that selected category.
            </p>
          </div>

          <div className="bg-[#0D1512] border border-[#244536] rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#20C997]" /> Can I export reports?
            </h3>
            <p className="text-xs text-[#A7B5AE] leading-relaxed">
              Yes. Use the <strong>Download Report</strong> button on the dashboard to export filtered CSVs, Excel workbooks, or a formatted PDF executive report.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Tools Access */}
      <div className="bg-[#14231E] border border-[#244536] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Need Advanced Technical Analysis?</h3>
          <p className="text-xs text-[#A7B5AE] mt-1">
            Access deep data cleaning, statistical distributions, and custom chart builders in the Advanced Tools section.
          </p>
        </div>
        <Link
          to="/overview"
          className="px-5 py-2.5 rounded-xl bg-[#0D1512] border border-[#20C997]/60 text-[#20C997] hover:bg-[#20C997] hover:text-[#080D0C] text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <span>Explore Advanced Tools</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
