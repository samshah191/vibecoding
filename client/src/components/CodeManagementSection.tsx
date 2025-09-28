import React, { useState, useCallback } from 'react';
import { 
  Code, 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  GitBranch, 
  MessageSquare,
  Eye,
  FolderTree,
  Package,
  Diff,
  BookOpen,
  Settings,
  Search,
  Filter,
  Plus,
  Layers
} from 'lucide-react';

// Import the code management components
import CodePreview from './CodePreview';
import FileStructure, { FileNode } from './FileStructure';
import ComponentBreakdown, { ComponentInfo } from './ComponentBreakdown';
import CodeCopyManager from './CodeCopyManager';
import CodeDiffViewer, { CodeVersion } from './CodeDiffViewer';
import CodeDocumentation, { CodeComment, Documentation } from './CodeDocumentation';

// Define the interface locally to avoid import issues
interface CopyableCode {
  id: string;
  name: string;
  type: 'component' | 'hook' | 'service' | 'util' | 'style' | 'config';
  code: string;
  language: string;
  path: string;
  description?: string;
  dependencies?: string[];
  size: number;
}
import { codeExportService, ProjectExportData } from '../services/codeExport';

interface CodeManagementSectionProps {
  appId: string;
  appName: string;
}

export const CodeManagementSection: React.FC<CodeManagementSectionProps> = ({ 
  appId, 
  appName 
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'structure' | 'components' | 'copy' | 'diff' | 'docs'>('preview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data - in real app, this would come from your backend
  const [projectFiles] = useState<FileNode[]>([
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'folder',
          children: [
            {
              name: 'AppEditor.tsx',
              path: 'src/components/AppEditor.tsx',
              type: 'file',
              language: 'typescript',
              size: 15420,
              content: '// AppEditor component code...'
            },
            {
              name: 'CodePreview.tsx',
              path: 'src/components/CodePreview.tsx',
              type: 'file',
              language: 'typescript',
              size: 8934,
              content: '// CodePreview component code...'
            }
          ]
        },
        {
          name: 'services',
          path: 'src/services',
          type: 'folder',
          children: [
            {
              name: 'api.ts',
              path: 'src/services/api.ts',
              type: 'file',
              language: 'typescript',
              size: 4563,
              content: '// API service code...'
            }
          ]
        }
      ]
    },
    {
      name: 'package.json',
      path: 'package.json',
      type: 'file',
      language: 'json',
      size: 1245,
      content: '{\n  "name": "' + appName.toLowerCase().replace(/\s+/g, '-') + '",\n  "version": "1.0.0"\n}'
    }
  ]);

  const [components] = useState<ComponentInfo[]>([
    {
      name: 'AppEditor',
      path: 'src/components/AppEditor.tsx',
      type: 'component',
      framework: 'React',
      description: 'Main application editor interface',
      props: [
        { name: 'app', type: 'App', required: true, description: 'Application data object' },
        { name: 'onBack', type: '() => void', required: true, description: 'Callback for back navigation' }
      ],
      dependencies: ['react', 'lucide-react', '@types/react'],
      usedBy: ['AppBuilder', 'MainApp'],
      code: '// AppEditor component code...',
      size: 15420,
      complexity: 'high',
      isReusable: false,
      lastModified: new Date('2024-01-20'),
      tags: ['editor', 'ui', 'main']
    },
    {
      name: 'CodePreview',
      path: 'src/components/CodePreview.tsx',
      type: 'component',
      framework: 'React',
      description: 'Code syntax highlighting and preview component',
      props: [
        { name: 'files', type: 'FileData[]', required: true, description: 'Array of file data' },
        { name: 'theme', type: 'string', required: false, description: 'Syntax highlighting theme' }
      ],
      dependencies: ['react', 'react-syntax-highlighter'],
      usedBy: ['CodeManagementSection'],
      code: '// CodePreview component code...',
      size: 8934,
      complexity: 'medium',
      isReusable: true,
      lastModified: new Date('2024-01-18'),
      tags: ['code', 'preview', 'syntax']
    }
  ]);

  const [copyableItems] = useState<CopyableCode[]>([
    {
      id: '1',
      name: 'AppEditor Component',
      path: 'src/components/AppEditor.tsx',
      code: '// AppEditor component implementation...',
      language: 'typescript',
      type: 'component',
      size: 15420,
      dependencies: ['react', 'lucide-react']
    },
    {
      id: '2',
      name: 'API Service',
      path: 'src/services/api.ts',
      code: '// API service implementation...',
      language: 'typescript',
      type: 'service',
      size: 4563,
      dependencies: ['axios']
    }
  ]);

  const [codeVersions] = useState<CodeVersion[]>([
    {
      id: 'v1',
      version: '1.0.0',
      timestamp: new Date('2024-01-15'),
      author: 'Mohammad Samal Shah',
      message: 'Initial implementation of AppEditor',
      content: '// Version 1.0.0 code...',
      changes: {
        added: 543,
        removed: 0,
        modified: 1
      }
    },
    {
      id: 'v2',
      version: '1.1.0',
      timestamp: new Date('2024-01-20'),
      author: 'Mohammad Samal Shah',
      message: 'Added code management features',
      content: '// Version 1.1.0 code...',
      changes: {
        added: 127,
        removed: 23,
        modified: 3
      }
    }
  ]);

  const [comments] = useState<CodeComment[]>([
    {
      id: '1',
      lineNumber: 42,
      filePath: 'src/components/AppEditor.tsx',
      content: 'TODO: Implement better error handling for API calls',
      author: 'Mohammad Samal Shah',
      timestamp: new Date('2024-01-15'),
      type: 'todo',
      tags: ['performance', 'error-handling'],
      resolved: false
    },
    {
      id: '2',
      lineNumber: 156,
      filePath: 'src/components/AppEditor.tsx',
      content: 'This section handles the navigation state management',
      author: 'Mohammad Samal Shah',
      timestamp: new Date('2024-01-16'),
      type: 'note',
      tags: ['navigation', 'state'],
      resolved: false
    }
  ]);

  const [documentation] = useState<Documentation[]>([
    {
      id: '1',
      title: 'AppEditor Component Guide',
      content: 'The AppEditor component is the main interface for editing applications...',
      type: 'component',
      author: 'Mohammad Samal Shah',
      lastModified: new Date('2024-01-20'),
      tags: ['component', 'guide', 'editor'],
      version: '1.0.0'
    }
  ]);

  const handleExportProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectData: ProjectExportData = {
        name: appName,
        description: `Generated code for ${appName}`,
        version: '1.0.0',
        framework: 'react',
        language: 'typescript',
        files: projectFiles.map(file => ({
          name: file.name,
          path: file.path,
          content: file.content || '',
          type: file.type,
          size: file.size || 0
        })),
        dependencies: {
          'react': '^18.0.0',
          'typescript': '^4.9.0',
          'tailwindcss': '^3.0.0',
          'lucide-react': '^0.263.0'
        }
      };

      await codeExportService.exportAsZip(projectData, {
        includeNodeModules: false,
        includeDocumentation: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [appName, appId, projectFiles, components]);

  const handleAddComment = useCallback((comment: Omit<CodeComment, 'id' | 'timestamp'>) => {
    // In real app, this would call your API
    console.log('Adding comment:', comment);
  }, []);

  const handleUpdateComment = useCallback((id: string, comment: Partial<CodeComment>) => {
    // In real app, this would call your API
    console.log('Updating comment:', id, comment);
  }, []);

  const handleDeleteComment = useCallback((id: string) => {
    // In real app, this would call your API
    console.log('Deleting comment:', id);
  }, []);

  const handleAddDocumentation = useCallback((doc: Omit<Documentation, 'id' | 'lastModified'>) => {
    // In real app, this would call your API
    console.log('Adding documentation:', doc);
  }, []);

  const handleUpdateDocumentation = useCallback((id: string, doc: Partial<Documentation>) => {
    // In real app, this would call your API
    console.log('Updating documentation:', id, doc);
  }, []);

  const handleDeleteDocumentation = useCallback((id: string) => {
    // In real app, this would call your API
    console.log('Deleting documentation:', id);
  }, []);

  const handleExportDocumentation = useCallback(() => {
    // Export documentation as JSON or Markdown
    console.log('Exporting documentation');
  }, []);

  const handleImportDocumentation = useCallback((file: File) => {
    // Import documentation from file
    console.log('Importing documentation:', file.name);
  }, []);

  const viewOptions = [
    { id: 'preview', name: 'Code Preview', icon: <Eye className="w-4 h-4" />, description: 'View and syntax highlight code' },
    { id: 'structure', name: 'File Structure', icon: <FolderTree className="w-4 h-4" />, description: 'Browse project files' },
    { id: 'components', name: 'Components', icon: <Package className="w-4 h-4" />, description: 'Analyze components' },
    { id: 'copy', name: 'Copy Manager', icon: <Copy className="w-4 h-4" />, description: 'Copy code snippets' },
    { id: 'diff', name: 'Version Diff', icon: <Diff className="w-4 h-4" />, description: 'Compare versions' },
    { id: 'docs', name: 'Documentation', icon: <BookOpen className="w-4 h-4" />, description: 'Comments and docs' }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Code Management</h2>
            <p className="text-gray-600 mt-1">Manage, analyze, and export your application code</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleExportProject}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export Project
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
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              title={option.description}
            >
              <div className={`p-2 rounded-lg mb-2 ${
                activeView === option.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium text-center">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'preview' && (
          <div className="h-full p-6">
            <CodePreview
              files={projectFiles.map(file => ({
                name: file.name,
                content: file.content || '',
                language: file.language || 'text',
                path: file.path,
                size: file.size || 0,
                lastModified: new Date()
              }))}
              theme="dark"
            />
          </div>
        )}

        {activeView === 'structure' && (
          <div className="h-full p-6">
            <FileStructure
              files={projectFiles}
              onFileSelect={(file) => console.log('Selected file:', file)}
            />
          </div>
        )}

        {activeView === 'components' && (
          <div className="h-full p-6">
            <ComponentBreakdown
              components={components}
              onComponentSelect={(component) => console.log('Selected component:', component)}
            />
          </div>
        )}

        {activeView === 'copy' && (
          <div className="h-full p-6">
            <CodeCopyManager
              codeItems={copyableItems}
              onCopy={(item) => console.log('Copy code:', item)}
            />
          </div>
        )}

        {activeView === 'diff' && (
          <div className="h-full p-6">
            <CodeDiffViewer
              fileName="AppEditor.tsx"
              language="typescript"
              versions={codeVersions}
              onRevert={(versionId) => console.log('Revert to version:', versionId)}
              onCopy={(content) => console.log('Copy content:', content)}
            />
          </div>
        )}

        {activeView === 'docs' && (
          <div className="h-full">
            <CodeDocumentation
              comments={comments}
              documentation={documentation}
              currentFile="src/components/AppEditor.tsx"
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
              onAddDocumentation={handleAddDocumentation}
              onUpdateDocumentation={handleUpdateDocumentation}
              onDeleteDocumentation={handleDeleteDocumentation}
              onExportDocumentation={handleExportDocumentation}
              onImportDocumentation={handleImportDocumentation}
            />
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {projectFiles.length} Files
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {components.length} Components
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {comments.length} Comments
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {documentation.length} Docs
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeManagementSection;