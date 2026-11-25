import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadDatasetFile } from '../services/api';
import { useDataset } from '../context/DatasetContext';

export const UploadBox = ({ onUploadSuccess, autoRedirect = true }) => {
  const { setDataset, setIsUploading, isUploading, uploadError, setUploadError } = useDataset();
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [progressStage, setProgressStage] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleProcessFile = async (file) => {
    if (!file) return;

    // Validate extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setUploadError(`Unsupported file format '.${ext}'. Please upload an Excel (.xlsx) or CSV file.`);
      return;
    }

    setUploadError(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      setProgressStage('Reading your dataset...');
      const data = await uploadDatasetFile(file);
      setDataset(data);
      
      setProgressStage('Understanding columns and finding important metrics...');
      await new Promise(r => setTimeout(r, 400));
      
      setProgressStage('Creating your interactive visualisations...');
      await new Promise(r => setTimeout(r, 400));

      setSuccessMessage(`Successfully uploaded ${data.metadata.file_name}! Opening your dashboard...`);
      if (onUploadSuccess) onUploadSuccess(data);

      if (autoRedirect) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to upload dataset.';
      setUploadError(msg);
      setProgressStage('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-[#20C997] bg-[#14231E]/90 scale-[1.005]'
            : 'border-[#244536] bg-[#14231E]/60 hover:border-[#20C997]/80 hover:bg-[#14231E]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleProcessFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center justify-center text-[#20C997]">
            {isUploading ? (
              <Loader2 size={32} className="animate-spin text-[#20C997]" />
            ) : (
              <UploadCloud size={32} />
            )}
          </div>

          <div>
            <div className="text-base md:text-lg font-bold text-white">
              {isUploading ? (progressStage || 'Building your dashboard...') : 'Drop your spreadsheet here or click to browse'}
            </div>
            <p className="text-xs text-[#A7B5AE] mt-1">
              Supports Excel (.xlsx, .xls) and CSV files (up to 50MB)
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#20C997] to-[#17A57B] hover:from-[#6EE7B7] hover:to-[#20C997] text-[#080D0C] font-extrabold text-xs shadow-lg shadow-[#20C997]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing & Generating Dashboard...</span>
              </>
            ) : (
              <>
                <span>Browse Files</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message banner */}
      {uploadError && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Success message banner */}
      {successMessage && (
        <div className="mt-4 p-4 rounded-xl bg-[#20C997]/10 border border-[#20C997]/40 text-[#6EE7B7] text-xs flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0 text-[#20C997]" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
