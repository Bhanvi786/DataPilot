import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DatasetProvider } from './context/DatasetContext';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DataPreview from './pages/DataPreview';
import DataAnalysis from './pages/DataAnalysis';
import ModelTraining from './pages/ModelTraining';
import ModelComparison from './pages/ModelComparison';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DatasetProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Dashboard Shell with Nested Routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/preview" element={<DataPreview />} />
            <Route path="/analysis" element={<DataAnalysis />} />
            <Route path="/training" element={<ModelTraining />} />
            <Route path="/comparison" element={<ModelComparison />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DatasetProvider>
  );
}
