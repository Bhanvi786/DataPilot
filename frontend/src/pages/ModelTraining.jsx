import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  Settings2,
  AlertCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { MOCK_DATASETS } from '../data/mockData';

export default function ModelTraining() {
  const navigate = useNavigate();
  const [selectedDatasetId, setSelectedDatasetId] = useState(MOCK_DATASETS[0].id);
  const activeDataset = MOCK_DATASETS.find((d) => d.id === selectedDatasetId) || MOCK_DATASETS[0];

  // Dynamic target variable selection (Never hardcoded)
  const [targetColumn, setTargetColumn] = useState(activeDataset.targetCandidate);
  const [problemType, setProblemType] = useState('Auto Detect');

  // Algorithms multi-selection
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([
    'xgboost',
    'random_forest',
    'lightgbm'
  ]);

  const [testSplit, setTestSplit] = useState(20);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Available candidate algorithms
  const classificationAlgorithms = [
    { id: 'xgboost', name: 'XGBoost Classifier', desc: 'Gradient boosted trees with regularization' },
    { id: 'random_forest', name: 'Random Forest', desc: 'Ensemble bagging trees with feature bootstrapping' },
    { id: 'lightgbm', name: 'LightGBM', desc: 'Fast leaf-wise tree splitting for tabular data' },
    { id: 'logistic_regression', name: 'Logistic Regression', desc: 'Linear baseline with L1/L2 penalties' }
  ];

  const regressionAlgorithms = [
    { id: 'xgboost_reg', name: 'XGBoost Regressor', desc: 'Optimized gradient boosted regression' },
    { id: 'catboost', name: 'CatBoost Regressor', desc: 'Categorical feature handling with symmetric trees' },
    { id: 'random_forest_reg', name: 'Random Forest Regressor', desc: 'Robust ensemble regression' },
    { id: 'ridge', name: 'Ridge / Lasso Regression', desc: 'Regularized linear baseline' }
  ];

  const toggleAlgorithm = (algoId) => {
    if (selectedAlgorithms.includes(algoId)) {
      if (selectedAlgorithms.length > 1) {
        setSelectedAlgorithms(selectedAlgorithms.filter((id) => id !== algoId));
      }
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algoId]);
    }
  };

  const handleDatasetChange = (newDsId) => {
    setSelectedDatasetId(newDsId);
    const ds = MOCK_DATASETS.find((d) => d.id === newDsId);
    if (ds) {
      setTargetColumn(ds.targetCandidate);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(15);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTraining(false);
            navigate('/comparison');
          }, 800);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Automated Model Training"
        subtitle="Configure dynamic target variables, auto-detect regression or classification paradigms, select benchmark algorithms, and trigger hyperparameter search."
        badge="AutoML Engine"
      />

      {/* Dataset Context Bar */}
      <div className="bg-white rounded-xl border border-navy-200/80 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
            DS
          </div>
          <div>
            <p className="text-xs font-semibold text-navy-900">Training Dataset Source:</p>
            <p className="text-xs text-navy-500">{activeDataset.rowCount.toLocaleString()} rows • {activeDataset.columnCount} features</p>
          </div>
        </div>

        <select
          value={selectedDatasetId}
          onChange={(e) => handleDatasetChange(e.target.value)}
          className="text-xs bg-white border border-navy-200 rounded-lg px-3 py-2 text-navy-800 font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          {MOCK_DATASETS.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name}
            </option>
          ))}
        </select>
      </div>

      {/* Training Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Target & Problem Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Variable Selector */}
          <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-800">
                1. Select Target Variable (Y)
              </label>
              <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Dynamic Schema
              </span>
            </div>
            <p className="text-xs text-navy-500 mb-3">
              Choose any column from the dataset as the optimization objective.
            </p>

            <select
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full text-xs font-mono bg-white border border-navy-200 rounded-lg px-3 py-2.5 text-navy-900 font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {activeDataset.columns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name} ({col.type === 'number' ? 'Numerical' : 'Categorical'})
                </option>
              ))}
            </select>
          </div>

          {/* Problem Type Selector */}
          <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle">
            <label className="text-xs font-bold uppercase tracking-wider text-navy-800 block mb-2">
              2. Problem Type Classification
            </label>
            <p className="text-xs text-navy-500 mb-4">
              Auto Detect evaluates unique target cardinality to choose between classification and continuous regression.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {['Auto Detect', 'Classification', 'Regression'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProblemType(type)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${problemType === type
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-navy-200 bg-white text-navy-600 hover:bg-slate-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Algorithms Selection */}
          <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-800">
                3. Candidate ML Algorithms
              </label>
              <span className="text-[11px] text-navy-400">Select algorithms to train & benchmark</span>
            </div>

            <div className="space-y-2.5">
              {(problemType === 'Regression' ? regressionAlgorithms : classificationAlgorithms).map((algo) => {
                const isSelected = selectedAlgorithms.includes(algo.id);
                return (
                  <div
                    key={algo.id}
                    onClick={() => toggleAlgorithm(algo.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${isSelected
                        ? 'border-brand-300 bg-purple-50/40'
                        : 'border-navy-200 bg-white hover:bg-slate-50'
                      }`}
                  >
                    <div>
                      <p className="font-semibold text-navy-900">{algo.name}</p>
                      <p className="text-[11px] text-navy-500">{algo.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-brand-600 border-brand-600 text-white' : 'border-navy-300'
                      }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Validation & Execution Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-800">
              Training Hyperparameters
            </h3>

            <div>
              <div className="flex justify-between text-xs text-navy-600 mb-1">
                <span>Test Split Ratio</span>
                <span className="font-semibold">{testSplit}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={testSplit}
                onChange={(e) => setTestSplit(Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-navy-400 mt-0.5">
                <span>10% (Small Holdout)</span>
                <span>40% (Strict Test)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-100 text-xs space-y-2">
              <div className="flex items-center justify-between text-navy-600">
                <span>Cross-Validation:</span>
                <span className="font-semibold text-navy-900">5-Fold Stratified</span>
              </div>
              <div className="flex items-center justify-between text-navy-600">
                <span>Feature Scaling:</span>
                <span className="font-semibold text-navy-900">RobustScaler</span>
              </div>
              <div className="flex items-center justify-between text-navy-600">
                <span>Missing Handling:</span>
                <span className="font-semibold text-navy-900">IterativeImputer</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-4 border-t border-navy-100">
              <button
                type="button"
                onClick={handleStartTraining}
                disabled={isTraining}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Simulating Training Runs ({trainingProgress}%)...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Train & Benchmark Models
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Training progress placeholder bar */}
          {isTraining && (
            <div className="bg-white rounded-xl border border-brand-200 p-4 shadow-subtle space-y-2">
              <div className="flex justify-between text-xs font-semibold text-brand-900">
                <span>Running Auto-tuning pipeline...</span>
                <span>{trainingProgress}%</span>
              </div>
              <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-navy-400">
                Fitting ensemble cross-validations on selected features...
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-navy-200 text-xs text-navy-500 space-y-1">
            <span className="font-semibold text-navy-800">Future FastAPI Integration:</span>
            <p>
              In Phase 2, clicking Train sends target specs to <code className="text-brand-700 font-mono">POST /train</code> to trigger distributed Scikit-Learn/XGBoost workers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

