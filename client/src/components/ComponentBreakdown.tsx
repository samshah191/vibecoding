import React, { useState, useMemo } from 'react';
import {
  Component,
  Code,
  Eye,
  Copy,
  Download,
  Search,
  Filter,
  Layers,
  Box,
  Settings,
  Zap,
  Database,
  Smartphone,
  Globe,
  Palette,
  Package,
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export interface ComponentInfo {
  name: string;
  path: string;
  type: 'component' | 'hook' | 'service' | 'util' | 'page' | 'layout';
  framework: string;
  description: string;
  props?: ComponentProp[];
  dependencies: string[];
  usedBy: string[];
  code: string;
  size: number;
  complexity: 'low' | 'medium' | 'high';
  isReusable: boolean;
  lastModified: Date;
  tags: string[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface ComponentBreakdownProps {
  components: ComponentInfo[];
  onComponentSelect?: (component: ComponentInfo) => void;
  selectedComponent?: string;
  onCopyComponent?: (component: ComponentInfo) => void;
  onDownloadComponent?: (component: ComponentInfo) => void;
  className?: string;
}

const ComponentBreakdown: React.FC<ComponentBreakdownProps> = ({
  components,
  onComponentSelect,
  selectedComponent,
  onCopyComponent,
  onDownloadComponent,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'component' | 'hook' | 'service' | 'page'>('all');
  const [filterComplexity, setFilterComplexity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'complexity' | 'usage'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filteredAndSortedComponents = useMemo(() => {
    let filtered = components.filter(component => {
      const matchesSearch = !searchQuery || 
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = filterType === 'all' || component.type === filterType;
      const matchesComplexity = filterComplexity === 'all' || component.complexity === filterComplexity;
      
      return matchesSearch && matchesType && matchesComplexity;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'size':
          return b.size - a.size;
        case 'complexity':
          const complexityOrder = { low: 1, medium: 2, high: 3 };
          return complexityOrder[b.complexity] - complexityOrder[a.complexity];
        case 'usage':
          return b.usedBy.length - a.usedBy.length;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [components, searchQuery, filterType, filterComplexity, sortBy]);

  const getComponentIcon = (type: string) => {
    const icons = {
      component: <Component className="w-5 h-5 text-blue-500" />,
      hook: <Zap className="w-5 h-5 text-purple-500" />,
      service: <Database className="w-5 h-5 text-green-500" />,
      util: <Settings className="w-5 h-5 text-gray-500" />,
      page: <Globe className="w-5 h-5 text-orange-500" />,
      layout: <Layers className="w-5 h-5 text-indigo-500" />
    };
    return icons[type as keyof typeof icons] || <Box className="w-5 h-5 text-gray-400" />;
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-red-600 bg-red-100'
    };
    return colors[complexity as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleCopy = async (component: ComponentInfo) => {
    try {
      await navigator.clipboard.writeText(component.code);
      setCopied(component.name);
      setTimeout(() => setCopied(null), 2000);
      onCopyComponent?.(component);
    } catch (error) {
      console.error('Failed to copy component:', error);
    }
  };

  const getStats = () => {
    return {
      total: components.length,
      reusable: components.filter(c => c.isReusable).length,
      complex: components.filter(c => c.complexity === 'high').length,
      totalSize: components.reduce((sum, c) => sum + c.size, 0)
    };
  };

  const stats = getStats();

  if (!components.length) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Component className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No components available</h3>
        <p className="text-gray-600">Generate an app to analyze its components</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Component className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Component Breakdown</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <Layers className="w-4 h-4" /> : <Box className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search components, hooks, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="component">Components</option>
              <option value="hook">Hooks</option>
              <option value="service">Services</option>
              <option value="page">Pages</option>
            </select>
            
            <select
              value={filterComplexity}
              onChange={(e) => setFilterComplexity(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by complexity"
            >
              <option value="all">All Complexity</option>
              <option value="low">Low Complexity</option>
              <option value="medium">Medium Complexity</option>
              <option value="high">High Complexity</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Sort by"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="complexity">Sort by Complexity</option>
              <option value="usage">Sort by Usage</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              {filteredAndSortedComponents.length} of {components.length} components
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-semibold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Total</div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-semibold text-green-600">{stats.reusable}</div>
            <div className="text-gray-600">Reusable</div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-semibold text-red-600">{stats.complex}</div>
            <div className="text-gray-600">Complex</div>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <div className="font-semibold text-purple-600">{formatFileSize(stats.totalSize)}</div>
            <div className="text-gray-600">Total Size</div>
          </div>
        </div>
      </div>

      {/* Components Display */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredAndSortedComponents.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedComponents.map((component) => (
                <ComponentCard
                  key={component.name}
                  component={component}
                  isSelected={selectedComponent === component.name}
                  isExpanded={expandedComponent === component.name}
                  isCopied={copied === component.name}
                  onSelect={() => {
                    onComponentSelect?.(component);
                    setExpandedComponent(expandedComponent === component.name ? null : component.name);
                  }}
                  onCopy={() => handleCopy(component)}
                  onDownload={() => onDownloadComponent?.(component)}
                  getComponentIcon={getComponentIcon}
                  getComplexityColor={getComplexityColor}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedComponents.map((component) => (
                <ComponentListItem
                  key={component.name}
                  component={component}
                  isSelected={selectedComponent === component.name}
                  isExpanded={expandedComponent === component.name}
                  isCopied={copied === component.name}
                  onSelect={() => {
                    onComponentSelect?.(component);
                    setExpandedComponent(expandedComponent === component.name ? null : component.name);
                  }}
                  onCopy={() => handleCopy(component)}
                  onDownload={() => onDownloadComponent?.(component)}
                  getComponentIcon={getComponentIcon}
                  getComplexityColor={getComplexityColor}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No components match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ComponentCardProps {
  component: ComponentInfo;
  isSelected: boolean;
  isExpanded: boolean;
  isCopied: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onDownload: () => void;
  getComponentIcon: (type: string) => JSX.Element;
  getComplexityColor: (complexity: string) => string;
  formatFileSize: (bytes: number) => string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  isSelected,
  isExpanded,
  isCopied,
  onSelect,
  onCopy,
  onDownload,
  getComponentIcon,
  getComplexityColor,
  formatFileSize
}) => (
  <div className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
  }`}>
    <div onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getComponentIcon(component.type)}
          <div>
            <h4 className="font-medium text-gray-900 truncate">{component.name}</h4>
            <p className="text-xs text-gray-500 capitalize">{component.type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(component.complexity)}`}>
            {component.complexity}
          </span>
          {component.isReusable && (
            <div title="Reusable component">
              <Package className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{component.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{formatFileSize(component.size)}</span>
        <span>Used by {component.usedBy.length}</span>
      </div>

      {/* Tags */}
      {component.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {component.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {component.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{component.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>

    {/* Actions */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
      >
        <Eye className="w-3 h-3" />
        <span>View</span>
      </button>
      
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy component"
        >
          {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Download component"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>

    {/* Expanded Details */}
    {isExpanded && (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
        {/* Props */}
        {component.props && component.props.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-900 mb-2">Props</h5>
            <div className="space-y-1">
              {component.props.slice(0, 3).map((prop) => (
                <div key={prop.name} className="text-xs">
                  <span className="font-medium">{prop.name}</span>
                  <span className="text-gray-500">: {prop.type}</span>
                  {prop.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              ))}
              {component.props.length > 3 && (
                <div className="text-xs text-gray-400">+{component.props.length - 3} more</div>
              )}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {component.dependencies.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-900 mb-2">Dependencies</h5>
            <div className="flex flex-wrap gap-1">
              {component.dependencies.slice(0, 3).map((dep) => (
                <span key={dep} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                  {dep}
                </span>
              ))}
              {component.dependencies.length > 3 && (
                <span className="text-xs text-gray-400">+{component.dependencies.length - 3}</span>
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

interface ComponentListItemProps {
  component: ComponentInfo;
  isSelected: boolean;
  isExpanded: boolean;
  isCopied: boolean;
  onSelect: () => void;
  onCopy: () => void;
  onDownload: () => void;
  getComponentIcon: (type: string) => JSX.Element;
  getComplexityColor: (complexity: string) => string;
  formatFileSize: (bytes: number) => string;
}

const ComponentListItem: React.FC<ComponentListItemProps> = ({
  component,
  isSelected,
  isExpanded,
  isCopied,
  onSelect,
  onCopy,
  onDownload,
  getComponentIcon,
  getComplexityColor,
  formatFileSize
}) => (
  <div className={`border rounded-lg p-3 cursor-pointer transition-all ${
    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
  }`}>
    <div className="flex items-center justify-between" onClick={onSelect}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {getComponentIcon(component.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 truncate">{component.name}</h4>
            <span className="text-xs text-gray-500 capitalize">{component.type}</span>
            {component.isReusable && (
              <div title="Reusable">
                <Package className="w-3 h-3 text-green-500" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{component.description}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(component.complexity)}`}>
          {component.complexity}
        </span>
        <span className="text-xs text-gray-500">{formatFileSize(component.size)}</span>
        <span className="text-xs text-gray-500">Used by {component.usedBy.length}</span>
        
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Copy"
          >
            {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Download"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
        
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </div>
    </div>

    {/* Expanded Content */}
    {isExpanded && (
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Props */}
        {component.props && component.props.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-900 mb-2">Props ({component.props.length})</h5>
            <div className="space-y-1 text-xs">
              {component.props.slice(0, 4).map((prop) => (
                <div key={prop.name} className="flex items-center space-x-1">
                  <span className="font-medium">{prop.name}</span>
                  <span className="text-gray-500">: {prop.type}</span>
                  {prop.required && <span className="text-red-500">*</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        <div>
          <h5 className="text-xs font-medium text-gray-900 mb-2">Dependencies ({component.dependencies.length})</h5>
          <div className="space-y-1 text-xs">
            {component.dependencies.slice(0, 4).map((dep) => (
              <div key={dep} className="text-orange-600">{dep}</div>
            ))}
          </div>
        </div>

        {/* Used By */}
        <div>
          <h5 className="text-xs font-medium text-gray-900 mb-2">Used By ({component.usedBy.length})</h5>
          <div className="space-y-1 text-xs">
            {component.usedBy.slice(0, 4).map((user) => (
              <div key={user} className="text-blue-600">{user}</div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default ComponentBreakdown;