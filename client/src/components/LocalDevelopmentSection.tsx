import React, { useState, useCallback } from 'react';
import {
  Package,
  FileText,
  Settings,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Terminal,
  Code,
  Folder,
  Key,
  Globe,
  Database,
  Shield,
  Monitor,
  Play,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Info,
  Wrench,
  Layers
} from 'lucide-react';

// Import our services
import { packageJsonGenerator } from '../services/packageJsonGenerator';
import { environmentConfigGenerator } from '../services/environmentConfigGenerator';
import { dockerConfigGenerator } from '../services/dockerConfigGenerator';
import { readmeGenerator } from '../services/readmeGenerator';
import SetupInstructions from './SetupInstructions';

interface ProjectConfig {
  name: string;
  description: string;
  framework: 'react' | 'vue' | 'angular' | 'next' | 'nuxt' | 'svelte' | 'vanilla';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'styled-components' | 'emotion' | 'sass' | 'css';
  backend?: 'express' | 'fastify' | 'nest' | 'koa' | 'hapi';
  database?: 'prisma' | 'mongoose' | 'sequelize' | 'typeorm' | 'drizzle';
  authentication?: 'auth0' | 'firebase' | 'supabase' | 'clerk' | 'nextauth';
  deployment?: 'vercel' | 'netlify' | 'heroku' | 'aws' | 'docker';
  features: string[];
  author: string;
  version: string;
  license: string;
}

interface LocalDevelopmentSectionProps {
  appId: string;
  appName: string;
  appDescription: string;
}

export const LocalDevelopmentSection: React.FC<LocalDevelopmentSectionProps> = ({
  appId,
  appName,
  appDescription
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'package' | 'env' | 'docker' | 'readme' | 'setup'>('overview');
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: appName.toLowerCase().replace(/\s+/g, '-'),
    description: appDescription,
    framework: 'react',
    language: 'typescript',
    styling: 'tailwind',
    features: ['authentication', 'responsive', 'dark-mode'],
    author: 'Mohammad Samal Shah',
    version: '1.0.0',
    license: 'MIT'
  });

  const [generatedFiles, setGeneratedFiles] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedFiles, setCopiedFiles] = useState<Set<string>>(new Set());

  const handleConfigChange = useCallback((field: keyof ProjectConfig, value: any) => {
    setProjectConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const generatePackageJson = useCallback(async () => {
    setIsGenerating(true);
    try {
      const config = {
        framework: projectConfig.framework,
        language: projectConfig.language,
        styling: projectConfig.styling,
        backend: projectConfig.backend,
        database: projectConfig.database,
        authentication: projectConfig.authentication,
        deployment: projectConfig.deployment,
        features: projectConfig.features
      };

      const metadata = {
        name: projectConfig.name,
        version: projectConfig.version,
        description: projectConfig.description,
        author: projectConfig.author,
        license: projectConfig.license
      };

      const packageJson = packageJsonGenerator.generatePackageJson(config, metadata);
      const tsConfig = packageJsonGenerator.generateTsConfig(config);
      const eslintConfig = packageJsonGenerator.generateEslintConfig(config);

      setGeneratedFiles(prev => ({
        ...prev,
        'package.json': JSON.stringify(packageJson, null, 2),
        'tsconfig.json': JSON.stringify(tsConfig, null, 2),
        '.eslintrc.json': JSON.stringify(eslintConfig, null, 2)
      }));
    } catch (error) {
      console.error('Failed to generate package.json:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [projectConfig]);

  const generateEnvironmentFiles = useCallback(async () => {
    setIsGenerating(true);
    try {
      const envFile = environmentConfigGenerator.generateEnvironmentFile(
        projectConfig.framework,
        projectConfig.features
      );
      const envExample = environmentConfigGenerator.generateEnvironmentExample(
        projectConfig.framework,
        projectConfig.features
      );
      const dockerEnv = environmentConfigGenerator.generateDockerEnv(
        projectConfig.framework,
        projectConfig.features
      );

      setGeneratedFiles(prev => ({
        ...prev,
        '.env': envFile,
        '.env.example': envExample,
        '.env.docker': dockerEnv
      }));
    } catch (error) {
      console.error('Failed to generate environment files:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [projectConfig]);

  const generateDockerFiles = useCallback(async () => {
    setIsGenerating(true);
    try {
      const dockerConfig = {
        framework: projectConfig.framework,
        language: projectConfig.language,
        nodeVersion: '20',
        buildTool: 'npm',
        packageManager: 'npm' as const,
        outputDir: 'dist',
        port: 3000,
        features: projectConfig.features,
        environment: 'production' as const,
        multiStage: true,
        healthCheck: true,
        nonRootUser: true
      };

      const dockerFiles = dockerConfigGenerator.generateAllDockerFiles(
        dockerConfig,
        ['database', 'redis', 'nginx']
      );

      const filesMap: { [key: string]: string } = {};
      dockerFiles.forEach(file => {
        filesMap[file.name] = file.content;
      });

      setGeneratedFiles(prev => ({
        ...prev,
        ...filesMap
      }));
    } catch (error) {
      console.error('Failed to generate Docker files:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [projectConfig]);

  const generateReadme = useCallback(async () => {
    setIsGenerating(true);
    try {
      const metadata = {
        name: projectConfig.name,
        description: projectConfig.description,
        version: projectConfig.version,
        author: projectConfig.author,
        license: projectConfig.license
      };

      const techStack = {
        framework: projectConfig.framework,
        language: projectConfig.language,
        styling: projectConfig.styling,
        backend: projectConfig.backend,
        database: projectConfig.database,
        authentication: projectConfig.authentication,
        deployment: projectConfig.deployment,
        features: projectConfig.features
      };

      const deploymentConfig = projectConfig.deployment ? {
        platform: projectConfig.deployment,
        buildCommand: 'npm run build',
        startCommand: 'npm start',
        nodeVersion: '20'
      } : undefined;

      const readme = readmeGenerator.generateReadme(metadata, techStack, deploymentConfig);
      const changelog = readmeGenerator.generateChangelog(projectConfig.version, [
        'Initial project setup',
        'Basic component structure',
        'Authentication system',
        'Responsive design'
      ]);
      const contributing = readmeGenerator.generateContributingGuide();

      setGeneratedFiles(prev => ({
        ...prev,
        'README.md': readme,
        'CHANGELOG.md': changelog,
        'CONTRIBUTING.md': contributing
      }));
    } catch (error) {
      console.error('Failed to generate README:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [projectConfig]);

  const copyToClipboard = useCallback(async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFiles(prev => new Set([...prev, fileName]));
      setTimeout(() => {
        setCopiedFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileName);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  const downloadFile = useCallback((content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAllFiles = useCallback(() => {
    Object.entries(generatedFiles).forEach(([fileName, content]) => {
      downloadFile(content, fileName);
    });
  }, [generatedFiles, downloadFile]);

  const viewOptions = [
    { id: 'overview', name: 'Overview', icon: <Info className="w-4 h-4" />, description: 'Project overview and configuration' },
    { id: 'package', name: 'Package.json', icon: <Package className="w-4 h-4" />, description: 'Dependencies and scripts' },
    { id: 'env', name: 'Environment', icon: <Key className="w-4 h-4" />, description: 'Environment variables' },
    { id: 'docker', name: 'Docker', icon: <Layers className="w-4 h-4" />, description: 'Containerization' },
    { id: 'readme', name: 'Documentation', icon: <BookOpen className="w-4 h-4" />, description: 'README and guides' },
    { id: 'setup', name: 'Setup Guide', icon: <Wrench className="w-4 h-4" />, description: 'Installation instructions' }
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Local Development Support</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Generate project files and setup instructions for local development</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAllFiles}
              disabled={Object.keys(generatedFiles).length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download All Files ({Object.keys(generatedFiles).length})
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveView(option.id as any)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                activeView === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
              }`}
              title={option.description}
            >
              <div className={`p-2 rounded-lg mb-2 ${
                activeView === option.id ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium text-center">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeView === 'overview' && (
          <div className="p-6 max-w-4xl mx-auto">
            {/* Project Configuration */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Project Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectConfig.name}
                    onChange={(e) => handleConfigChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    placeholder="my-react-app"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={projectConfig.version}
                    onChange={(e) => handleConfigChange('version', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    placeholder="1.0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Framework
                  </label>
                  <select
                    value={projectConfig.framework}
                    onChange={(e) => handleConfigChange('framework', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    aria-label="Select framework"
                  >
                    <option value="react">React</option>
                    <option value="next">Next.js</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="svelte">Svelte</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Language
                  </label>
                  <select
                    value={projectConfig.language}
                    onChange={(e) => handleConfigChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    aria-label="Select language"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Styling
                  </label>
                  <select
                    value={projectConfig.styling}
                    onChange={(e) => handleConfigChange('styling', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    aria-label="Select styling solution"
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="styled-components">Styled Components</option>
                    <option value="emotion">Emotion</option>
                    <option value="sass">Sass</option>
                    <option value="css">Plain CSS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    value={projectConfig.author}
                    onChange={(e) => handleConfigChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                    placeholder="Your Name"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Description
                </label>
                <textarea
                  value={projectConfig.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-100"
                  placeholder="Describe your project..."
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={generatePackageJson}
                disabled={isGenerating}
                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Package className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">Generate Package.json</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Dependencies and scripts
                </span>
              </button>
              
              <button
                onClick={generateEnvironmentFiles}
                disabled={isGenerating}
                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Key className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">Generate Environment</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Configuration templates
                </span>
              </button>
              
              <button
                onClick={generateDockerFiles}
                disabled={isGenerating}
                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Layers className="w-8 h-8 text-purple-600 mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">Generate Docker</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  Containerization files
                </span>
              </button>
              
              <button
                onClick={generateReadme}
                disabled={isGenerating}
                className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <BookOpen className="w-8 h-8 text-orange-600 mb-2" />
                <span className="font-medium text-gray-900 dark:text-white">Generate Docs</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                  README and guides
                </span>
              </button>
            </div>

            {/* Generated Files Summary */}
            {Object.keys(generatedFiles).length > 0 && (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Generated Files</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.keys(generatedFiles).map((fileName) => (
                    <span key={fileName} className="text-sm text-green-700 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other views would show generated file content */}
        {activeView !== 'overview' && activeView !== 'setup' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {Object.keys(generatedFiles).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Files Generated Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configure your project and generate files to see them here.
                  </p>
                  <button
                    onClick={() => setActiveView('overview')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Configuration
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(generatedFiles)
                    .filter(([fileName]) => {
                      if (activeView === 'package') return fileName.includes('package') || fileName.includes('tsconfig') || fileName.includes('eslint');
                      if (activeView === 'env') return fileName.includes('.env');
                      if (activeView === 'docker') return fileName.includes('docker') || fileName.includes('Dockerfile') || fileName.includes('nginx');
                      if (activeView === 'readme') return fileName.includes('.md') || fileName.includes('README') || fileName.includes('CHANGELOG');
                      return true;
                    })
                    .map(([fileName, content]) => (
                      <div key={fileName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(content, fileName)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              {copiedFiles.has(fileName) ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copiedFiles.has(fileName) ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() => downloadFile(content, fileName)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </div>
                        <pre className="p-4 text-sm bg-gray-900 text-green-400 overflow-x-auto max-h-96">
                          {content}
                        </pre>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'setup' && (
          <div className="p-6">
            <SetupInstructions
              config={{
                framework: projectConfig.framework,
                language: projectConfig.language,
                styling: projectConfig.styling,
                backend: projectConfig.backend,
                database: projectConfig.database,
                deployment: projectConfig.deployment,
                features: projectConfig.features
              }}
              projectName={projectConfig.name}
              onCopyCommand={(command) => copyToClipboard(command, 'command')}
              onDownloadFile={downloadFile}
            />
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {Object.keys(generatedFiles).length} Files Generated
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {projectConfig.framework} + {projectConfig.language}
            </span>
            <span className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              {projectConfig.features.length} Features
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Ready for development</span>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              All Systems Go
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalDevelopmentSection;