// Realistic mock datasets for DataPilot (Universal ML - Classification and Regression)

export const MOCK_DATASETS = [
  {
    id: 'ds-customer-churn',
    name: 'customer_churn_telecom.csv',
    size: '2.4 MB',
    rowCount: 7043,
    columnCount: 12,
    uploadedAt: '2 hours ago',
    type: 'CSV',
    status: 'Ready',
    targetCandidate: 'churn_status',
    defaultProblemType: 'Classification',
    description: 'Telecom customer profile and subscription churn indicators for retention modeling.',
    columns: [
      { name: 'customer_id', type: 'string', distinct: 7043, missing: 0, sample: 'CUST-10492' },
      { name: 'tenure_months', type: 'number', distinct: 72, missing: 0, sample: '24' },
      { name: 'contract_type', type: 'string', distinct: 3, missing: 0, sample: 'One year' },
      { name: 'monthly_charges', type: 'number', distinct: 1585, missing: 0, sample: '65.85' },
      { name: 'total_charges', type: 'number', distinct: 6530, missing: 11, sample: '1580.40' },
      { name: 'internet_service', type: 'string', distinct: 3, missing: 0, sample: 'Fiber optic' },
      { name: 'tech_support', type: 'string', distinct: 2, missing: 0, sample: 'Yes' },
      { name: 'payment_method', type: 'string', distinct: 4, missing: 0, sample: 'Electronic check' },
      { name: 'paperless_billing', type: 'string', distinct: 2, missing: 0, sample: 'Yes' },
      { name: 'support_tickets_count', type: 'number', distinct: 8, missing: 0, sample: '2' },
      { name: 'satisfaction_score', type: 'number', distinct: 5, missing: 4, sample: '4.2' },
      { name: 'churn_status', type: 'string', distinct: 2, missing: 0, sample: 'No' },
    ],
    sampleRows: [
      { customer_id: 'CUST-8910', tenure_months: 18, contract_type: 'Month-to-month', monthly_charges: 74.90, total_charges: 1348.20, internet_service: 'Fiber optic', tech_support: 'No', payment_method: 'Electronic check', paperless_billing: 'Yes', support_tickets_count: 4, satisfaction_score: 2.1, churn_status: 'Yes' },
      { customer_id: 'CUST-3490', tenure_months: 48, contract_type: 'Two year', monthly_charges: 45.30, total_charges: 2174.40, internet_service: 'DSL', tech_support: 'Yes', payment_method: 'Bank transfer', paperless_billing: 'No', support_tickets_count: 0, satisfaction_score: 4.8, churn_status: 'No' },
      { customer_id: 'CUST-9012', tenure_months: 12, contract_type: 'Month-to-month', monthly_charges: 89.15, total_charges: 1069.80, internet_service: 'Fiber optic', tech_support: 'No', payment_method: 'Credit card', paperless_billing: 'Yes', support_tickets_count: 3, satisfaction_score: 3.0, churn_status: 'Yes' },
      { customer_id: 'CUST-4112', tenure_months: 60, contract_type: 'Two year', monthly_charges: 105.40, total_charges: 6324.00, internet_service: 'Fiber optic', tech_support: 'Yes', payment_method: 'Credit card', paperless_billing: 'Yes', support_tickets_count: 1, satisfaction_score: 4.6, churn_status: 'No' },
      { customer_id: 'CUST-7721', tenure_months: 6, contract_type: 'Month-to-month', monthly_charges: 55.20, total_charges: 331.20, internet_service: 'DSL', tech_support: 'No', payment_method: 'Mailed check', paperless_billing: 'No', support_tickets_count: 2, satisfaction_score: 3.4, churn_status: 'No' },
      { customer_id: 'CUST-5519', tenure_months: 34, contract_type: 'One year', monthly_charges: 69.80, total_charges: 2373.20, internet_service: 'DSL', tech_support: 'Yes', payment_method: 'Bank transfer', paperless_billing: 'Yes', support_tickets_count: 0, satisfaction_score: 4.1, churn_status: 'No' },
      { customer_id: 'CUST-1988', tenure_months: 3, contract_type: 'Month-to-month', monthly_charges: 99.40, total_charges: 298.20, internet_service: 'Fiber optic', tech_support: 'No', payment_method: 'Electronic check', paperless_billing: 'Yes', support_tickets_count: 5, satisfaction_score: 1.8, churn_status: 'Yes' },
      { customer_id: 'CUST-6240', tenure_months: 52, contract_type: 'Two year', monthly_charges: 112.50, total_charges: 5850.00, internet_service: 'Fiber optic', tech_support: 'Yes', payment_method: 'Credit card', paperless_billing: 'No', support_tickets_count: 1, satisfaction_score: 4.9, churn_status: 'No' },
    ]
  },
  {
    id: 'ds-patient-stay',
    name: 'hospital_los_clinical.csv',
    size: '4.8 MB',
    rowCount: 14200,
    columnCount: 10,
    uploadedAt: '1 day ago',
    type: 'CSV',
    status: 'Ready',
    targetCandidate: 'length_of_stay_days',
    defaultProblemType: 'Regression',
    description: 'Patient admissions, vital signs, and inpatient length-of-stay tracking.',
    columns: [
      { name: 'admission_id', type: 'string', distinct: 14200, missing: 0, sample: 'ADM-9941' },
      { name: 'patient_age', type: 'number', distinct: 75, missing: 0, sample: '62' },
      { name: 'admission_type', type: 'string', distinct: 3, missing: 0, sample: 'Emergency' },
      { name: 'bmi_index', type: 'number', distinct: 240, missing: 18, sample: '27.4' },
      { name: 'systolic_bp', type: 'number', distinct: 95, missing: 5, sample: '135' },
      { name: 'glucose_level', type: 'number', distinct: 180, missing: 12, sample: '110' },
      { name: 'prior_admissions', type: 'number', distinct: 10, missing: 0, sample: '2' },
      { name: 'icu_admitted', type: 'string', distinct: 2, missing: 0, sample: 'No' },
      { name: 'insurance_provider', type: 'string', distinct: 5, missing: 0, sample: 'Medicare' },
      { name: 'length_of_stay_days', type: 'number', distinct: 45, missing: 0, sample: '5.2' },
    ],
    sampleRows: [
      { admission_id: 'ADM-1011', patient_age: 68, admission_type: 'Emergency', bmi_index: 29.1, systolic_bp: 142, glucose_level: 135, prior_admissions: 3, icu_admitted: 'Yes', insurance_provider: 'Medicare', length_of_stay_days: 9.4 },
      { admission_id: 'ADM-1012', patient_age: 44, admission_type: 'Elective', bmi_index: 24.3, systolic_bp: 118, glucose_level: 95, prior_admissions: 0, icu_admitted: 'No', insurance_provider: 'Commercial', length_of_stay_days: 2.1 },
      { admission_id: 'ADM-1013', patient_age: 57, admission_type: 'Urgent', bmi_index: 31.0, systolic_bp: 138, glucose_level: 112, prior_admissions: 1, icu_admitted: 'No', insurance_provider: 'Medicaid', length_of_stay_days: 4.8 },
      { admission_id: 'ADM-1014', patient_age: 79, admission_type: 'Emergency', bmi_index: 26.5, systolic_bp: 155, glucose_level: 160, prior_admissions: 4, icu_admitted: 'Yes', insurance_provider: 'Medicare', length_of_stay_days: 12.0 },
      { admission_id: 'ADM-1015', patient_age: 33, admission_type: 'Elective', bmi_index: 22.8, systolic_bp: 112, glucose_level: 88, prior_admissions: 0, icu_admitted: 'No', insurance_provider: 'Commercial', length_of_stay_days: 1.5 },
    ]
  },
  {
    id: 'ds-sensor-iot',
    name: 'turbine_energy_efficiency.xlsx',
    size: '1.9 MB',
    rowCount: 8500,
    columnCount: 9,
    uploadedAt: '3 days ago',
    type: 'XLSX',
    status: 'Ready',
    targetCandidate: 'energy_yield_kwh',
    defaultProblemType: 'Regression',
    description: 'Industrial turbine telemetry, ambient temperature, vibration metrics and yield output.',
    columns: [
      { name: 'turbine_id', type: 'string', distinct: 24, missing: 0, sample: 'TB-04' },
      { name: 'ambient_temp_c', type: 'number', distinct: 310, missing: 0, sample: '19.4' },
      { name: 'wind_speed_ms', type: 'number', distinct: 180, missing: 0, sample: '11.2' },
      { name: 'vibration_index', type: 'number', distinct: 94, missing: 3, sample: '0.042' },
      { name: 'rotor_rpm', type: 'number', distinct: 520, missing: 0, sample: '1420' },
      { name: 'operating_hours', type: 'number', distinct: 4200, missing: 0, sample: '8400' },
      { name: 'last_maintenance_days', type: 'number', distinct: 180, missing: 0, sample: '45' },
      { name: 'cooling_efficiency', type: 'number', distinct: 120, missing: 0, sample: '0.94' },
      { name: 'energy_yield_kwh', type: 'number', distinct: 4800, missing: 0, sample: '428.5' },
    ],
    sampleRows: [
      { turbine_id: 'TB-01', ambient_temp_c: 21.2, wind_speed_ms: 12.4, vibration_index: 0.038, rotor_rpm: 1450, operating_hours: 6200, last_maintenance_days: 30, cooling_efficiency: 0.96, energy_yield_kwh: 452.1 },
      { turbine_id: 'TB-02', ambient_temp_c: 18.5, wind_speed_ms: 9.8, vibration_index: 0.045, rotor_rpm: 1380, operating_hours: 8900, last_maintenance_days: 72, cooling_efficiency: 0.91, energy_yield_kwh: 388.4 },
      { turbine_id: 'TB-03', ambient_temp_c: 24.1, wind_speed_ms: 14.1, vibration_index: 0.052, rotor_rpm: 1510, operating_hours: 4300, last_maintenance_days: 15, cooling_efficiency: 0.98, energy_yield_kwh: 512.9 },
    ]
  }
];

