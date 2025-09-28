import React, { useState } from 'react';
import AdvancedConfigPanel from './AdvancedConfigPanel';

interface AdvancedAppConfig {
  framework: any;
  language: 'TypeScript' | 'JavaScript';
  componentLibrary?: any;
  cssFramework: any;
  stateManagement: any;
  routing: any;
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
  onAppGenerated?: (app: any) => void;
}

const AdvancedAppBuilder: React.FC<Props> = ({ onAppGenerated }) => {
  const [step, setStep] = useState<'describe' | 'configure' | 'generating'>('describe');
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [config, setConfig] = useState<AdvancedAppConfig | null>(null);
  const [isConfigValid, setIsConfigValid] = useState(false);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length >= 10) {
      setStep('configure');
    }
  };

  const handleConfigChange = (newConfig: AdvancedAppConfig) => {
    setConfig(newConfig);
  };

  const handleConfigValidation = (isValid: boolean, errors: string[]) => {
    setIsConfigValid(isValid);
    setConfigErrors(errors);
  };

  const generateAdvancedApp = async () => {
    if (!config || !isConfigValid) return;

    setStep('generating');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai/generate-advanced', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          projectName: projectName.trim() || undefined,
          config
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Advanced app generated successfully:', data.app);
        onAppGenerated?.(data.app);
      } else {
        throw new Error(data.message || 'Failed to generate advanced app');
      }
    } catch (err) {
      console.error('Advanced app generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStep('configure'); // Go back to configuration
    } finally {
      setLoading(false);
    }
  };

  const resetBuilder = () => {
    setStep('describe');
    setDescription('');
    setProjectName('');
    setConfig(null);
    setIsConfigValid(false);
    setConfigErrors([]);
    setError(null);
  };

  if (step === 'generating') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Advanced Application
          </h3>
          <p className="text-gray-600">
            Creating your app with {config?.framework.name} and {config?.language}...
          </p>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setStep('configure')}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center ${step === 'describe' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'describe' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Describe</span>
          </div>
          
          <div className={`w-16 h-0.5 ${step === 'configure' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${step === 'configure' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'configure' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Configure</span>
          </div>
        </div>
      </div>

      {step === 'describe' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Describe Your Application
            </h2>
            <p className="text-gray-600">
              Tell us what kind of application you want to build. Be as detailed as possible for better results.
            </p>
          </div>

          <form onSubmit={handleDescriptionSubmit} className="space-y-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name (Optional)
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome App"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                App Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your application in detail. What does it do? Who are the users? What features should it have? The more details you provide, the better the result will be."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={10}
              />
              <div className="mt-1 text-xs text-gray-500">
                {description.length}/10 minimum characters
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                Step 1 of 2: Describe your application
              </div>
              <button
                type="submit"
                disabled={description.trim().length < 10}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  description.trim().length >= 10
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Configure
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'configure' && (
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Project Summary</h3>
            <p className="text-sm text-blue-800">
              <strong>Name:</strong> {projectName || 'Untitled Project'}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Description:</strong> {description}
            </p>
          </div>

          {/* Configuration Panel */}
          <AdvancedConfigPanel
            onConfigChange={handleConfigChange}
            onValidation={handleConfigValidation}
          />

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setStep('describe')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Description
            </button>

            <div className="flex space-x-3">
              <button
                onClick={resetBuilder}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={generateAdvancedApp}
                disabled={!isConfigValid || loading}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  isConfigValid && !loading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Generating...' : 'Generate Advanced App'}
              </button>
            </div>
          </div>

          {/* Configuration Status */}
          <div className="text-center">
            {isConfigValid ? (
              <div className="text-sm text-green-600 flex items-center justify-center">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Configuration is valid and ready to generate
              </div>
            ) : configErrors.length > 0 ? (
              <div className="text-sm text-red-600">
                Please fix configuration issues above
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Please complete the configuration
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAppBuilder;