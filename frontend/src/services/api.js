// Centralized API Service for DataPilot Frontend
// Connects to FastAPI backend with configurable base URL and robust error handling

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    
    // Parse JSON safely
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorDetail = (data && typeof data === 'object' && data.detail) 
        ? data.detail 
        : (typeof data === 'string' && data ? data : response.statusText);
      throw new ApiError(errorDetail || `Request failed with status ${response.status}`, response.status, errorDetail);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or connection errors
    throw new ApiError(
      `Cannot connect to DataPilot backend (${API_BASE_URL}). Please verify that FastAPI is running on port 8000.`,
      0,
      err.message
    );
  }
}

export const apiService = {
  // Check backend service health
  checkHealth: async () => {
    return request('/');
  },

  // POST /upload - Ingest CSV or XLSX dataset with real-time feedback
  uploadDataset: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    // Using XMLHttpRequest when onProgress is requested, else standard fetch
    if (onProgress && typeof onProgress === 'function') {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/api/v1/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          let responseData = null;
          try {
            responseData = JSON.parse(xhr.responseText);
          } catch (e) {
            responseData = xhr.responseText;
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(responseData);
          } else {
            const detail = responseData?.detail || xhr.statusText || 'Upload failed';
            reject(new ApiError(detail, xhr.status, detail));
          }
        };

        xhr.onerror = () => {
          reject(new ApiError('Network connection failed during upload. Check backend server.', 0));
        };

        xhr.send(formData);
      });
    }

    return request('/api/v1/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // GET /dataset/{dataset_id} - Fetch complete metadata and 10 preview rows
  getDatasetInfo: async (datasetId) => {
    return request(`/api/v1/dataset/${encodeURIComponent(datasetId)}`);
  },

  // GET /dataset/{dataset_id}/preview - Fetch paginated records
  getDatasetPreview: async (datasetId, page = 1, pageSize = 10) => {
    return request(`/api/v1/dataset/${encodeURIComponent(datasetId)}/preview?page=${page}&page_size=${pageSize}`);
  },

  // DELETE /dataset/{dataset_id} - Delete dataset from storage
  deleteDataset: async (datasetId) => {
    return request(`/api/v1/dataset/${encodeURIComponent(datasetId)}`, {
      method: 'DELETE',
    });
  },

  // Future Phase endpoints (placeholder hooks)
  getDatasetAnalysis: async (datasetId) => {
    return null;
  },

  trainModel: async (config) => {
    return null;
  },

  getTrainedModels: async (datasetId) => {
    return null;
  },

  predict: async (modelId, featurePayload) => {
    return null;
  },

  getReportSummary: async (datasetId) => {
    return null;
  }
};