// Sample EDA Analysis Data
export const MOCK_ANALYSIS_DATA = {
  summary: {
    totalRecords: 7043,
    numericalFeatures: 6,
    categoricalFeatures: 6,
    missingCells: 15,
    duplicateRows: 0,
    healthScore: 98.4
  },
  distributions: [
    { range: '0-12m', count: 2186, density: 0.31 },
    { range: '13-24m', count: 1024, density: 0.15 },
    { range: '25-36m', count: 832, density: 0.12 },
    { range: '37-48m', count: 762, density: 0.11 },
    { range: '49-60m', count: 832, density: 0.12 },
    { range: '61-72m', count: 1407, density: 0.19 }
  ],
  categoricalBreakdown: [
    { category: 'Month-to-month', count: 3875, percentage: 55 },
    { category: 'Two year', count: 1695, percentage: 24 },
    { category: 'One year', count: 1473, percentage: 21 }
  ],
  correlationMatrix: [
    { feature: 'tenure_months', monthly_charges: 0.25, total_charges: 0.83, tickets: -0.34, satisfaction: 0.42 },
    { feature: 'monthly_charges', tenure_months: 0.25, total_charges: 0.65, tickets: 0.28, satisfaction: -0.18 },
    { feature: 'total_charges', tenure_months: 0.83, monthly_charges: 0.65, tickets: -0.15, satisfaction: 0.29 },
    { feature: 'support_tickets', tenure_months: -0.34, monthly_charges: 0.28, tickets: 1.00, satisfaction: -0.68 },
    { feature: 'satisfaction', tenure_months: 0.42, monthly_charges: -0.18, tickets: -0.68, satisfaction: 1.00 }
  ],
  missingValues: [
    { column: 'total_charges', missingCount: 11, missingPercent: 0.16, action: 'Median Imputation' },
    { column: 'satisfaction_score', missingCount: 4, missingPercent: 0.06, action: 'KNN Imputation' },
    { column: 'customer_id', missingCount: 0, missingPercent: 0, action: 'None' },
    { column: 'tenure_months', missingCount: 0, missingPercent: 0, action: 'None' },
    { column: 'contract_type', missingCount: 0, missingPercent: 0, action: 'None' },
  ],
  outliers: [
    { column: 'total_charges', outlierCount: 48, method: 'IQR (1.5x)', actionRecommended: 'Winsorization (95th percentile)' },
    { column: 'support_tickets_count', outlierCount: 32, method: 'Z-score (> 3.0)', actionRecommended: 'Cap at upper threshold' },
    { column: 'monthly_charges', outlierCount: 0, method: 'IQR (1.5x)', actionRecommended: 'No outliers detected' },
  ]
};

