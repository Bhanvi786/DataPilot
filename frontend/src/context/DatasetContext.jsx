import React, { createContext, useContext, useState, useEffect } from 'react';

const DatasetContext = createContext(null);

export const DatasetProvider = ({ children }) => {
  const [datasetId, setDatasetId] = useState(() => {
    return localStorage.getItem('datapilot_dataset_id') || null;
  });
  const [metadata, setMetadata] = useState(() => {
    const saved = localStorage.getItem('datapilot_metadata');
    return saved ? JSON.parse(saved) : null;
  });
  const [previewRows, setPreviewRows] = useState(() => {
    const saved = localStorage.getItem('datapilot_preview');
    return saved ? JSON.parse(saved) : null;
  });
  const [columnsData, setColumnsData] = useState(() => {
    const saved = localStorage.getItem('datapilot_columns');
    return saved ? JSON.parse(saved) : null;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const setDataset = (data) => {
    if (!data) {
      setDatasetId(null);
      setMetadata(null);
      setPreviewRows(null);
      setColumnsData(null);
      localStorage.removeItem('datapilot_dataset_id');
      localStorage.removeItem('datapilot_metadata');
      localStorage.removeItem('datapilot_preview');
      localStorage.removeItem('datapilot_columns');
      return;
    }

    setDatasetId(data.dataset_id);
    setMetadata(data.metadata);
    setPreviewRows(data.preview || null);
    setColumnsData(data.columns || null);

    localStorage.setItem('datapilot_dataset_id', data.dataset_id);
    localStorage.setItem('datapilot_metadata', JSON.stringify(data.metadata));
    if (data.preview) localStorage.setItem('datapilot_preview', JSON.stringify(data.preview));
    if (data.columns) localStorage.setItem('datapilot_columns', JSON.stringify(data.columns));
  };

  return (
    <DatasetContext.Provider
      value={{
        datasetId,
        metadata,
        previewRows,
        setPreviewRows,
        columnsData,
        setColumnsData,
        isUploading,
        setIsUploading,
        uploadError,
        setUploadError,
        setDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};
