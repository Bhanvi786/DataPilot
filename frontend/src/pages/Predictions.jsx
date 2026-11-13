import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  ArrowRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Layers,
  Database,
  HelpCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { MOCK_MODELS, MOCK_DATASETS } from '../data/mockData';

export default function Predictions() {
  const [selectedModelId, setSelectedModelId] = useState(MOCK_MODELS[0].id);
  const activeModel = MOCK_MODELS.find((m) => m.id === selectedModelId) || MOCK_MODELS[0];
  
  const associatedDataset = MOCK_DATASETS.find((d) => d.name === activeModel.dataset) || MOCK_DATASETS[0];

  const [formInputs, setFormInputs] = useState(() => {
    const initial = {};
    associatedDataset.columns.forEach((col) => {
      if (col.name !== activeModel.target) {
        initial[col.name] = col.sample || '';
      }
    });
    return initial;
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleInputChange = (field, val) => {
    setFormInputs((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleRunPrediction = (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictionResult(null);

    setTimeout(() => {
      setIsPredicting(false);
      if (activeModel.problemType === 'Classification') {
        setPredictionResult({
          outputClass: 'No Churn (Retained)',
          probability: 0.884,
          confidence: 'High (88.4%)',
          latency: '24ms',
          topInfluencingFactor: 'tenure_months & tech_support'
        });
      } else {
        setPredictionResult({
          predictedValue: '4.8 days',
          confidenceInterval: '[4.2 - 5.4 days]',
          latency: '18ms',
          topInfluencingFactor: 'patient_age & icu_admitted'
        });
      }
    }, 600);
  };

  const handleModelChange = (modelId) => {
    setSelectedModelId(modelId);
    const m = MOCK_MODELS.find((item) => item.id === modelId);
    const ds = MOCK_DATASETS.find((d) => d.name === m?.dataset) || MOCK_DATASETS[0];
    const initial = {};
    ds.columns.forEach((col) => {
      if (col.name !== m?.target) {
        initial[col.name] = col.sample || '';
      }
    });
    setFormInputs(initial);
    setPredictionResult(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Predictive Inference Engine"
        subtitle="Execute ad-hoc predictions against trained models. Dynamic input forms adapt automatically to the model's feature schema."
        badge="Inference API"
      />

      {/* Model Selector Card */}
      <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">
            Active Serving Model
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{activeModel.name}</h3>
          <p className="text-xs text-navy-400 font-mono">
            Problem Type: {activeModel.problemType} • Target: <span className="text-emerald-400 font-semibold">{activeModel.target}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-navy-400 font-medium">Switch Model:</span>
          <select
            value={selectedModelId}
            onChange={(e) => handleModelChange(e.target.value)}
            className="text-xs bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white font-medium focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            {MOCK_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.problemType})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Schema-Driven Form */}
        <div className="lg:col-span-2 bg-[#0e131a] rounded-xl border border-[#1a212d] p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Dynamic Feature Input Matrix</h3>
              <p className="text-xs text-navy-400">
                Inputs generated dynamically from <span className="font-mono text-emerald-400">{activeModel.dataset}</span> schema.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#161c24] text-emerald-400 border border-emerald-500/20">
              No Hardcoded Inputs
            </span>
          </div>

          <form onSubmit={handleRunPrediction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {associatedDataset.columns
                .filter((col) => col.name !== activeModel.target)
                .map((col) => (
                  <div key={col.name} className="space-y-1">
                    <label className="text-xs font-semibold text-navy-300 font-mono flex items-center justify-between">
                      <span>{col.name}</span>
                      <span className="text-[10px] text-navy-400 font-sans font-normal uppercase">
                        {col.type}
                      </span>
                    </label>
                    <input
                      type={col.type === 'number' ? 'number' : 'text'}
                      step={col.type === 'number' ? 'any' : undefined}
                      value={formInputs[col.name] !== undefined ? formInputs[col.name] : ''}
                      onChange={(e) => handleInputChange(col.name, e.target.value)}
                      placeholder={`Sample: ${col.sample || 'val'}`}
                      className="w-full text-xs font-mono bg-[#0a0d12] border border-[#1f2836] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-[#1a212d] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const reset = {};
                  associatedDataset.columns.forEach((c) => {
                    if (c.name !== activeModel.target) reset[c.name] = c.sample || '';
                  });
                  setFormInputs(reset);
                  setPredictionResult(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-navy-400 hover:text-white transition-colors"
              >
                Reset to Sample
              </button>

              <button
                type="submit"
                disabled={isPredicting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                {isPredicting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Inference...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Prediction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Area */}
        <div className="space-y-6">
          <div className="bg-[#0e131a] rounded-xl border border-[#1a212d] p-5 shadow-subtle flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-400">
                  Inference Output
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Target: {activeModel.target}
                </span>
              </div>

              {predictionResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#081f14] border border-emerald-500/40">
                    <span className="text-xs font-semibold text-emerald-400 block">
                      Estimated Outcome:
                    </span>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {predictionResult.outputClass || predictionResult.predictedValue}
                    </div>
                    <div className="text-xs text-emerald-300 font-semibold mt-1">
                      {predictionResult.confidence || `CI: ${predictionResult.confidenceInterval}`}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-navy-400">
                    <div className="flex justify-between py-1 border-b border-[#1a212d]">
                      <span>Model Latency:</span>
                      <span className="font-mono font-semibold text-white">{predictionResult.latency}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1a212d]">
                      <span>Top Attribution:</span>
                      <span className="font-mono text-emerald-400 text-right">{predictionResult.topInfluencingFactor}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-navy-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                  <p className="text-xs font-medium text-white">Ready for Inference</p>
                  <p className="text-[11px] text-navy-400 mt-1 max-w-[200px] mx-auto">
                    Fill the feature values on the left and click Generate Prediction.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#1a212d] text-[11px] text-navy-400">
              Future API hook: <code className="text-emerald-400 font-mono">POST /predict</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
