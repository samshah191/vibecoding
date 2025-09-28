import React, { useState, useMemo } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import {
  GitBranch,
  Clock,
  Eye,
  EyeOff,
  Code,
  FileText,
  Download,
  Copy,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  Filter,
  Search,
  Check
} from 'lucide-react';

export interface CodeVersion {
  id: string;
  content: string;
  timestamp: Date;
  version: string;
  message: string;
  author: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
  tags?: string[];
  isGenerated?: boolean;
}

export interface DiffViewerProps {
  fileName: string;
  language: string;
  versions: CodeVersion[];
  onRevert?: (versionId: string) => void;
  onCopy?: (content: string) => void;
  onDownload?: (version: CodeVersion) => void;
  className?: string;
}

const CodeDiffViewer: React.FC<DiffViewerProps> = ({
  fileName,
  language,
  versions,
  onRevert,
  onCopy,
  onDownload,
  className = ''
}) => {
  const [selectedVersions, setSelectedVersions] = useState<{left: string; right: string}>(() => {
    if (versions.length >= 2) {
      return {
        left: versions[1].id,
        right: versions[0].id
      };
    }
    return {
      left: versions[0]?.id || '',
      right: versions[0]?.id || ''
    };
  });

  const [diffMethod, setDiffMethod] = useState<DiffMethod>(DiffMethod.CHARS);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showInlineView, setShowInlineView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideUnchanged, setHideUnchanged] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  const leftVersion = versions.find(v => v.id === selectedVersions.left);
  const rightVersion = versions.find(v => v.id === selectedVersions.right);

  const diffStats = useMemo(() => {
    if (!leftVersion || !rightVersion) return null;

    const leftLines = leftVersion.content.split('\n');
    const rightLines = rightVersion.content.split('\n');
    
    return {
      leftLines: leftLines.length,
      rightLines: rightLines.length,
      timeDiff: Math.abs(rightVersion.timestamp.getTime() - leftVersion.timestamp.getTime()),
      sizeChange: rightVersion.content.length - leftVersion.content.length
    };
  }, [leftVersion, rightVersion]);

  const handleVersionChange = (side: 'left' | 'right', versionId: string) => {
    setSelectedVersions(prev => ({
      ...prev,
      [side]: versionId
    }));
  };

  const swapVersions = () => {
    setSelectedVersions(prev => ({
      left: prev.right,
      right: prev.left
    }));
  };

  const handleCopy = async (side: 'left' | 'right') => {
    const content = side === 'left' ? leftVersion?.content : rightVersion?.content;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2000);
      onCopy?.(content);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const goToPreviousVersion = () => {
    const currentIndex = versions.findIndex(v => v.id === selectedVersions.right);
    if (currentIndex < versions.length - 1) {
      const newVersionId = versions[currentIndex + 1].id;
      setSelectedVersions(prev => ({
        left: prev.right,
        right: newVersionId
      }));
    }
  };

  const goToNextVersion = () => {
    const currentIndex = versions.findIndex(v => v.id === selectedVersions.right);
    if (currentIndex > 0) {
      const newVersionId = versions[currentIndex - 1].id;
      setSelectedVersions(prev => ({
        left: prev.right,
        right: newVersionId
      }));
    }
  };

  const formatTimeDiff = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${bytes >= 0 ? '+' : ''}${size} ${sizes[i]}`;
  };

  const getChangeIcon = (changes: CodeVersion['changes']) => {
    if (changes.added > 0 && changes.removed === 0) {
      return <span className="text-green-600">+{changes.added}</span>;
    } else if (changes.removed > 0 && changes.added === 0) {
      return <span className="text-red-600">-{changes.removed}</span>;
    } else if (changes.modified > 0) {
      return <span className="text-blue-600">~{changes.modified}</span>;
    }
    return <span className="text-gray-600">No changes</span>;
  };

  if (!versions.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No versions available</h3>
        <p className="text-gray-600">Generate and modify code to see version history</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''} ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">{fileName}</h3>
              <p className="text-sm text-gray-600">Code Diff Viewer ({versions.length} versions)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Version Selectors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Left Version */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Compare From</label>
            <select
              value={selectedVersions.left}
              onChange={(e) => handleVersionChange('left', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select left version"
            >
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.version} - {version.message} ({formatTimeDiff(Date.now() - version.timestamp.getTime())})
                </option>
              ))}
            </select>
            {leftVersion && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{leftVersion.author}</span>
                <span>{getChangeIcon(leftVersion.changes)}</span>
              </div>
            )}
          </div>

          {/* Right Version */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Compare To</label>
            <select
              value={selectedVersions.right}
              onChange={(e) => handleVersionChange('right', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select right version"
            >
              {versions.map(version => (
                <option key={version.id} value={version.id}>
                  {version.version} - {version.message} ({formatTimeDiff(Date.now() - version.timestamp.getTime())})
                </option>
              ))}
            </select>
            {rightVersion && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{rightVersion.author}</span>
                <span>{getChangeIcon(rightVersion.changes)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={swapVersions}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Swap versions"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousVersion}
                disabled={versions.findIndex(v => v.id === selectedVersions.right) >= versions.length - 1}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                title="Previous version"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextVersion}
                disabled={versions.findIndex(v => v.id === selectedVersions.right) <= 0}
                className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                title="Next version"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Diff Method */}
            <select
              value={diffMethod}
              onChange={(e) => setDiffMethod(e.target.value as DiffMethod)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Diff method"
            >
              <option value={DiffMethod.CHARS}>Character</option>
              <option value={DiffMethod.WORDS}>Word</option>
              <option value={DiffMethod.LINES}>Line</option>
            </select>

            {/* View Options */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-1 text-xs">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Line numbers</span>
              </label>
              
              <label className="flex items-center space-x-1 text-xs">
                <input
                  type="checkbox"
                  checked={showInlineView}
                  onChange={(e) => setShowInlineView(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Inline</span>
              </label>

              <label className="flex items-center space-x-1 text-xs">
                <input
                  type="checkbox"
                  checked={hideUnchanged}
                  onChange={(e) => setHideUnchanged(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Hide unchanged</span>
              </label>
            </div>
          </div>
        </div>

        {/* Stats */}
        {diffStats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-2 bg-white rounded border">
              <div className="font-semibold text-blue-600">{diffStats.leftLines} → {diffStats.rightLines}</div>
              <div className="text-gray-600">Lines</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="font-semibold text-purple-600">{formatTimeDiff(diffStats.timeDiff)}</div>
              <div className="text-gray-600">Time apart</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className={`font-semibold ${diffStats.sizeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatFileSize(diffStats.sizeChange)}
              </div>
              <div className="text-gray-600">Size change</div>
            </div>
            <div className="text-center p-2 bg-white rounded border">
              <div className="font-semibold text-gray-600">{language}</div>
              <div className="text-gray-600">Language</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {leftVersion && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Left:</span>
                <button
                  onClick={() => handleCopy('left')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
                  title="Copy left version"
                >
                  {copiedSide === 'left' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                {onDownload && (
                  <button
                    onClick={() => onDownload(leftVersion)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
                    title="Download left version"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                )}
                {onRevert && (
                  <button
                    onClick={() => onRevert(leftVersion.id)}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center space-x-1"
                    title="Revert to this version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {rightVersion && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Right:</span>
                <button
                  onClick={() => handleCopy('right')}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
                  title="Copy right version"
                >
                  {copiedSide === 'right' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
                {onDownload && (
                  <button
                    onClick={() => onDownload(rightVersion)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
                    title="Download right version"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                )}
                {onRevert && (
                  <button
                    onClick={() => onRevert(rightVersion.id)}
                    className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded flex items-center space-x-1"
                    title="Revert to this version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diff Display */}
      <div className="overflow-auto" style={{ maxHeight: isFullscreen ? 'calc(100vh - 300px)' : '600px' }}>
        {leftVersion && rightVersion ? (
          <ReactDiffViewer
            oldValue={leftVersion.content}
            newValue={rightVersion.content}
            splitView={!showInlineView}
            showDiffOnly={hideUnchanged}
            compareMethod={diffMethod}
            leftTitle={`${leftVersion.version} (${leftVersion.message})`}
            rightTitle={`${rightVersion.version} (${rightVersion.message})`}
            styles={{
              variables: {
                light: {
                  codeFoldGutterBackground: '#f8f9fa',
                  codeFoldBackground: '#f1f3f4',
                  addedBackground: '#e6ffed',
                  removedBackground: '#ffeef0',
                  wordAddedBackground: '#acf2bd',
                  wordRemovedBackground: '#fdb8c0',
                  addedGutterBackground: '#cdffd8',
                  removedGutterBackground: '#ffc1cc',
                  gutterBackground: '#f8f9fa',
                  gutterBackgroundDark: '#f8f9fa',
                  highlightBackground: '#fffbdd',
                  highlightGutterBackground: '#fff5b4',
                }
              },
              contentText: {
                fontSize: '14px',
                fontFamily: '"Fira Code", "Monaco", "Consolas", "Ubuntu Mono", monospace'
              }
            }}
            useDarkTheme={false}
            hideLineNumbers={!showLineNumbers}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select versions to compare</p>
            </div>
          </div>
        )}
      </div>

      {/* Version Timeline */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Version Timeline</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {versions.slice(0, 5).map((version, index) => (
            <div
              key={version.id}
              className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-colors ${
                selectedVersions.left === version.id || selectedVersions.right === version.id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-white hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => handleVersionChange('right', version.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="font-medium">{version.version}</span>
                </div>
                <span className="text-gray-600 truncate">{version.message}</span>
                {version.isGenerated && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Generated</span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTimeDiff(Date.now() - version.timestamp.getTime())}</span>
                <span>{getChangeIcon(version.changes)}</span>
              </div>
            </div>
          ))}
          {versions.length > 5 && (
            <div className="text-center text-xs text-gray-500 py-2">
              +{versions.length - 5} more versions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeDiffViewer;