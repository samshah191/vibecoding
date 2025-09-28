import React, { useState } from 'react';
import { Settings, Shield, Palette, Database, RefreshCw, Save, RotateCcw, Pause } from 'lucide-react';

interface BuildParameters {
  authentication: {
    enabled: boolean;
    system: 'firebase' | 'auth0' | 'custom' | 'none';
    roles: boolean;
  };
  styling: {
    system: 'tailwind' | 'bootstrap' | 'material' | 'custom';
    darkMode: boolean;
    theme: string;
  };
  database: {
    type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
    migrations: boolean;
    seeding: boolean;
    backup: boolean;
  };
  deployment: {
    autoDeploy: boolean;
    rollback: boolean;
    preview: boolean;
  };
}

interface BuildParameterPanelProps {
  onParametersChange: (params: BuildParameters) => void;
  onRollback: () => void;
  onRegenerate: (step: string) => void;
  onPause: () => void;
}

const BuildParameterPanel: React.FC<BuildParameterPanelProps> = ({
  onParametersChange,
  onRollback,
  onRegenerate,
  onPause
}) => {
  const [parameters, setParameters] = useState<BuildParameters>({
    authentication: {
      enabled: true,
      system: 'firebase',
      roles: true
    },
    styling: {
      system: 'tailwind',
      darkMode: false,
      theme: 'default'
    },
    database: {
      type: 'postgresql',
      migrations: true,
      seeding: true,
      backup: true
    },
    deployment: {
      autoDeploy: true,
      rollback: true,
      preview: true
    }
  });

  const updateParameters = (updates: Partial<BuildParameters>) => {
    const newParams = { ...parameters, ...updates };
    setParameters(newParams);
    onParametersChange(newParams);
  };

  const toggleAuth = () => {
    updateParameters({
      authentication: {
        ...parameters.authentication,
        enabled: !parameters.authentication.enabled
      }
    });
  };

  const toggleDarkMode = () => {
    updateParameters({
      styling: {
        ...parameters.styling,
        darkMode: !parameters.styling.darkMode
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Build Parameters
        </h3>
        
        <div className="space-y-6">
          {/* Authentication */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Authentication</label>
              <button 
                onClick={toggleAuth}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  parameters.authentication.enabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
                title="Toggle authentication system"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  parameters.authentication.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            {parameters.authentication.enabled && (
              <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                <div>
                  <label htmlFor="auth-system" className="block text-sm font-medium text-gray-700 mb-1">
                    Auth System
                  </label>
                  <select
                    id="auth-system"
                    value={parameters.authentication.system}
                    onChange={(e) => updateParameters({
                      authentication: {
                        ...parameters.authentication,
                        system: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    title="Select authentication system"
                  >
                    <option value="firebase">Firebase Auth</option>
                    <option value="auth0">Auth0</option>
                    <option value="custom">Custom Auth</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auth-roles"
                    checked={parameters.authentication.roles}
                    onChange={(e) => updateParameters({
                      authentication: {
                        ...parameters.authentication,
                        roles: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    title="Enable role-based access control"
                  />
                  <label htmlFor="auth-roles" className="ml-2 block text-sm text-gray-700">
                    Role-based Access Control
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {/* Styling System */}
          <div>
            <label htmlFor="styling-system" className="block text-sm font-medium text-gray-700 mb-2">
              Styling System
            </label>
            <select
              id="styling-system"
              value={parameters.styling.system}
              onChange={(e) => updateParameters({
                styling: {
                  ...parameters.styling,
                  system: e.target.value as any
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              title="Select styling system"
            >
              <option value="tailwind">Tailwind CSS</option>
              <option value="bootstrap">Bootstrap</option>
              <option value="material">Material UI</option>
              <option value="custom">Custom CSS</option>
            </select>
            
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                id="dark-mode"
                checked={parameters.styling.darkMode}
                onChange={toggleDarkMode}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                title="Enable dark mode"
              />
              <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-700">
                Dark Mode Support
              </label>
            </div>
          </div>
          
          {/* Database Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database Options</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="database-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Database Type
                </label>
                <select
                  id="database-type"
                  value={parameters.database.type}
                  onChange={(e) => updateParameters({
                    database: {
                      ...parameters.database,
                      type: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  title="Select database type"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="db-migrations"
                    checked={parameters.database.migrations}
                    onChange={(e) => updateParameters({
                      database: {
                        ...parameters.database,
                        migrations: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    title="Enable database migrations"
                  />
                  <label htmlFor="db-migrations" className="ml-2 block text-sm text-gray-700">
                    Migrations
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="db-seeding"
                    checked={parameters.database.seeding}
                    onChange={(e) => updateParameters({
                      database: {
                        ...parameters.database,
                        seeding: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    title="Enable database seeding"
                  />
                  <label htmlFor="db-seeding" className="ml-2 block text-sm text-gray-700">
                    Seeding
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="db-backup"
                    checked={parameters.database.backup}
                    onChange={(e) => updateParameters({
                      database: {
                        ...parameters.database,
                        backup: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    title="Enable backup strategy"
                  />
                  <label htmlFor="db-backup" className="ml-2 block text-sm text-gray-700">
                    Backup Strategy
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deployment Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deployment</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-deploy"
                  checked={parameters.deployment.autoDeploy}
                  onChange={(e) => updateParameters({
                    deployment: {
                      ...parameters.deployment,
                      autoDeploy: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  title="Enable auto-deployment"
                />
                <label htmlFor="auto-deploy" className="ml-2 block text-sm text-gray-700">
                  Auto-deploy on build completion
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preview-deploy"
                  checked={parameters.deployment.preview}
                  onChange={(e) => updateParameters({
                    deployment: {
                      ...parameters.deployment,
                      preview: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  title="Enable preview deployments"
                />
                <label htmlFor="preview-deploy" className="ml-2 block text-sm text-gray-700">
                  Preview deployments
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Build Controls */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Build Controls
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onPause}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Pause current build process"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </button>
          
          <button
            onClick={() => onRegenerate('current')}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            title="Regenerate current step"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </button>
          
          <button
            onClick={onRollback}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 col-span-2"
            title="Rollback to previous version"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Rollback to Previous Commit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildParameterPanel;