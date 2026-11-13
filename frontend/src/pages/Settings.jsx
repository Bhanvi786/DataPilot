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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workspace preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-navy-200/80 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
            <User className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-navy-950">User Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Backend & Integration Settings */}
        <div className="bg-white rounded-xl border border-navy-200/80 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
            <Server className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-navy-950">FastAPI Backend Connector (Phase 2)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Backend API Endpoint</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full font-mono bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <p className="text-[11px] text-navy-400">
                DataPilot will target this URI for dataset uploads, training jobs, and inference predictions.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-navy-800 block">Automatic EDA on Ingestion</span>
                <span className="text-[11px] text-navy-400">Run statistical summary immediately after file upload</span>
              </div>
              <input
                type="checkbox"
                checked={autoEDA}
                onChange={(e) => setAutoEDA(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white rounded-xl border border-navy-200/80 p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-navy-100">
            <Sliders className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-navy-950">Modeling Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Default Cross-Validation Folds</label>
              <select className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-900">
                <option>5-Fold Stratified</option>
                <option>10-Fold Stratified</option>
                <option>3-Fold (Fast)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-navy-700">Default Metric Objective</label>
              <select className="w-full bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-900">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}

