import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileText,
  Code,
  Image,
  Settings,
  Database,
  Globe,
  Package,
  GitBranch,
  Search,
  Filter,
  Eye,
  Download,
  Copy
} from 'lucide-react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  language?: string;
  content?: string;
  children?: FileNode[];
  lastModified?: Date;
  isGenerated?: boolean;
}

interface FileStructureProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void;
  selectedFile?: string;
  showFileSize?: boolean;
  showLastModified?: boolean;
  expandAll?: boolean;
  className?: string;
}

const FileStructure: React.FC<FileStructureProps> = ({
  files,
  onFileSelect,
  selectedFile,
  showFileSize = true,
  showLastModified = false,
  expandAll = false,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    expandAll ? new Set(getAllFolderPaths(files)) : new Set(['src', 'components', 'pages'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'components' | 'pages' | 'styles' | 'config'>('all');

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'folder') {
      toggleFolder(file.path);
    } else {
      onFileSelect?.(file);
    }
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: JSX.Element } = {
      'tsx': <Code className="w-4 h-4 text-blue-400" />,
      'jsx': <Code className="w-4 h-4 text-cyan-400" />,
      'ts': <Code className="w-4 h-4 text-blue-600" />,
      'js': <Code className="w-4 h-4 text-yellow-500" />,
      'css': <FileText className="w-4 h-4 text-purple-500" />,
      'scss': <FileText className="w-4 h-4 text-pink-500" />,
      'html': <Globe className="w-4 h-4 text-orange-500" />,
      'json': <Settings className="w-4 h-4 text-green-500" />,
      'md': <FileText className="w-4 h-4 text-gray-500" />,
      'png': <Image className="w-4 h-4 text-green-400" />,
      'jpg': <Image className="w-4 h-4 text-green-400" />,
      'jpeg': <Image className="w-4 h-4 text-green-400" />,
      'svg': <Image className="w-4 h-4 text-purple-400" />,
      'sql': <Database className="w-4 h-4 text-blue-700" />,
      'package': <Package className="w-4 h-4 text-red-500" />,
      'git': <GitBranch className="w-4 h-4 text-orange-600" />
    };

    return iconMap[extension || ''] || <File className="w-4 h-4 text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const shouldShowFile = (file: FileNode): boolean => {
    if (!searchQuery && filterType === 'all') return true;
    
    const matchesSearch = !searchQuery || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || (() => {
      const path = file.path.toLowerCase();
      switch (filterType) {
        case 'components':
          return path.includes('component') || path.includes('src/components');
        case 'pages':
          return path.includes('page') || path.includes('src/pages');
        case 'styles':
          return file.name.endsWith('.css') || file.name.endsWith('.scss') || path.includes('styles');
        case 'config':
          return file.name.includes('config') || file.name.includes('.json') || file.name.includes('package');
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  };

  const filteredFiles = useMemo(() => {
    return filterFileTree(files, shouldShowFile);
  }, [files, searchQuery, filterType]);

  const getTotalStats = () => {
    const stats = {
      totalFiles: 0,
      totalFolders: 0,
      totalSize: 0,
      languages: new Set<string>()
    };

    const traverse = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder') {
          stats.totalFolders++;
          if (node.children) traverse(node.children);
        } else {
          stats.totalFiles++;
          stats.totalSize += node.size || 0;
          if (node.language) stats.languages.add(node.language);
        }
      });
    };

    traverse(files);
    return stats;
  };

  const stats = getTotalStats();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">File Structure</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExpandedFolders(new Set(getAllFolderPaths(files)))}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedFolders(new Set())}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'components', 'pages', 'styles', 'config'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter as any)}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  filterType === filter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.totalFiles}</div>
            <div className="text-gray-600">Files</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.totalFolders}</div>
            <div className="text-gray-600">Folders</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{formatFileSize(stats.totalSize)}</div>
            <div className="text-gray-600">Total Size</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stats.languages.size}</div>
            <div className="text-gray-600">Languages</div>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredFiles.length > 0 ? (
          <FileTreeNode
            nodes={filteredFiles}
            level={0}
            expandedFolders={expandedFolders}
            selectedFile={selectedFile}
            onFileClick={handleFileClick}
            showFileSize={showFileSize}
            showLastModified={showLastModified}
            getFileIcon={getFileIcon}
            formatFileSize={formatFileSize}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No files match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface FileTreeNodeProps {
  nodes: FileNode[];
  level: number;
  expandedFolders: Set<string>;
  selectedFile?: string;
  onFileClick: (file: FileNode) => void;
  showFileSize: boolean;
  showLastModified: boolean;
  getFileIcon: (file: FileNode) => JSX.Element;
  formatFileSize: (bytes: number) => string;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  nodes,
  level,
  expandedFolders,
  selectedFile,
  onFileClick,
  showFileSize,
  showLastModified,
  getFileIcon,
  formatFileSize
}) => {
  return (
    <div>
      {nodes.map((node) => (
        <div key={node.path}>
          <div
            className={`flex items-center py-1 px-2 rounded cursor-pointer transition-colors ${
              selectedFile === node.path
                ? 'bg-blue-100 text-blue-900'
                : 'hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => onFileClick(node)}
          >
            {/* Expand/Collapse Icon */}
            <div className="w-4 h-4 mr-1 flex items-center justify-center">
              {node.type === 'folder' ? (
                expandedFolders.has(node.path) ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )
              ) : null}
            </div>

            {/* File Icon */}
            <div className="mr-2">
              {getFileIcon(node)}
            </div>

            {/* File Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate">{node.name}</span>
                {node.isGenerated && (
                  <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">
                    Generated
                  </span>
                )}
              </div>
              
              {/* File Details */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-0.5">
                {showFileSize && node.size && (
                  <span>{formatFileSize(node.size)}</span>
                )}
                {showLastModified && node.lastModified && (
                  <span>{node.lastModified.toLocaleDateString()}</span>
                )}
                {node.language && (
                  <span className="text-blue-600">{node.language}</span>
                )}
              </div>
            </div>

            {/* Action Icons */}
            {node.type === 'file' && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="View file"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileClick(node);
                  }}
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy content"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.content) {
                      navigator.clipboard.writeText(node.content);
                    }
                  }}
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Children */}
          {node.type === 'folder' && 
           node.children && 
           expandedFolders.has(node.path) && (
            <FileTreeNode
              nodes={node.children}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onFileClick={onFileClick}
              showFileSize={showFileSize}
              showLastModified={showLastModified}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Helper functions
function getAllFolderPaths(nodes: FileNode[]): string[] {
  const paths: string[] = [];
  
  const traverse = (nodes: FileNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        paths.push(node.path);
        if (node.children) {
          traverse(node.children);
        }
      }
    });
  };
  
  traverse(nodes);
  return paths;
}

function filterFileTree(nodes: FileNode[], shouldShow: (file: FileNode) => boolean): FileNode[] {
  return nodes.reduce((acc: FileNode[], node) => {
    if (node.type === 'folder') {
      const filteredChildren = node.children ? filterFileTree(node.children, shouldShow) : [];
      if (filteredChildren.length > 0 || shouldShow(node)) {
        acc.push({
          ...node,
          children: filteredChildren
        });
      }
    } else if (shouldShow(node)) {
      acc.push(node);
    }
    return acc;
  }, []);
}

export default FileStructure;