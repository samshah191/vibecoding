import React, { useState } from 'react';
import {
  Layout,
  FileCode,
  Settings,
  GitBranch,
  MessageCircle,
  Play,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  Palette,
  Database,
  Users,
  Share2,
  Code,
  History,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import AppBuilder from './AppBuilder';
import CodeEditorWorkspace from './CodeEditorWorkspace';
import VisualLayoutEditor from './VisualLayoutEditor';
import VisualEditor from './VisualEditor';
import GitTimeline from './GitTimeline';

interface WorkspaceBuilderProps {
  onAppGenerated: (app: any) => void;
}

const WorkspaceBuilder: React.FC<WorkspaceBuilderProps> = ({ onAppGenerated }) => {
  const [activeView, setActiveView] = useState<'builder' | 'editor' | 'visual' | 'preview'>('builder');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'visual'>('code');
  
  // Mock data for the editor
  const mockFiles: any[] = [
    {
      name: 'src',
      path: 'src',
      type: 'folder' as const,
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'folder' as const,
          children: [
            {
              name: 'Header.tsx',
              path: 'src/components/Header.tsx',
              type: 'file' as const,
              language: 'typescript',
              content: '// Header component code'
            },
            {
              name: 'Footer.tsx',
              path: 'src/components/Footer.tsx',
              type: 'file' as const,
              language: 'typescript',
              content: '// Footer component code'
            }
          ]
        },
        {
          name: 'pages',
          path: 'src/pages',
          type: 'folder' as const,
          children: [
            {
              name: 'Home.tsx',
              path: 'src/pages/Home.tsx',
              type: 'file' as const,
              language: 'typescript',
              content: '// Home page code'
            }
          ]
        },
        {
          name: 'App.tsx',
          path: 'src/App.tsx',
          type: 'file' as const,
          language: 'typescript',
          content: '// Main App component'
        }
      ]
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file' as const,
      language: 'json',
      content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">VibeCoding</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <button
                onClick={() => setActiveView('builder')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeView === 'builder' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                App Builder
              </button>
              
              <button
                onClick={() => setActiveView('editor')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeView === 'editor' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileCode className="w-5 h-5 mr-3" />
                Code Editor
              </button>
              
              <button
                onClick={() => setActiveView('visual')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeView === 'visual' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Layout className="w-5 h-5 mr-3" />
                Visual Editor
              </button>
              
              <button
                onClick={() => setActiveView('preview')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeView === 'preview' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Eye className="w-5 h-5 mr-3" />
                Preview
              </button>
              
              <div className="border-t border-gray-200 my-4"></div>
              
              <button
                onClick={() => setActiveView('editor')}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeView === 'editor' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                Version Control
              </button>
              
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100">
                <MessageCircle className="w-5 h-5 mr-3" />
                Comments
              </button>
              
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100">
                <Users className="w-5 h-5 mr-3" />
                Collaborators
              </button>
              
              <button className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100">
                <Share2 className="w-5 h-5 mr-3" />
                Share
              </button>
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">User Name</div>
                <div className="text-xs text-gray-500">Online</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-gray-100 mr-2"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveView('builder')}
                className={`px-3 py-1.5 text-sm rounded ${
                  activeView === 'builder' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Builder
              </button>
              <button
                onClick={() => setActiveView('editor')}
                className={`px-3 py-1.5 text-sm rounded ${
                  activeView === 'editor' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveView('visual')}
                className={`px-3 py-1.5 text-sm rounded ${
                  activeView === 'visual' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1.5 text-sm rounded ${
                  activeView === 'preview' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded hover:bg-gray-100"
              title="Mobile preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-100"
              title="Tablet preview"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded hover:bg-gray-100"
              title="Desktop preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            
            <div className="h-4 w-px bg-gray-300 mx-2"></div>
            
            <button className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 flex items-center">
              <Play className="w-4 h-4 mr-1" />
              Run
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'builder' && (
            <div className="h-full">
              <AppBuilder onAppGenerated={onAppGenerated} />
            </div>
          )}
          
          {activeView === 'editor' && (
            <div className="h-full flex flex-col">
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setActiveEditorTab('code')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeEditorTab === 'code'
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileCode className="w-4 h-4 inline mr-2" />
                  Code Editor
                </button>
                <button
                  onClick={() => setActiveEditorTab('visual')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeEditorTab === 'visual'
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Palette className="w-4 h-4 inline mr-2" />
                  Visual Editor
                </button>
                <button
                  onClick={() => setActiveView('editor')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeView === 'editor'
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="w-4 h-4 inline mr-2" />
                  Version Control
                </button>
              </div>
              
              <div className="flex-1 flex">
                {activeEditorTab === 'code' ? (
                  <div className="flex-1 flex">
                    <div className="w-1/3 p-4">
                      <CodeEditorWorkspace 
                        files={mockFiles}
                        height="100%"
                      />
                    </div>
                    <div className="w-2/3 p-4">
                      <GitTimeline />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <Palette className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Visual editor for selected elements</p>
                      <p className="text-sm text-gray-400 mt-1">Select an element in the editor to modify its styles</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeView === 'visual' && (
            <div className="h-full">
              <VisualLayoutEditor />
            </div>
          )}
          
          {activeView === 'preview' && (
            <div className="h-full flex flex-col">
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">App Preview</h2>
              </div>
              <div className="flex-1 flex items-center justify-center bg-gray-100">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-full max-h-4xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Preview Your App</h3>
                    <p className="text-gray-500 mb-6">Your application preview will appear here after generation</p>
                    <button 
                      onClick={() => setActiveView('builder')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Build Your App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBuilder;