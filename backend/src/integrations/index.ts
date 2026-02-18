// Central export file for all enterprise integrations

// CRM Integrations
export * from './salesforce';
export * from './hubspot';
export * from './zoho';

// HR/LMS Integrations
export * from './workday';
export * from './sap';

// Productivity Suites
export * from './microsoft365';
export * from './google';

// Payment Gateways
export * from './payments';

// Export all integration types
export type IntegrationType =
  | 'salesforce'
  | 'hubspot'
  | 'zoho'
  | 'workday'
  | 'sap'
  | 'bamboohr'
  | 'adp'
  | 'microsoft365'
  | 'google'
  | 'stripe'
  | 'razorpay'
  | 'paypal'
  | 'square'
  | 'slack'
  | 'teams'
  | 'zoom'
  | 'webex';

export interface IntegrationConfig {
  type: IntegrationType;
  enabled: boolean;
  configured: boolean;
  settings: Record<string, any>;
  lastSync?: Date;
  syncSchedule?: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  lastError?: string;
  recordsSynced?: number;
}
