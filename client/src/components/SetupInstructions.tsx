import React, { useState, useCallback } from 'react';
import {
  Terminal,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Folder,
  FileText,
  Code,
  Play,
  Settings,
  Package,
  Database,
  Key,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  commands?: string[];
  files?: { name: string; content: string; path: string; }[];
  notes?: string[];
  optional?: boolean;
  dependencies?: string[];
  estimatedTime?: string;
}

interface ProjectSetupConfig {
  framework: string;
  language: string;
  styling: string;
  backend?: string;
  database?: string;
  deployment?: string;
  features?: string[];
}

interface SetupInstructionsProps {
  config: ProjectSetupConfig;
  projectName: string;
  onCopyCommand: (command: string) => void;
  onDownloadFile: (fileName: string, content: string) => void;
}

export const SetupInstructions: React.FC<SetupInstructionsProps> = ({
  config,
  projectName,
  onCopyCommand,
  onDownloadFile
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['prerequisites']));
  const [currentOS, setCurrentOS] = useState<'windows' | 'mac' | 'linux'>('windows');

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const generateSetupSteps = useCallback((): SetupStep[] => {
    const steps: SetupStep[] = [
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        description: 'Install required software and tools',
        commands: [
          '# Check Node.js version (required: 18+)',
          'node --version',
          '',
          '# Check npm version',
          'npm --version',
          '',
          '# If Node.js is not installed, download from:',
          '# https://nodejs.org/',
        ],
        notes: [
          'Node.js 18.0.0 or higher is required',
          'npm comes bundled with Node.js',
          'Consider using nvm for Node.js version management'
        ],
        estimatedTime: '5 minutes'
      },
      {
        id: 'create-project',
        title: 'Create Project',
        description: `Initialize your ${config.framework} project`,
        commands: getCreateProjectCommands(config, projectName),
        estimatedTime: '2 minutes'
      },
      {
        id: 'install-dependencies',
        title: 'Install Dependencies',
        description: 'Install all required packages and dependencies',
        commands: [
          `cd ${projectName}`,
          'npm install',
          '',
          '# Install additional dependencies',
          ...getAdditionalDependencies(config)
        ],
        estimatedTime: '3-5 minutes'
      }
    ];

    // Add environment setup if backend is configured
    if (config.backend) {
      steps.push({
        id: 'environment-setup',
        title: 'Environment Setup',
        description: 'Configure environment variables and database',
        files: [
          {
            name: '.env',
            path: './',
            content: generateEnvFile(config)
          },
          {
            name: '.env.example',
            path: './',
            content: generateEnvExample(config)
          }
        ],
        commands: [
          '# Copy environment template',
          'cp .env.example .env',
          '',
          '# Edit .env file with your configuration',
          currentOS === 'windows' ? 'notepad .env' : 'nano .env'
        ],
        notes: [
          'Never commit .env files to version control',
          'Update the values in .env with your actual configuration',
          'Refer to the .env.example for required variables'
        ],
        estimatedTime: '5 minutes'
      });
    }

    // Add database setup if database is configured
    if (config.database) {
      steps.push({
        id: 'database-setup',
        title: 'Database Setup',
        description: 'Initialize and configure your database',
        commands: getDatabaseCommands(config.database),
        notes: [
          'Ensure your database server is running',
          'Update connection strings in .env file',
          'Run migrations to set up database schema'
        ],
        estimatedTime: '10 minutes'
      });
    }

    // Add development server setup
    steps.push({
      id: 'development-server',
      title: 'Start Development Server',
      description: 'Run your application in development mode',
      commands: [
        '# Start the development server',
        getDevelopmentCommand(config),
        '',
        '# Your application will be available at:',
        `# http://localhost:${getDevelopmentPort(config.framework)}`
      ],
      notes: [
        'The development server supports hot reloading',
        'Changes to your code will automatically refresh the browser',
        'Press Ctrl+C to stop the development server'
      ],
      estimatedTime: '1 minute'
    });

    // Add production build step
    steps.push({
      id: 'production-build',
      title: 'Production Build',
      description: 'Build your application for production deployment',
      commands: [
        '# Create production build',
        'npm run build',
        '',
        '# Test production build locally (optional)',
        getPreviewCommand(config)
      ],
      optional: true,
      estimatedTime: '3-5 minutes'
    });

    // Add deployment steps if configured
    if (config.deployment) {
      steps.push({
        id: 'deployment',
        title: 'Deployment',
        description: `Deploy your application to ${config.deployment}`,
        commands: getDeploymentCommands(config.deployment),
        optional: true,
        estimatedTime: '10-15 minutes'
      });
    }

    return steps;
  }, [config, projectName, currentOS]);

  const getCreateProjectCommands = (config: ProjectSetupConfig, name: string): string[] => {
    switch (config.framework) {
      case 'react':
        if (config.language === 'typescript') {
          return [
            `npx create-react-app ${name} --template typescript`,
            `cd ${name}`
          ];
        }
        return [`npx create-react-app ${name}`, `cd ${name}`];
      
      case 'next':
        return [
          `npx create-next-app@latest ${name} --typescript --tailwind --eslint --app`,
          `cd ${name}`
        ];
      
      case 'vue':
        return [
          `npm create vue@latest ${name}`,
          `cd ${name}`
        ];
      
      case 'angular':
        return [
          `npx @angular/cli@latest new ${name}`,
          `cd ${name}`
        ];
      
      case 'svelte':
        return [
          `npm create svelte@latest ${name}`,
          `cd ${name}`
        ];
      
      default:
        return [
          `mkdir ${name}`,
          `cd ${name}`,
          'npm init -y'
        ];
    }
  };

  const getAdditionalDependencies = (config: ProjectSetupConfig): string[] => {
    const deps: string[] = [];
    
    if (config.styling === 'tailwind' && config.framework !== 'next') {
      deps.push('npm install -D tailwindcss postcss autoprefixer');
      deps.push('npx tailwindcss init -p');
    }
    
    if (config.styling === 'styled-components') {
      deps.push('npm install styled-components');
      deps.push('npm install -D @types/styled-components');
    }
    
    if (config.backend === 'express') {
      deps.push('npm install express cors helmet');
      deps.push('npm install -D @types/express @types/cors');
    }
    
    return deps;
  };

  const generateEnvFile = (config: ProjectSetupConfig): string => {
    let env = `# Application Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
`;
    
    if (config.database === 'prisma') {
      env += `DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
`;
    } else if (config.database === 'mongoose') {
      env += `MONGODB_URI="mongodb://localhost:27017/database_name"
`;
    }
    
    env += `
# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"

# API Keys
OPENAI_API_KEY="your-openai-api-key"
`;
    
    return env;
  };

  const generateEnvExample = (config: ProjectSetupConfig): string => {
    return generateEnvFile(config).replace(/="[^"]*"/g, '=""');
  };

  const getDatabaseCommands = (database: string): string[] => {
    switch (database) {
      case 'prisma':
        return [
          '# Initialize Prisma',
          'npx prisma init',
          '',
          '# Generate Prisma client',
          'npx prisma generate',
          '',
          '# Run database migrations',
          'npx prisma db push'
        ];
      
      case 'mongoose':
        return [
          '# Start MongoDB (if installed locally)',
          currentOS === 'windows' ? 'net start MongoDB' : 'sudo systemctl start mongod',
          '',
          '# Or use MongoDB Atlas cloud database'
        ];
      
      default:
        return ['# Configure your database connection'];
    }
  };

  const getDevelopmentCommand = (config: ProjectSetupConfig): string => {
    switch (config.framework) {
      case 'react':
        return 'npm start';
      case 'next':
      case 'vue':
      case 'svelte':
        return 'npm run dev';
      case 'angular':
        return 'ng serve';
      default:
        return 'npm run dev';
    }
  };

  const getDevelopmentPort = (framework: string): number => {
    switch (framework) {
      case 'react':
        return 3000;
      case 'next':
        return 3000;
      case 'vue':
        return 5173;
      case 'angular':
        return 4200;
      case 'svelte':
        return 5173;
      default:
        return 3000;
    }
  };

  const getPreviewCommand = (config: ProjectSetupConfig): string => {
    switch (config.framework) {
      case 'next':
        return 'npm start';
      case 'vue':
      case 'svelte':
        return 'npm run preview';
      default:
        return 'npx serve -s build';
    }
  };

  const getDeploymentCommands = (deployment: string): string[] => {
    switch (deployment) {
      case 'vercel':
        return [
          '# Install Vercel CLI',
          'npm i -g vercel',
          '',
          '# Deploy to Vercel',
          'vercel',
          '',
          '# Follow the prompts to configure deployment'
        ];
      
      case 'netlify':
        return [
          '# Install Netlify CLI',
          'npm i -g netlify-cli',
          '',
          '# Deploy to Netlify',
          'netlify deploy',
          '',
          '# Deploy to production',
          'netlify deploy --prod'
        ];
      
      case 'docker':
        return [
          '# Build Docker image',
          'docker build -t my-app .',
          '',
          '# Run Docker container',
          'docker run -p 3000:3000 my-app'
        ];
      
      default:
        return ['# Configure your deployment platform'];
    }
  };

  const steps = generateSetupSteps();
  const completionPercentage = Math.round((completedSteps.size / steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Setup Instructions
          </h1>
          
          <div className="flex items-center gap-3">
            <select
              value={currentOS}
              onChange={(e) => setCurrentOS(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              aria-label="Select operating system"
            >
              <option value="windows">Windows</option>
              <option value="mac">macOS</option>
              <option value="linux">Linux</option>
            </select>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Follow these steps to set up your {config.framework} project with {config.language} and {config.styling}.
        </p>

        {/* Progress Bar */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Progress: {completedSteps.size} of {steps.length} steps completed ({completionPercentage}%)
        </p>
      </div>

      {/* Project Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">Project Configuration</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Framework:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100 capitalize">{config.framework}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Language:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100 capitalize">{config.language}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Styling:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100 capitalize">{config.styling}</span>
          </div>
          {config.backend && (
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Backend:</span>
              <span className="ml-2 text-blue-900 dark:text-blue-100 capitalize">{config.backend}</span>
            </div>
          )}
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isExpanded = expandedSteps.has(step.id);
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg transition-all ${
                isCompleted
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                  : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              {/* Step Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </button>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        {step.optional && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
                            Optional
                          </span>
                        )}
                        {step.estimatedTime && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {step.estimatedTime}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleStepExpansion(step.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {/* Commands */}
                  {step.commands && step.commands.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Commands
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => onCopyCommand(step.commands!.join('\n'))}
                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                          title="Copy all commands"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <pre className="text-sm text-green-400 overflow-x-auto">
                          {step.commands.map((cmd, i) => (
                            <div key={i} className={cmd.startsWith('#') ? 'text-gray-500' : ''}>
                              {cmd}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {step.files && step.files.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Configuration Files
                      </h4>
                      <div className="space-y-2">
                        {step.files.map((file, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg dark:border-gray-600">
                            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {file.path}{file.name}
                              </span>
                              <button
                                onClick={() => onDownloadFile(file.name, file.content)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </button>
                            </div>
                            <pre className="p-3 text-sm bg-gray-50 dark:bg-gray-800 overflow-x-auto">
                              {file.content}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && step.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Important Notes
                      </h4>
                      <ul className="space-y-1">
                        {step.notes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-yellow-500 mt-1">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedSteps.size === steps.length && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                🎉 Setup Complete!
              </h3>
              <p className="text-green-700 dark:text-green-300 mt-1">
                Your {config.framework} project is ready for development. Happy coding!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupInstructions;