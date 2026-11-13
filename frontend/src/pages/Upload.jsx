import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Database,
  RefreshCw,
  Server,
  FileSpreadsheet
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import UploadZone from '../components/UploadZone';
import { apiService, ApiError } from '../services/api';
import { useDataset } from '../context/DatasetContext';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccessData, setUploadSuccessData] = useState(null);

  const { selectUploadedDataset, backendOnline } = useDataset();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setUploadError(null);
    setUploadSuccessData(null);
    setUploadProgress(0);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadError(null);
    setUploadSuccessData(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadFile = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const response = await apiService.uploadDataset(file, (percent) => {
        setUploadProgress(percent);
      });

      setUploadProgress(100);
      setUploadSuccessData(response);
      // Register into shared application context
      selectUploadedDataset(response);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.detail || err.message || 'Failed to upload dataset to backend.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Upload Dataset"
        subtitle="Ingest raw CSV or Excel spreadsheets directly into the FastAPI backend engine. Schema detection, data typing, and null checks run automatically."
        badge="Phase 2 Backend Connected"
      />

      {/* Backend Status Warning if offline */}
      {backendOnline === false && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Server className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">FastAPI Backend is Offline:</span> Ensure your Uvicorn server is running on port 8000 (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">cd backend && uvicorn main:app --reload --port 8000</code>).
          </div>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl border border-navy-200/80 p-6 sm:p-8 shadow-subtle space-y-6">
        <div>
          <h3 className="text-base font-semibold text-navy-950">File Ingestion</h3>
          <p className="text-xs text-navy-500 mt-1">
            Accepts comma-separated values (.csv) and Microsoft Excel workbooks (.xlsx, .xls) up to 50MB.
          </p>
        </div>

        <UploadZone
          selectedFile={file}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold text-brand-900">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                Uploading and parsing with Pandas...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-brand-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold block">Upload Error:</span>
              <p className="mt-0.5">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-500 hover:text-rose-800 font-semibold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Button */}
        {file && !uploadSuccessData && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
            <button
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:text-navy-900 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadFile}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Processing on Server...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Upload to Backend
                </>
              )}
            </button>
          </div>
        )}

        {/* Staging / Upload Complete State */}
        {uploadSuccessData && (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Dataset Successfully Ingested by Backend
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-700 mt-1">
                  <span>ID: <code className="font-mono font-bold">{uploadSuccessData.dataset_id}</code></span>
                  <span>•</span>
                  <span>{uploadSuccessData.row_count?.toLocaleString()} rows</span>
                  <span>•</span>
                  <span>{uploadSuccessData.column_count} columns</span>
                  <span>•</span>
                  <span>{uploadSuccessData.size}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/preview')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md transition-all shrink-0"
            >
              Proceed to Data Preview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Guidelines & Live Backend Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Server Validation & Isolation
          </div>
          <p className="text-xs text-navy-500 leading-relaxed">
            The FastAPI endpoint enforces strict extension checks, size thresholds (50MB), and isolates datasets under unique cryptographic IDs. Corrupted and empty files are rejected automatically.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-navy-200/80 p-5 shadow-subtle">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-800 mb-2">
            <Server className="w-4 h-4 text-brand-600" />
            Live Endpoint Target
          </div>
          <p className="text-xs text-navy-500 leading-relaxed">
            Connected to <code className="text-brand-700 bg-brand-50 px-1 py-0.5 rounded font-mono">POST /api/v1/upload</code>. Data is parsed directly into memory-mapped structures via Pandas & OpenPyXL.
          </p>
        </div>
      </div>
    </div>
  );
}
