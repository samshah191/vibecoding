export interface FrameworkOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
  version?: string;
}

export interface ComponentLibraryOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  icon?: string;
  features: string[];
}

export interface StateManagementOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  complexity: 'simple' | 'medium' | 'advanced';
}

export interface CSSFrameworkOption {
  id: string;
  name: string;
  description: string;
  type: 'utility' | 'component' | 'css-in-js';
  features: string[];
}

export interface RoutingOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  features: string[];
}

export interface AdvancedAppConfig {
  // Core Framework
  framework: FrameworkOption;
  language: 'TypeScript' | 'JavaScript';
  
  // UI & Styling
  componentLibrary?: ComponentLibraryOption;
  cssFramework: CSSFrameworkOption;
  
  // State & Routing
  stateManagement: StateManagementOption;
  routing: RoutingOption;
  
  // Backend & Database
  database: string;
  hosting: string;
  
  // Additional Features
  features: {
    authentication: boolean;
    realtime: boolean;
    fileUpload: boolean;
    payments: boolean;
    notifications: boolean;
    analytics: boolean;
    i18n: boolean;
    pwa: boolean;
  };
}

export interface AppConfig {
  framework: string;
  language: string;
  styling: string;
  database: string;
  hosting: string;
}

export interface GeneratedApp {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: Date;
  status: 'generated' | 'building' | 'deployed' | 'error';
  frontend: any;
  backend: any;
  database: any;
  config: AppConfig;
  advancedConfig?: AdvancedAppConfig;
  features: string[];
  url?: string;
  published?: boolean;
}

export interface AppGenerationRequest {
  description: string;
  requirements?: string[];
  preferences?: {
    framework?: string;
    styling?: string;
    features?: string[];
  };
  advancedConfig?: AdvancedAppConfig;
}

export interface AdvancedGenerationRequest {
  description: string;
  config: AdvancedAppConfig;
  customRequirements?: string[];
  projectName?: string;
}

export interface AppGenerationResponse {
  success: boolean;
  app?: GeneratedApp;
  message?: string;
  error?: string;
}