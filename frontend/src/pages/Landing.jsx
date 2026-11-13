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
    <div className="min-h-screen bg-[#07090d] text-navy-800 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-[#1a212d] bg-[#0a0d12]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-black shadow-lg shadow-emerald-500/25">
              <Layers className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">DataPilot</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Phase 2 Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#features"
              className="hidden sm:inline-block text-xs font-semibold text-navy-400 hover:text-white transition-colors"
            >
              Platform Capabilities
            </a>
            <NavLink
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
            >
              Launch Platform
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-28 overflow-hidden border-b border-[#1a212d]">
        {/* Neon Gradient Green Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Next-Gen Automated Machine Learning & Analytics
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Turn Any Dataset Into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Actionable Intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-navy-400 max-w-2xl mx-auto leading-relaxed">
            DataPilot automates the entire end-to-end data lifecycle. Upload any tabular dataset, explore instant exploratory analytics, select your custom target, train robust models, and run predictions seamlessly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/45 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </NavLink>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#0e131a] border border-[#1f2836] text-navy-400 hover:text-white hover:border-emerald-500/30 transition-all shadow-subtle"
            >
              Explore Features
            </a>
          </div>

          {/* Quick value badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-navy-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Universal Regression & Classification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Hardcoded Schemas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              FastAPI Ready Architecture
            </span>
          </div>
        </div>

        {/* Sample Dashboard Preview Mockup */}
        <div className="mt-14 max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-[#1f2836] bg-[#0a0d12] p-3 shadow-elevated overflow-hidden">
            <div className="bg-[#0e131a] rounded-xl p-4 border border-[#1a212d] flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-3 text-xs font-mono text-navy-400">datapilot.internal/workspace/model-benchmark</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
              <div className="p-4 rounded-xl border border-[#1a212d] bg-[#07090d] shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Target Variable</div>
                <div className="text-base font-bold text-white font-mono mt-1">churn_status (Categorical)</div>
                <div className="text-xs text-emerald-400 font-medium mt-1">✓ Auto-detected as Binary Classification</div>
              </div>
              <div className="p-4 rounded-xl border border-[#1a212d] bg-[#07090d] shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Top Benchmark Model</div>
                <div className="text-base font-bold text-white font-mono mt-1">XGBoost Classifier v1.4</div>
                <div className="text-xs text-emerald-400 font-medium mt-1">ROC-AUC: 0.934 | F1: 0.865</div>
              </div>
              <div className="p-4 rounded-xl border border-[#1a212d] bg-[#07090d] shadow-subtle">
                <div className="text-xs font-semibold text-navy-400 uppercase">Dataset Health Score</div>
                <div className="text-base font-bold text-white font-mono mt-1">98.4 / 100</div>
                <div className="text-xs text-navy-400 font-medium mt-1">7,043 rows • 0 duplicates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-wider text-emerald-400 uppercase">Core Architecture</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            Engineered for Flexible Analytics
          </p>
          <p className="mt-3 text-sm text-navy-400">
            A modular platform capable of training any regression or classification problem without rigid constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-[#0e131a] rounded-2xl border border-[#1a212d] p-6 shadow-subtle hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/40 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#161c24] text-emerald-400 border border-emerald-500/20">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {idx + 1}. {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-navy-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a212d] flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Explore capability</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1a212d] bg-[#0a0d12] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">DataPilot AutoML</span>
          </div>

          <div className="text-xs text-navy-400">
            © 2026 DataPilot Inc. Built for Automated Analytics & Machine Learning. Phase 2 Architecture.
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-navy-400">
            <NavLink to="/dashboard" className="hover:text-emerald-400 transition-colors">App Dashboard</NavLink>
            <NavLink to="/upload" className="hover:text-emerald-400 transition-colors">Upload</NavLink>
            <NavLink to="/settings" className="hover:text-emerald-400 transition-colors">Settings</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
