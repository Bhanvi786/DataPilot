import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  UploadCloud,
  BarChart3,
  Cpu,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';

export default function Landing() {
  const featureCards = [
    {
      title: 'Smart Data Upload',
      description: 'Drag-and-drop CSV or XLSX files. Automatic schema inference, type parsing, and encoding resolution on ingestion.',
      icon: UploadCloud,
      tag: 'Ingestion'
    },
    {
      title: 'Automated Data Analysis',
      description: 'Instant statistical health scoring, numerical histograms, categorical distributions, correlation heatmaps, and outlier alerts.',
      icon: BarChart3,
      tag: 'EDA Engine'
    },
    {
      title: 'Intelligent Model Training',
      description: 'Auto-detect target dynamics (Regression vs Classification). Automatic feature encoding, scaling, and hyperparameter tuning.',
      icon: Cpu,
      tag: 'AutoML Core'
    },
    {
      title: 'Interactive Dashboards',
      description: 'Deep visibility into feature importance rankings, confusion matrices, ROC/AUC curves, and residual distributions.',
      icon: LayoutDashboard,
      tag: 'Visualization'
    },
    {
      title: 'Predictive Analytics',
      description: 'Generate on-demand predictions with dynamic schema-driven form inputs or batch file scoring with confidence metrics.',
      icon: TrendingUp,
      tag: 'Inference'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-navy-950 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-navy-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-violet flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-navy-950">DataPilot</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Phase 1 Preview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="hidden sm:inline-block text-xs font-semibold text-navy-600 hover:text-navy-950 transition-colors"
            >
              Platform Capabilities
            </a>
            <NavLink
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              Launch Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-navy-100">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Next-Gen Automated Machine Learning & Analytics
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-950 leading-[1.15]">
            Turn Any Dataset Into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-violet">
              Actionable Intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-navy-600 max-w-2xl mx-auto leading-relaxed">
            DataPilot automates the entire end-to-end data lifecycle. Upload any tabular dataset, explore instant exploratory analytics, select your custom target, train robust models, and run predictions seamlessly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-lg transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </NavLink>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white border border-navy-200 text-navy-700 hover:bg-navy-50/70 hover:text-navy-900 transition-all shadow-subtle"
            >
              Explore Features
            </a>
          </div>

          {/* Quick value badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-navy-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Universal Regression & Classification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              No Hardcoded Schemas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              FastAPI Ready Architecture
            </span>
          </div>
        </div>

        {/* Sample Dashboard Preview Mockup */}
        <div className="mt-14 max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-navy-200/90 bg-white p-3 shadow-elevated overflow-hidden">
            <div className="bg-navy-50/70 rounded-xl p-4 border border-navy-100 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="ml-3 text-xs font-mono text-navy-500">datapilot.internal/workspace/model-benchmark</span>
              </div>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
              <div className="p-4 rounded-xl border border-navy-200 bg-white shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Target Variable</div>
                <div className="text-base font-bold text-navy-900 font-mono mt-1">churn_status (Categorical)</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">✓ Auto-detected as Binary Classification</div>
              </div>
              <div className="p-4 rounded-xl border border-navy-200 bg-white shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Top Benchmark Model</div>
                <div className="text-base font-bold text-navy-900 font-mono mt-1">XGBoost Classifier v1.4</div>
                <div className="text-xs text-brand-600 font-medium mt-1">ROC-AUC: 0.934 | F1: 0.865</div>
              </div>
              <div className="p-4 rounded-xl border border-navy-200 bg-white shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Dataset Health Score</div>
                <div className="text-base font-bold text-navy-900 font-mono mt-1">98.4 / 100</div>
                <div className="text-xs text-navy-500 font-medium mt-1">7,043 rows • 0 duplicates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-wider text-brand-600 uppercase">Core Architecture</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-navy-950">
            Engineered for Flexible Analytics
          </p>
          <p className="mt-3 text-sm text-navy-500">
            A modular platform capable of training any regression or classification problem without rigid constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-navy-200/80 p-6 shadow-subtle hover:shadow-card hover:border-brand-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-navy-100 text-navy-600">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                    {idx + 1}. {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-navy-500 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-navy-100 flex items-center text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                  <span>Explore capability</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-navy-200/80 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-navy-950">DataPilot AutoML</span>
          </div>

          <div className="text-xs text-navy-400">
            © 2026 DataPilot Inc. Built for Automated Analytics & Machine Learning. Phase 1 Architecture.
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-navy-500">
            <NavLink to="/dashboard" className="hover:text-brand-600 transition-colors">App Dashboard</NavLink>
            <NavLink to="/upload" className="hover:text-brand-600 transition-colors">Upload</NavLink>
            <NavLink to="/settings" className="hover:text-brand-600 transition-colors">Settings</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

