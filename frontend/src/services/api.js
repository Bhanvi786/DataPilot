import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

// Phase 1 Endpoints
export const checkHealth = async () => (await apiClient.get('/health')).data;

export const uploadDatasetFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return (
    await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
  ).data;
};

export const getDatasetMetadata = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}`)).data;

export const getDatasetPreview = async (datasetId, limit = 20) =>
  (await apiClient.get(`/dataset/${datasetId}/preview?limit=${limit}`)).data;

export const getDatasetColumns = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}/columns`)).data;

// Phase 2 Automated Data Cleaning Endpoints
export const getDatasetProfile = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}/profile`)).data;

export const getDatasetQuality = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}/quality`)).data;

export const previewCleaning = async (datasetId, config) =>
  (await apiClient.post(`/dataset/${datasetId}/clean/preview`, config)).data;

export const applyCleaning = async (datasetId, config) =>
  (await apiClient.post(`/dataset/${datasetId}/clean/apply`, config)).data;

export const getCleaningSummary = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}/clean/summary`)).data;

export const resetCleaning = async (datasetId) =>
  (await apiClient.post(`/dataset/${datasetId}/clean/reset`)).data;

export const getExportUrl = (datasetId, format = 'csv', version = 'cleaned') =>
  `${API_BASE_URL}/dataset/${datasetId}/export?format=${format}&version=${version}`;

// Phase 3 Automated EDA & Intelligent Visualizations
export const getEDAOverview = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/overview?version=${version}`)).data;

export const getEDAStatistics = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/statistics?version=${version}`)).data;

export const getEDANumerical = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/numerical?version=${version}`)).data;

export const getEDACategorical = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/categorical?version=${version}`)).data;

export const getEDACorrelation = async (datasetId, method = 'pearson', version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/correlation?method=${method}&version=${version}`)).data;

export const getEDATimeSeries = async (datasetId, params = {}, version = 'cleaned') => {
  const query = new URLSearchParams({ version, ...params }).toString();
  return (await apiClient.get(`/dataset/${datasetId}/eda/timeseries?${query}`)).data;
};

export const getEDAInsights = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/eda/insights?version=${version}`)).data;

export const generateCustomChart = async (datasetId, config, version = 'cleaned') =>
  (await apiClient.post(`/dataset/${datasetId}/eda/custom-chart?version=${version}`, config)).data;

// Phase 4 Interactive Analytics Dashboard Endpoints
export const getDashboardOverview = async (datasetId, version = 'cleaned') =>
  (await apiClient.get(`/dataset/${datasetId}/dashboard/overview?version=${version}`)).data;

export const evaluateDashboardFilters = async (datasetId, payload, version = 'cleaned') =>
  (await apiClient.post(`/dataset/${datasetId}/dashboard/filters?version=${version}`, payload)).data;

export const calculateDashboardKPIs = async (datasetId, payload, version = 'cleaned') =>
  (await apiClient.post(`/dataset/${datasetId}/dashboard/kpis?version=${version}`, payload)).data;

export const getDashboardChartData = async (datasetId, payload, version = 'cleaned') =>
  (await apiClient.post(`/dataset/${datasetId}/dashboard/chart?version=${version}`, payload)).data;

export const processCrossFilter = async (datasetId, payload, version = 'cleaned') =>
  (await apiClient.post(`/dataset/${datasetId}/dashboard/cross-filter?version=${version}`, payload)).data;

export const getDashboardConfig = async (datasetId) =>
  (await apiClient.get(`/dataset/${datasetId}/dashboard/config`)).data;

export const saveDashboardConfig = async (datasetId, config) =>
  (await apiClient.post(`/dataset/${datasetId}/dashboard/config`, config)).data;

export const exportDashboard = async (datasetId, payload, version = 'cleaned') => {
  const format = payload.format || 'csv';
  const responseType = format === 'csv' || format === 'excel' ? 'blob' : 'text';
  return (
    await apiClient.post(`/dataset/${datasetId}/dashboard/export?version=${version}`, payload, {
      responseType,
    })
  ).data;
};

export default apiClient;
