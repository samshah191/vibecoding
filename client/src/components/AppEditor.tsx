import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Share,
  Globe,
  Users,
  Database,
  BarChart3,
  Shield,
  Code,
  Settings,
  Key,
  FileText,
  ChevronDown,
  CheckCircle,
  ExternalLink,
  Copy,
  Send,
  Download,
  Github,
  Archive,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Palette,
  Wand2,
  Plus,
  Monitor,
  Sparkles,
  Search,
  Save,
} from 'lucide-react';
import { App } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ResponsivePreview from './ResponsivePreview';
import VisualEditorToolbar from './VisualEditorToolbar';
import toast from 'react-hot-toast';
import LocalDevelopmentSection from './LocalDevelopmentSection';
import CodeEditorWorkspace from './CodeEditorWorkspace';
import type { FileNode } from './FileStructure';

interface AppEditorProps {
  app: App;
  onBack: () => void;
}

const AppEditor: React.FC<AppEditorProps> = ({ app, onBack }) => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState('overview');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      timestamp: '4 days ago',
      action: 'Revert to Old Design',
      description: 'Understood. I will revert the last change and take you back to the previous design. I will remove the splash cursor effect.',
      canRevert: true
    },
    {
      id: 2,
      timestamp: '4 days ago',
      action: 'Editing Layout',
      description: 'Layout component updated successfully',
      canRevert: false
    },
    {
      id: 3,
      timestamp: '4 days ago',
      action: 'Editing splash-cursor component',
      description: 'splash-cursor component modifications completed',
      canRevert: false
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [credits, setCredits] = useState({ used: 290.6, total: 500 });
  const [selectedModel, setSelectedModel] = useState('default');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const navigationItems = [
    { id: 'overview', name: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', name: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'data', name: 'Data', icon: <Database className="w-4 h-4" />, hasDropdown: true },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'domains', name: 'Domains', icon: <Globe className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'code', name: 'Code', icon: <Code className="w-4 h-4" /> },
    { id: 'local-dev', name: 'Local Dev', icon: <Monitor className="w-4 h-4" />, badge: 'New' },
    { id: 'agents', name: 'Agents', icon: <Wand2 className="w-4 h-4" />, badge: 'Beta' },
    { id: 'logs', name: 'Logs', icon: <FileText className="w-4 h-4" /> },
    { id: 'api', name: 'API', icon: <Code className="w-4 h-4" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-4 h-4" />, hasDropdown: true },
    { id: 'secrets', name: 'Secrets', icon: <Key className="w-4 h-4" /> }
  ];

  const models = [
    { id: 'default', name: 'Default', description: 'Automatically selects the best model for your app' },
    { id: 'claude-sonnet-4', name: 'Claude Sonnet 4' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gpt-5', name: 'GPT-5' }
  ];

  const projectFiles = [
    { name: 'layout.jsx', path: 'Application Layout', type: 'component' },
    { name: 'Homepage.jsx', path: 'pages', type: 'page' },
    { name: 'HeroSection.jsx', path: 'components/homepage', type: 'component' },
    { name: 'FeaturesGrid.jsx', path: 'components/homepage', type: 'component' },
    { name: 'TrendsSection.jsx', path: 'components/homepage', type: 'component' },
    { name: 'ClipsShowcase.jsx', path: 'components/homepage', type: 'component' }
  ];

  const workspaceFiles = useMemo<FileNode[]>(() => [
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          name: 'App.tsx',
          path: 'src/App.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react';

interface Props {
  title: string;
  description: string;
}

const App: React.FC<Props> = ({ title, description }) => {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto max-w-4xl py-16">
        <h1 className="text-4xl font-bold">${app.name}</h1>
        <p className="mt-4 text-slate-300">${app.description ?? 'Launch dashboards with instant insights.'}</p>
      </header>
    </main>
  );
};

export default App;
`,
        },
        {
          name: 'components',
          path: 'src/components',
          type: 'folder',
          children: [
            {
              name: 'InsightCard.tsx',
              path: 'src/components/InsightCard.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';

interface InsightCardProps {
  title: string;
  metric: string;
  trend: number;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, metric, trend }) => {
  const trendColor = trend >= 0 ? 'text-emerald-500' : 'text-rose-500';
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
      <header className="text-sm font-medium text-slate-400">{title}</header>
      <div className="mt-3 text-3xl font-semibold text-white">{metric}</div>
      <div className={'mt-2 text-xs ' + trendColor}>{trend.toFixed(2)}% vs last week</div>
    </article>
  );
};
`,
            },
          ],
        },
        {
          name: 'styles',
          path: 'src/styles',
          type: 'folder',
          children: [
            {
              name: 'global.css',
              path: 'src/styles/global.css',
              type: 'file',
              language: 'css',
              content: `:root {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: #020617;
  color: #f8fafc;
}

main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
`,
            },
          ],
        },
        {
          name: 'hooks',
          path: 'src/hooks',
          type: 'folder',
          children: [
            {
              name: 'useRealtimeMetrics.ts',
              path: 'src/hooks/useRealtimeMetrics.ts',
              type: 'file',
              language: 'typescript',
              content: `import { useEffect, useState } from 'react';

type Metric = {
  id: string;
  value: number;
};

export const useRealtimeMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const handle = setInterval(() => {
      setMetrics((current) =>
        current.map((metric) => ({ ...metric, value: metric.value + Math.random() * 5 - 2 })),
      );
    }, 3200);

    return () => clearInterval(handle);
  }, []);

  return metrics;
};
`,
            },
          ],
        },
      ],
    },
    {
      name: 'server',
      path: 'server',
      type: 'folder',
      children: [
        {
          name: 'index.ts',
          path: 'server/index.ts',
          type: 'file',
          language: 'typescript',
          content: `import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', updatedAt: new Date().toISOString() });
});

app.listen(5000, () => {
  console.log('API listening on http://localhost:5000');
});
`,
        },
        {
          name: 'routes',
          path: 'server/routes',
          type: 'folder',
          children: [
            {
              name: 'insights.ts',
              path: 'server/routes/insights.ts',
              type: 'file',
              language: 'typescript',
              content: `import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json([
    { id: 'active-users', label: 'Active users', value: 1280, delta: 4.5 },
    { id: 'churn-rate', label: 'Churn rate', value: 2.1, delta: -0.7 },
  ]);
});

export default router;
`,
            },
          ],
        },
      ],
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file',
      language: 'json',
      content: `{
  "name": "${app.name.toLowerCase().replace(/\s+/g, '-')}-workspace",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
`,
    },
    {
      name: 'README.md',
      path: 'README.md',
      type: 'file',
      language: 'markdown',
      content: `# ${app.name} Workspace

${app.description ?? 'Modern analytics experience generated by vibecoding.'}

## Getting Started

1. Install dependencies with \`npm install\`.
2. Run the UI with \`npm run dev\`.
3. Start the API with \`npm run dev -- --scope server\`.
`,
    },
  ], [app]);

  const initialWorkspaceFile = useMemo(() => {
    const findFirstFile = (nodes: FileNode[]): string | undefined => {
      for (const node of nodes) {
        if (node.type === 'file') {
          return node.path;
        }
        if (node.children) {
          const found = findFirstFile(node.children);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    return findFirstFile(workspaceFiles);
  }, [workspaceFiles]);

  const workspaceStats = useMemo(() => {
    let fileCount = 0;
    let componentCount = 0;
    let apiCount = 0;
    const languages = new Set<string>();

    const traverse = (nodes: FileNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'file') {
          fileCount += 1;
          if (node.path.includes('src/components')) {
            componentCount += 1;
          }
          if (node.path.startsWith('server/')) {
            apiCount += 1;
          }
          if (node.language) {
            languages.add(node.language);
          }
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };

    traverse(workspaceFiles);
    return { fileCount, componentCount, apiCount, languages };
  }, [workspaceFiles]);

  const handleWorkspaceSave = useCallback(async (_file: { path: string; content: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  }, []);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    // Add new chat entry
    const newEntry = {
      id: chatHistory.length + 1,
      timestamp: 'just now',
      action: 'Processing Request',
      description: chatInput,
      canRevert: false
    };
    
    setChatHistory(prev => [newEntry, ...prev]);
    setChatInput('');
    toast.success('Request submitted to AI');
  };

  const handleRevert = (entryId: number) => {
    const entry = chatHistory.find(h => h.id === entryId);
    if (entry) {
      toast.success(`Reverting: ${entry.action}`);
    }
  };

  return (
    <ResponsivePreview>
      <div className="h-screen bg-gray-50 flex">
        {/* Visual Editor Toolbar */}
        <VisualEditorToolbar />
        
        {/* Left Chat Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-gray-900">Base44</span>
            </div>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              title="User menu"
            >
              <span>{user?.email || 'mohammad_samal22@cms.ac.in'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Credits Section */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Credits</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Pro</span>
            </div>
            <div className="mb-2">
              <div className="text-sm text-gray-600">Monthly Credits</div>
              <div className="text-lg font-semibold">{credits.used}/{credits.total}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${(credits.used / credits.total) * 100}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">Credits renew on: 2025-09-24</div>
            <button className="w-full mt-2 bg-blue-500 text-white text-sm py-1.5 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-1">
              <span>🎁 Win Free Credits</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 text-sm">
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Documentation</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-500">💳</span>
              <span>Billing</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-gray-500">❓</span>
              <span>Help Center</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
              <span className="text-red-500">🚀</span>
              <span className="text-red-500">Upgrade Plan</span>
            </button>
            <button className="w-full text-left flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg text-gray-600">
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Back to Workspace */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {chatHistory.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{entry.timestamp}</span>
                  {entry.canRevert && (
                    <button
                      onClick={() => handleRevert(entry.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>🔄 Revert this</span>
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <div className="font-medium text-sm text-gray-900">{entry.action}</div>
                  <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-gray-500">{entry.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Model Selector */}
        <div className="border-t border-gray-200 p-4">
          <div className="relative mb-4">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">AI Model</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {showModelDropdown && (
              <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-50 ${
                      selectedModel === model.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{model.name}</div>
                    {model.description && (
                      <div className="text-xs text-gray-500 mt-1">{model.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <button className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm">AI Controls</span>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="What would you like to change?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <button
              onClick={handleChatSubmit}
              className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <button className="text-xs text-gray-500 hover:text-gray-700">
              <Settings className="w-3 h-3 inline mr-1" />
              Settings
            </button>
            <button className="text-xs text-gray-500 hover:text-gray-700">
              <Plus className="w-3 h-3 inline mr-1" />
              Discuss
            </button>
            <button className="text-xs text-blue-600 hover:text-blue-800">
              ✨ Visual Edit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-900 font-semibold">
                  <span>{app.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <span className="w-4 h-4">↶</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <span className="w-4 h-4">↷</span>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <span className="w-4 h-4">🔍</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Dashboard
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Preview
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="w-4 h-4">🔄</span>
              </button>
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Share
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Publish
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Center Navigation Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200">
            <div className="p-4">
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => setSelectedSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedSection === item.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </nav>
            </div>

            {/* Files Section */}
            <div className="border-t border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">FILES USED IN THIS PAGE</div>
              <div className="space-y-2">
                {projectFiles.map((file, index) => (
                  <div key={index} className="text-xs">
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-gray-500">{file.path}</div>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>See all files</span>
              </button>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-2">BETA FEATURES</div>
                <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900 flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                  <Github className="w-4 h-4" />
                  <span>Export project to GitHub</span>
                </button>
                <button className="w-full text-left text-sm text-gray-700 hover:text-gray-900 flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg">
                  <Archive className="w-4 h-4" />
                  <span>Export project as ZIP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="flex-1 bg-white">
            {selectedSection === 'overview' && (
              <div className="p-8">
                {/* App Header */}
                <div className="flex items-start space-x-6 mb-8">
                  <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{app.name.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{app.name}</h1>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit app appearance">
                        <Palette className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {app.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      Created {new Date(app.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <span className="text-gray-500">⭐</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 mb-8">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors">
                    <ExternalLink className="w-5 h-5" />
                    <span>Open App</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <Share className="w-5 h-5" />
                    <span>Share App</span>
                    <span className="text-xs text-gray-500">with free credits!</span>
                  </button>
                </div>

                {/* App Visibility */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">App Visibility</h3>
                    <p className="text-gray-600 mb-4">Control who can access your application</p>
                    
                    <div className="border border-gray-200 rounded-lg">
                      <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">Public</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    
                    <label className="flex items-center space-x-3 mt-4">
                      <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                      <span className="text-sm text-gray-700">Require login to access</span>
                    </label>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Invite Users</h3>
                    <p className="text-gray-600 mb-4">Grow your user base by inviting others</p>
                    
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Copy className="w-5 h-5 text-gray-500" />
                        <span>Copy Link</span>
                      </button>
                      <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                        Send Invites
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Code Management Section */}
            {selectedSection === 'code' && (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Code Workspace</h2>
                    <p className="mt-1 text-gray-600">
                      Edit, format, and explore your generated code without leaving the dashboard.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">
                      <Download className="h-4 w-4" />
                      Export Project
                    </button>
                  </div>
                </div>

                <CodeEditorWorkspace
                  files={workspaceFiles}
                  initialFilePath={initialWorkspaceFile}
                  height={560}
                  onSaveFile={handleWorkspaceSave}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Workspace Metrics</h3>
                    <p className="mt-1 text-sm text-gray-500">Live snapshot of the files generated for this app.</p>
                    <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-gray-500">Files</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{workspaceStats.fileCount}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Components</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{workspaceStats.componentCount}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">API routes</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{workspaceStats.apiCount}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Languages</dt>
                        <dd className="text-2xl font-semibold text-gray-900">{workspaceStats.languages.size}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="mt-1 text-sm text-gray-500">Accelerate handoff and collaboration.</p>
                    <ul className="mt-4 space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        Run Prettier formatting on the active file.
                      </li>
                      <li className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-500" />
                        Trigger in-editor search or replace across files.
                      </li>
                      <li className="flex items-center gap-2">
                        <Save className="h-4 w-4 text-blue-500" />
                        Save edits and sync them with your repository workflow.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Local Development Section */}            {/* Local Development Section */}
            {selectedSection === 'local-dev' && (
              <div className="h-full">
                <LocalDevelopmentSection
                  appId={app.id}
                  appName={app.name}
                  appDescription={app.description}
                />
              </div>
            )}

            {/* Other sections */}
            {selectedSection !== 'overview' && selectedSection !== 'code' && selectedSection !== 'local-dev' && (
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Settings className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {navigationItems.find(item => item.id === selectedSection)?.name} Section
                  </h3>
                  <p className="text-gray-600">
                    This section is under development. You can manage your app's {selectedSection} settings here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </ResponsivePreview>
  );
};

export default AppEditor;