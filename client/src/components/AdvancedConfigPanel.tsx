import React, { useState, useEffect } from 'react';

interface FrameworkOption {
  id: string;
  name: string;
  description: string;
  icon?: string;
  version?: string;
}

interface ComponentLibraryOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  icon?: string;
  features: string[];
}

interface StateManagementOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  complexity: 'simple' | 'medium' | 'advanced';
}

interface CSSFrameworkOption {
  id: string;
  name: string;
  description: string;
  type: 'utility' | 'component' | 'css-in-js';
  features: string[];
}

interface RoutingOption {
  id: string;
  name: string;
  description: string;
  framework: string[];
  features: string[];
}

interface AdvancedAppConfig {
  framework: FrameworkOption;
  language: 'TypeScript' | 'JavaScript';
  componentLibrary?: ComponentLibraryOption;
  cssFramework: CSSFrameworkOption;
  stateManagement: StateManagementOption;
  routing: RoutingOption;
  database: string;
  hosting: string;
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

interface Props {
  onConfigChange: (config: AdvancedAppConfig) => void;
  onValidation: (isValid: boolean, errors: string[]) => void;
}

const AdvancedConfigPanel: React.FC<Props> = ({ onConfigChange, onValidation }) => {
  const [frameworks, setFrameworks] = useState<FrameworkOption[]>([]);
  const [componentLibraries, setComponentLibraries] = useState<ComponentLibraryOption[]>([]);
  const [cssFrameworks, setCssFrameworks] = useState<CSSFrameworkOption[]>([]);
  const [stateManagementOptions, setStateManagementOptions] = useState<StateManagementOption[]>([]);
  const [routingOptions, setRoutingOptions] = useState<RoutingOption[]>([]);
  
  const [config, setConfig] = useState<AdvancedAppConfig>({
    framework: {} as FrameworkOption,
    language: 'TypeScript',
    cssFramework: {} as CSSFrameworkOption,
    stateManagement: {} as StateManagementOption,
    routing: {} as RoutingOption,
    database: 'postgresql',
    hosting: 'vercel',
    features: {
      authentication: false,
      realtime: false,
      fileUpload: false,
      payments: false,
      notifications: false,
      analytics: false,
      i18n: false,
      pwa: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load initial data
  useEffect(() => {
    loadConfigurationOptions();
  }, []);

  // Load framework-specific options when framework changes
  useEffect(() => {
    if (config.framework.id) {
      loadFrameworkSpecificOptions(config.framework.id);
    }
  }, [config.framework]);

  // Validate and emit config changes
  useEffect(() => {
    if (config.framework.id) {
      validateAndEmitConfig();
    }
  }, [config]);

  const loadConfigurationOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [frameworksRes, cssFrameworksRes] = await Promise.all([
        fetch('/api/ai/config/frameworks', { headers }),
        fetch('/api/ai/config/css-frameworks', { headers })
      ]);

      const frameworksData = await frameworksRes.json();
      const cssFrameworksData = await cssFrameworksRes.json();

      if (frameworksData.success) {
        setFrameworks(frameworksData.frameworks);
        // Set default framework
        if (frameworksData.frameworks.length > 0) {
          setConfig(prev => ({ ...prev, framework: frameworksData.frameworks[0] }));
        }
      }

      if (cssFrameworksData.success) {
        setCssFrameworks(cssFrameworksData.cssFrameworks);
        // Set default CSS framework
        const tailwind = cssFrameworksData.cssFrameworks.find((fw: CSSFrameworkOption) => fw.id === 'tailwind');
        if (tailwind) {
          setConfig(prev => ({ ...prev, cssFramework: tailwind }));
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load configuration options:', error);
      setLoading(false);
    }
  };

  const loadFrameworkSpecificOptions = async (framework: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [componentLibsRes, stateManagementRes, routingRes] = await Promise.all([
        fetch(`/api/ai/config/component-libraries?framework=${framework}`, { headers }),
        fetch(`/api/ai/config/state-management?framework=${framework}`, { headers }),
        fetch(`/api/ai/config/routing?framework=${framework}`, { headers })
      ]);

      const componentLibsData = await componentLibsRes.json();
      const stateManagementData = await stateManagementRes.json();
      const routingData = await routingRes.json();

      if (componentLibsData.success) {
        setComponentLibraries(componentLibsData.componentLibraries);
        // Set default component library
        if (componentLibsData.componentLibraries.length > 0) {
          setConfig(prev => ({ ...prev, componentLibrary: componentLibsData.componentLibraries[0] }));
        }
      }

      if (stateManagementData.success) {
        setStateManagementOptions(stateManagementData.stateManagement);
        // Set default state management
        if (stateManagementData.stateManagement.length > 0) {
          setConfig(prev => ({ ...prev, stateManagement: stateManagementData.stateManagement[0] }));
        }
      }

      if (routingData.success) {
        setRoutingOptions(routingData.routing);
        // Set default routing
        if (routingData.routing.length > 0) {
          setConfig(prev => ({ ...prev, routing: routingData.routing[0] }));
        }
      }
    } catch (error) {
      console.error('Failed to load framework-specific options:', error);
    }
  };

  const validateAndEmitConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/config/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (data.success && data.validation) {
        setValidationErrors(data.validation.errors || []);
        onValidation(data.validation.valid, data.validation.errors || []);
        
        if (data.validation.valid) {
          onConfigChange(config);
        }
      }
    } catch (error) {
      console.error('Failed to validate configuration:', error);
    }
  };

  const updateConfig = (key: keyof AdvancedAppConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateFeature = (feature: keyof AdvancedAppConfig['features'], enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: enabled }
    }));
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Configuration</h3>
        <p className="text-sm text-gray-600">
          Configure your application stack with specific frameworks, libraries, and features
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Configuration Issues</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Framework Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Framework *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                config.framework.id === framework.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateConfig('framework', framework)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{framework.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{framework.name}</div>
                    <div className="text-xs text-gray-500">{framework.version}</div>
                  </div>
                </div>
                {config.framework.id === framework.id && (
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{framework.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language *
        </label>
        <div className="flex space-x-4">
          {['TypeScript', 'JavaScript'].map((lang) => (
            <button
              key={lang}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                config.language === lang
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => updateConfig('language', lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Component Library */}
      {componentLibraries.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Library
          </label>
          <div className="space-y-2">
            {componentLibraries.map((library) => (
              <div
                key={library.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  config.componentLibrary?.id === library.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateConfig('componentLibrary', library)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{library.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{library.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{library.description}</div>
                    </div>
                  </div>
                  {config.componentLibrary?.id === library.id && (
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {library.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State Management */}
      {stateManagementOptions.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State Management *
          </label>
          <div className="space-y-2">
            {stateManagementOptions.map((option) => (
              <div
                key={option.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  config.stateManagement.id === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateConfig('stateManagement', option)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(option.complexity)}`}>
                      {option.complexity}
                    </span>
                    {config.stateManagement.id === option.id && (
                      <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database & Hosting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database *
          </label>
          <select
            title="Select database type"
            value={config.database}
            onChange={(e) => updateConfig('database', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="mongodb">MongoDB</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hosting *
          </label>
          <select
            title="Select hosting platform"
            value={config.hosting}
            onChange={(e) => updateConfig('hosting', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="vercel">Vercel</option>
            <option value="netlify">Netlify</option>
            <option value="aws">AWS</option>
            <option value="heroku">Heroku</option>
            <option value="railway">Railway</option>
          </select>
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Features
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(config.features).map(([feature, enabled]) => (
            <label key={feature} className="flex items-center">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => updateFeature(feature as keyof AdvancedAppConfig['features'], e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">
                {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigPanel;