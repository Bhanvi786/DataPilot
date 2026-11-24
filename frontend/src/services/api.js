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

export default apiClient;
