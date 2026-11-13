import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function UploadZone({ onFileSelect, selectedFile, onRemoveFile }) {
  const [errorMsg, setErrorMsg] = useState(null);

  const processFile = (file) => {
    if (!file) return;
    setErrorMsg(null);

    const fileName = file.name || '';
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      setErrorMsg('File has no extension. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    const ext = fileName.substring(lastDotIndex).toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    if (!validExtensions.includes(ext)) {
      setErrorMsg(`Unsupported file type "${ext}". Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('File exceeds the 50MB size limit.');
      return;
    }

    onFileSelect(file);
  };

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setErrorMsg(null);
    if (fileRejections && fileRejections.length > 0) {
      const firstRejection = fileRejections[0];
      const err = firstRejection.errors[0];
      if (firstRejection.file) {
        const name = firstRejection.file.name.toLowerCase();
        if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
          processFile(firstRejection.file);
          return;
        }
      }

      if (err.code === 'file-too-large') {
        setErrorMsg('File exceeds the 50MB size limit.');
      } else {
        setErrorMsg('Invalid file format. Please upload a .csv, .xlsx, or .xls file.');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: !!selectedFile,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv', '.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.csv'],
      'application/csv': ['.csv'],
      'application/x-csv': ['.csv'],
      'text/comma-separated-values': ['.csv'],
      'text/x-comma-separated-values': ['.csv']
    }
  });

  const handleManualNativeInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-emerald-400 bg-emerald-950/20 scale-[0.99]'
              : 'border-[#1f2836] hover:border-emerald-500/50 bg-[#0a0d12] hover:bg-[#0e131a] shadow-subtle'
          }`}
        >
          <input {...getInputProps()} onChange={handleManualNativeInput} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center justify-center ring-8 ring-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-base font-semibold text-white">
                {isDragActive ? 'Drop your dataset here' : 'Drag & drop your CSV or Excel file here'}
              </p>
              <p className="text-sm text-navy-400 mt-1">
                or click anywhere inside this box to browse from your computer
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
            >
              Browse Files
            </button>

            <div className="pt-4 border-t border-[#1a212d] flex items-center justify-center gap-6 text-xs text-navy-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <FileSpreadsheet className="w-4 h-4" />
                CSV, XLSX, XLS
              </span>
              <span>•</span>
              <span>Up to 50MB</span>
              <span>•</span>
              <span>FastAPI Backend Ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0e131a] rounded-2xl border border-[#1a212d] p-6 shadow-subtle">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                {selectedFile.name?.endsWith('.csv') ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    Selected
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-navy-400 mt-1">
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span>Type: {selectedFile.name?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onRemoveFile}
              className="text-navy-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#161c24] transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1a212d] flex items-center justify-between text-xs text-navy-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              File ready for upload. Click "Upload to Backend" below.
            </span>
            <button
              type="button"
              onClick={onRemoveFile}
              className="text-navy-400 hover:text-white font-medium underline"
            >
              Choose a different file
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