// Trained Models & Benchmark Comparisons
export const MOCK_MODELS = [
  {
    id: 'mod-xgb-01',
    name: 'XGBoost Classifier v1.4',
    algorithm: 'Extreme Gradient Boosting',
    problemType: 'Classification',
    target: 'churn_status',
    dataset: 'customer_churn_telecom.csv',
    trainedAt: 'Today at 08:30 AM',
    trainingDuration: '14.2s',
    isBest: true,
    metrics: {
      accuracy: 0.892,
      f1Score: 0.865,
      rocAuc: 0.934,
      precision: 0.871,
      recall: 0.859
    },
    hyperparameters: {
      n_estimators: 250,
      max_depth: 6,
      learning_rate: 0.05,
      subsample: 0.8
    },
    featuresImportance: [
      { feature: 'support_tickets_count', importance: 0.34 },
      { feature: 'contract_type', importance: 0.26 },
      { feature: 'tenure_months', importance: 0.18 },
      { feature: 'monthly_charges', importance: 0.12 },
      { feature: 'satisfaction_score', importance: 0.10 }
    ]
  },
  {
    id: 'mod-rf-02',
    name: 'Random Forest Ensemble',
    algorithm: 'Random Forest Classifier',
    problemType: 'Classification',
    target: 'churn_status',
    dataset: 'customer_churn_telecom.csv',
    trainedAt: 'Today at 08:15 AM',
    trainingDuration: '22.8s',
    isBest: false,
    metrics: {
      accuracy: 0.868,
      f1Score: 0.838,
      rocAuc: 0.912,
      precision: 0.842,
      recall: 0.835
    },
    hyperparameters: {
      n_estimators: 300,
      max_depth: 10,
      min_samples_split: 4
    },
    featuresImportance: [
      { feature: 'contract_type', importance: 0.31 },
      { feature: 'support_tickets_count', importance: 0.29 },
      { feature: 'tenure_months', importance: 0.19 },
      { feature: 'total_charges', importance: 0.12 },
      { feature: 'monthly_charges', importance: 0.09 }
    ]
  },
  {
    id: 'mod-lgbm-03',
    name: 'LightGBM Classifier',
    algorithm: 'Light Gradient Boosted Machine',
    problemType: 'Classification',
    target: 'churn_status',
    dataset: 'customer_churn_telecom.csv',
    trainedAt: 'Yesterday',
    trainingDuration: '8.4s',
    isBest: false,
    metrics: {
      accuracy: 0.884,
      f1Score: 0.851,
      rocAuc: 0.925,
      precision: 0.860,
      recall: 0.843
    },
    hyperparameters: {
      num_leaves: 31,
      learning_rate: 0.08,
      n_estimators: 200
    },
    featuresImportance: [
      { feature: 'support_tickets_count', importance: 0.33 },
      { feature: 'contract_type', importance: 0.27 },
      { feature: 'tenure_months', importance: 0.17 },
      { feature: 'monthly_charges', importance: 0.14 },
      { feature: 'tech_support', importance: 0.09 }
    ]
  },
  {
    id: 'mod-ridge-04',
    name: 'CatBoost Regressor',
    algorithm: 'CatBoost Regressor',
    problemType: 'Regression',
    target: 'length_of_stay_days',
    dataset: 'hospital_los_clinical.csv',
    trainedAt: '2 days ago',
    trainingDuration: '18.1s',
    isBest: true,
    metrics: {
      rmse: 1.24,
      mae: 0.88,
      r2: 0.894,
      mape: '8.6%'
    },
    hyperparameters: {
      iterations: 500,
      depth: 6,
      l2_leaf_reg: 3
    },
    featuresImportance: [
      { feature: 'admission_type', importance: 0.38 },
      { feature: 'icu_admitted', importance: 0.29 },
      { feature: 'prior_admissions', importance: 0.16 },
      { feature: 'patient_age', importance: 0.11 },
      { feature: 'systolic_bp', importance: 0.06 }
    ]
  }
];

export const MOCK_ACTIVITY_LOGS = [
  { id: 1, action: 'Model Trained', details: 'XGBoost Classifier achieved 0.892 accuracy on customer_churn_telecom.csv', timestamp: '24 mins ago', status: 'success' },
  { id: 2, action: 'Dataset Uploaded', details: 'turbine_energy_efficiency.xlsx uploaded successfully (8,500 rows)', timestamp: '3 hours ago', status: 'info' },
  { id: 3, action: 'EDA Report Generated', details: 'Automated statistical distribution & correlation report for hospital_los_clinical.csv', timestamp: 'Yesterday', status: 'info' },
  { id: 4, action: 'Model Evaluated', details: 'Benchmarked 3 candidate algorithms on Customer Churn task', timestamp: '2 days ago', status: 'success' },
];

