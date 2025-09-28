import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  FileText,
  Code,
  Palette,
  Settings,
  Check
} from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
}

interface CodePreviewProps {
  files: CodeFile[];
  selectedFile?: string;
  onFileSelect?: (fileName: string) => void;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  className?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  files,
  selectedFile,
  onFileSelect,
  theme = 'dark',
  showLineNumbers = true,
  wrapLines = false,
  showCopyButton = true,
  showDownloadButton = true,
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [currentFile, setCurrentFile] = useState(selectedFile || files[0]?.name);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(showLineNumbers);
  const [wrapLinesState, setWrapLinesState] = useState(wrapLines);

  const currentFileData = files.find(file => file.name === currentFile);

  const handleFileSelect = useCallback((fileName: string) => {
    setCurrentFile(fileName);
    onFileSelect?.(fileName);
  }, [onFileSelect]);

  const handleCopy = useCallback(async () => {
    if (!currentFileData?.content) return;
    
    try {
      await navigator.clipboard.writeText(currentFileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [currentFileData?.content]);

  const handleDownload = useCallback(() => {
    if (!currentFileData) return;
    
    const blob = new Blob([currentFileData.content], { 
      type: 'text/plain;charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [currentFileData]);

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      javascript: '🟨',
      typescript: '🔷',
      jsx: '⚛️',
      tsx: '⚛️',
      css: '🎨',
      scss: '🎨',
      html: '🌐',
      json: '📄',
      markdown: '📝',
      python: '🐍',
      java: '☕',
      php: '🐘',
      sql: '🗃️'
    };
    return icons[language.toLowerCase()] || '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!files.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files available</h3>
        <p className="text-gray-600">Generate an app to view its code files</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Code Preview</h3>
          </div>
          
          {/* File Selector */}
          <div className="relative">
            <select
              value={currentFile}
              onChange={(e) => handleFileSelect(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select file to preview"
            >
              {files.map((file) => (
                <option key={file.name} value={file.name}>
                  {file.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-2">
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          
          {showDownloadButton && (
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle theme"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={lineNumbers}
                onChange={(e) => setLineNumbers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show line numbers</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={wrapLinesState}
                onChange={(e) => setWrapLinesState(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Wrap lines</span>
            </label>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Theme:</span>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value as 'light' | 'dark')}
                className="text-sm border border-gray-300 rounded px-2 py-1"
                title="Select theme"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* File Info */}
      {currentFileData && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <span>{getLanguageIcon(currentFileData.language)}</span>
                <span>{currentFileData.language.toUpperCase()}</span>
              </span>
              <span>{formatFileSize(currentFileData.size)}</span>
              <span>Last modified: {currentFileData.lastModified.toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentFileData.path}
            </div>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="relative overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}>
        {currentFileData ? (
          <SyntaxHighlighter
            language={currentFileData.language.toLowerCase()}
            style={currentTheme === 'dark' ? vscDarkPlus : vs}
            showLineNumbers={lineNumbers}
            wrapLines={wrapLinesState}
            wrapLongLines={wrapLinesState}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            codeTagProps={{
              style: {
                fontFamily: '"Fira Code", "Monaco", "Consolas", "Ubuntu Mono", monospace'
              }
            }}
          >
            {currentFileData.content}
          </SyntaxHighlighter>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a file to preview</p>
            </div>
          </div>
        )}
      </div>

      {/* File List Sidebar - Show on larger screens when multiple files */}
      {files.length > 1 && !isFullscreen && (
        <div className="hidden lg:block absolute right-0 top-16 bottom-0 w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Project Files</h4>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleFileSelect(file.name)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    currentFile === file.name
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span>{getLanguageIcon(file.language)}</span>
                    <span className="font-medium text-sm truncate">{file.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {file.path}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatFileSize(file.size)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile File List */}
      {files.length > 1 && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => handleFileSelect(file.name)}
                className={`p-2 rounded-md text-left transition-colors ${
                  currentFile === file.name
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs">{getLanguageIcon(file.language)}</span>
                  <span className="text-xs font-medium truncate">{file.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePreview;