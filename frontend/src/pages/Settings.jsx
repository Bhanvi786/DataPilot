import React, { useState } from 'react';
import {
  User,
  Sliders,
  Bell,
  Lock,
  Globe,
  Database,
  CheckCircle2,
  Save,
  Server
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const [name, setName] = useState('Research Analyst');
  const [email, setEmail] = useState('analyst@datapilot.ai');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1');
  const [autoEDA, setAutoEDA] = useState(true);
  const [alertSaved, setAlertSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Settings & Workspace Preferences"
        subtitle="Manage analyst profile, notification settings, compute thresholds, and FastAPI backend endpoints."
        badge="Configuration"
      />

      {alertSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Workspace preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1a212d]">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">User Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-300">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-navy-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Backend & Integration Settings */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1a212d]">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">FastAPI Backend Connector</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-300">Backend API Endpoint</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full font-mono bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <p className="text-[11px] text-navy-400">
                DataPilot targets this URI for dataset uploads, training jobs, and inference predictions.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Automatic EDA on Ingestion</span>
                <span className="text-[11px] text-navy-400">Run statistical summary immediately after file upload</span>
              </div>
              <input
                type="checkbox"
                checked={autoEDA}
                onChange={(e) => setAutoEDA(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1a212d]">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Modeling Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-300">Default Cross-Validation Folds</label>
              <select className="w-full bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white">
                <option>5-Fold Stratified</option>
                <option>10-Fold Stratified</option>
                <option>3-Fold (Fast)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-navy-300">Default Metric Objective</label>
              <select className="w-full bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white">
                <option>ROC-AUC / RMSE (Balanced)</option>
                <option>F1-Score / MAE</option>
                <option>Accuracy / R-Squared</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
