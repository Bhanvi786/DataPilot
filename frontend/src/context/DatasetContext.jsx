import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const DatasetContext = createContext(null);

const STORAGE_KEY = 'datapilot_active_dataset';

export function DatasetProvider({ children }) {
  const [activeDataset, setActiveDataset] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [backendOnline, setBackendOnline] = useState(null);

  // Check backend connectivity on initialization
  useEffect(() => {
    let mounted = true;
    const testConnection = async () => {
      try {
        await apiService.checkHealth();
        if (mounted) setBackendOnline(true);
      } catch (err) {
        if (mounted) setBackendOnline(false);
      }
    };
    testConnection();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync active dataset to localStorage for persistent page reloads
  useEffect(() => {
    if (activeDataset) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activeDataset));
      } catch (e) {
        console.warn('Failed to persist active dataset:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeDataset]);

  const selectUploadedDataset = (datasetData) => {
    setActiveDataset(datasetData);
  };

  const clearActiveDataset = async () => {
    if (activeDataset?.dataset_id) {
      try {
        await apiService.deleteDataset(activeDataset.dataset_id);
      } catch (err) {
        console.warn('Dataset removal from server had an error:', err);
      }
    }
    setActiveDataset(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DatasetContext.Provider
      value={{
        activeDataset,
        selectUploadedDataset,
        clearActiveDataset,
        backendOnline,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}

