import React, { useState, useCallback } from 'react';
import {
  Copy,
  Check,
  Download,
  Share2,
  Code,
  FileText,
  Package,
  Clipboard,
  ExternalLink,
  Eye,
  Settings,
  Palette
} from 'lucide-react';
import { codeExportService } from '../services/codeExport';

interface CopyableCode {
  id: string;
  name: string;
  type: 'component' | 'hook' | 'service' | 'util' | 'style' | 'config';
  code: string;
  language: string;
  path: string;
  description?: string;
  dependencies?: string[];
  props?: ComponentProp[];
  size: number;
}

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface CodeCopyManagerProps {
  codeItems: CopyableCode[];
  onCopy?: (item: CopyableCode) => void;
  onDownload?: (item: CopyableCode) => void;
  onShare?: (item: CopyableCode) => void;
  className?: string;
}

interface CopyState {
  [key: string]: 'idle' | 'copied' | 'error';
}

const CodeCopyManager: React.FC<CodeCopyManagerProps> = ({
  codeItems,
  onCopy,
  onDownload,
  onShare,
  className = ''
}) => {
  const [copyStates, setCopyStates] = useState<CopyState>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [copyFormat, setCopyFormat] = useState<'raw' | 'formatted' | 'with-comments'>('formatted');

  const handleCopyCode = useCallback(async (item: CopyableCode) => {
    try {
      let codeToCopy = item.code;

      // Format the code based on selected format
      if (copyFormat === 'formatted') {
        codeToCopy = formatCode(item);
      } else if (copyFormat === 'with-comments') {
        codeToCopy = addCommentsToCode(item);
      }

      await navigator.clipboard.writeText(codeToCopy);
      
      setCopyStates(prev => ({ ...prev, [item.id]: 'copied' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [item.id]: 'idle' }));
      }, 2000);

      onCopy?.(item);
    } catch (error) {
      console.error('Failed to copy code:', error);
      setCopyStates(prev => ({ ...prev, [item.id]: 'error' }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [item.id]: 'idle' }));
      }, 2000);
    }
  }, [copyFormat, onCopy]);

  const handleDownloadCode = useCallback(async (item: CopyableCode) => {
    try {
      let codeToDownload = item.code;
      
      if (copyFormat === 'formatted') {
        codeToDownload = formatCode(item);
      } else if (copyFormat === 'with-comments') {
        codeToDownload = addCommentsToCode(item);
      }

      await codeExportService.exportComponent(
        item.name,
        codeToDownload,
        getFileExtension(item.language)
      );

      onDownload?.(item);
    } catch (error) {
      console.error('Failed to download code:', error);
    }
  }, [copyFormat, onDownload]);

  const handleBulkCopy = useCallback(async () => {
    const selectedItemsArray = codeItems.filter(item => selectedItems.has(item.id));
    if (selectedItemsArray.length === 0) return;

    try {
      const combinedCode = selectedItemsArray.map(item => {
        let code = item.code;
        if (copyFormat === 'formatted') {
          code = formatCode(item);
        } else if (copyFormat === 'with-comments') {
          code = addCommentsToCode(item);
        }
        
        return `// ${item.name} (${item.type})\n// Path: ${item.path}\n\n${code}`;
      }).join('\n\n' + '='.repeat(80) + '\n\n');

      await navigator.clipboard.writeText(combinedCode);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to copy multiple items:', error);
    }
  }, [selectedItems, codeItems, copyFormat]);

  const handleBulkDownload = useCallback(async () => {
    const selectedItemsArray = codeItems.filter(item => selectedItems.has(item.id));
    if (selectedItemsArray.length === 0) return;

    try {
      const components = selectedItemsArray.map(item => ({
        name: item.name,
        code: copyFormat === 'formatted' ? formatCode(item) : 
              copyFormat === 'with-comments' ? addCommentsToCode(item) : item.code,
        type: getFileExtension(item.language),
        path: `${item.type}s/${item.name}.${getFileExtension(item.language)}`
      }));

      await codeExportService.exportComponents(components, 'selected-components');
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to download multiple items:', error);
    }
  }, [selectedItems, codeItems, copyFormat]);

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(codeItems.map(item => item.id)));
  };

  const selectNone = () => {
    setSelectedItems(new Set());
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      component: <Code className="w-4 h-4 text-blue-500" />,
      hook: <Package className="w-4 h-4 text-purple-500" />,
      service: <Settings className="w-4 h-4 text-green-500" />,
      util: <FileText className="w-4 h-4 text-gray-500" />,
      style: <Palette className="w-4 h-4 text-pink-500" />,
      config: <Settings className="w-4 h-4 text-orange-500" />
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4 text-gray-400" />;
  };

  const getCopyButtonContent = (itemId: string) => {
    const state = copyStates[itemId] || 'idle';
    switch (state) {
      case 'copied':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <Copy className="w-4 h-4 text-red-500" />;
      default:
        return <Copy className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!codeItems.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Clipboard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No code items available</h3>
        <p className="text-gray-600">Generate an app to access copyable code components</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clipboard className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Code Copy Manager</h3>
            <span className="text-sm text-gray-500">({codeItems.length} items)</span>
          </div>

          {/* Copy Format Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Format:</span>
            <select
              value={copyFormat}
              onChange={(e) => setCopyFormat(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select copy format"
            >
              <option value="raw">Raw Code</option>
              <option value="formatted">Formatted</option>
              <option value="with-comments">With Comments</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkCopy}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy All</span>
              </button>
              <button
                onClick={handleBulkDownload}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Download All</span>
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Selection Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Select All
            </button>
            <button
              onClick={selectNone}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Select None
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Total size: {formatFileSize(codeItems.reduce((sum, item) => sum + item.size, 0))}
          </div>
        </div>
      </div>

      {/* Code Items List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {codeItems.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              {/* Selection Checkbox */}
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-label={`Select ${item.name}`}
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(item.type)}
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize">
                    {item.type}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {item.language}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{item.path}</span>
                  <span>{formatFileSize(item.size)}</span>
                  {item.dependencies && item.dependencies.length > 0 && (
                    <span>{item.dependencies.length} dependencies</span>
                  )}
                  {item.props && item.props.length > 0 && (
                    <span>{item.props.length} props</span>
                  )}
                </div>

                {/* Dependencies */}
                {item.dependencies && item.dependencies.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {item.dependencies.slice(0, 3).map((dep) => (
                        <span key={dep} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          {dep}
                        </span>
                      ))}
                      {item.dependencies.length > 3 && (
                        <span className="text-xs text-gray-400 px-2 py-1">
                          +{item.dependencies.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(showPreview === item.id ? null : item.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Preview code"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleCopyCode(item)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {getCopyButtonContent(item.id)}
                </button>

                <button
                  onClick={() => handleDownloadCode(item)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>

                {onShare && (
                  <button
                    onClick={() => onShare(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    title="Share code"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Code Preview */}
            {showPreview === item.id && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Code Preview</span>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="p-4 max-h-64 overflow-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    <code>{item.code.slice(0, 1000)}</code>
                    {item.code.length > 1000 && (
                      <span className="text-gray-500">... (truncated)</span>
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions
function formatCode(item: CopyableCode): string {
  const header = `/**
 * ${item.name}
 * Type: ${item.type}
 * Language: ${item.language}
 * Path: ${item.path}
${item.description ? ` * Description: ${item.description}
` : ''} */

`;
  return header + item.code;
}

function addCommentsToCode(item: CopyableCode): string {
  let code = formatCode(item);
  
  // Add dependency comments
  if (item.dependencies && item.dependencies.length > 0) {
    const depComments = item.dependencies.map(dep => `// Dependency: ${dep}`).join('\n');
    code = depComments + '\n\n' + code;
  }

  // Add props comments for components
  if (item.type === 'component' && item.props && item.props.length > 0) {
    const propsComments = item.props.map(prop => 
      `// Prop: ${prop.name}: ${prop.type}${prop.required ? ' (required)' : ''} - ${prop.description}`
    ).join('\n');
    code = code + '\n\n' + propsComments;
  }

  return code;
}

function getFileExtension(language: string): string {
  const extensions: { [key: string]: string } = {
    javascript: 'js',
    typescript: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    css: 'css',
    scss: 'scss',
    html: 'html',
    json: 'json',
    markdown: 'md'
  };
  
  return extensions[language.toLowerCase()] || 'txt';
}

export default CodeCopyManager;