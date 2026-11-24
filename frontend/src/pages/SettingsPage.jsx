import React from 'react';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
        <p className="text-sm text-[#A7B5AE] mt-1">
          Configure runtime environment, backend engine settings, and preview limits.
        </p>
      </div>

      <div className="bg-[#14231E] border border-[#244536] rounded-xl p-6 max-w-2xl divide-y divide-[#244536]/60 space-y-4">
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#6EE7B7] uppercase tracking-wider mb-3">Backend Data Engine</h2>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-white">FastAPI API Endpoint</div>
              <div className="text-xs text-[#A7B5AE]">Base URL for analytics microservice</div>
            </div>
            <span className="text-xs font-mono text-[#20C997] bg-[#0D1512] px-3 py-1 rounded border border-[#244536]">
              http://localhost:8000/api
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-white">Upload File Limit</div>
              <div className="text-xs text-[#A7B5AE]">Max allowed file size for CSV / XLSX</div>
            </div>
            <span className="text-xs font-semibold text-white">50 MB</span>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-sm font-bold text-[#6EE7B7] uppercase tracking-wider mb-3">Data Profiling & Schema</h2>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-white">Encoding Detection Fallback</div>
              <div className="text-xs text-[#A7B5AE]">Automatic multi-encoding fallback strategy</div>
            </div>
            <span className="text-xs font-semibold text-[#20C997]">UTF-8 / Latin-1 / CP1252</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-semibold text-white">Theme Accent</div>
              <div className="text-xs text-[#A7B5AE]">Selected UI design tokens</div>
            </div>
            <span className="text-xs font-semibold text-[#6EE7B7]">Emerald & Dark (#20C997)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
