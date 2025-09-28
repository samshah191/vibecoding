import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Share2, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  Settings,
  User,
  BarChart3,
  Bookmark,
  Heart,
  Star,
  TrendingUp,
  Activity,
  Users,
  FolderOpen,
  GitBranch,
  Layout
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { appsAPI } from '../services/api';
import { App } from '../types';
import AppBuilder from '../components/AppBuilder';
import AdvancedAppBuilder from '../components/AdvancedAppBuilder';
import WorkspaceBuilder from '../components/WorkspaceBuilder';
import AppEditor from '../components/AppEditor';
import CommunityStatsWidget from '../components/CommunityStatsWidget';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAdvancedBuilder, setShowAdvancedBuilder] = useState(false);
  const [showWorkspaceBuilder, setShowWorkspaceBuilder] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  
  // Enhanced state for filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories = [
    { id: 'all', name: 'All Apps', icon: Grid3x3 },
    { id: 'business', name: 'Business', icon: BarChart3 },
    { id: 'social', name: 'Social', icon: Heart },
    { id: 'productivity', name: 'Productivity', icon: CheckCircle },
    { id: 'ecommerce', name: 'E-commerce', icon: Tag },
    { id: 'portfolio', name: 'Portfolio', icon: Star },
  ];
  
  // Collaboration features
  const collaborationFeatures = [
    { 
      id: 'projects', 
      name: 'My Projects', 
      description: 'Save, resume, and manage your app projects',
      icon: FolderOpen,
      path: '/collaboration/projects'
    },
    { 
      id: 'versions', 
      name: 'Version History', 
      description: 'Track changes and restore previous versions',
      icon: GitBranch,
      path: '/collaboration/versions'
    },
    { 
      id: 'collaborators', 
      name: 'Collaborators', 
      description: 'Share projects and work together',
      icon: Users,
      path: '/collaboration/collaborators'
    },
  ];
  
  const sortOptions = [
    { id: 'recent', name: 'Most Recent', icon: Calendar },
    { id: 'name', name: 'Name A-Z', icon: SortAsc },
    { id: 'status', name: 'Status', icon: Activity },
    { id: 'published', name: 'Published First', icon: TrendingUp },
  ];

  useEffect(() => {
    fetchApps();
  }, []);

  // Filter and sort apps
  const filteredAndSortedApps = React.useMemo(() => {
    let filtered = apps;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      // This is a simple categorization - in a real app, you'd have a category field
      filtered = filtered.filter(app => {
        const description = app.description.toLowerCase();
        switch (selectedCategory) {
          case 'business':
            return description.includes('business') || description.includes('analytics') || description.includes('dashboard');
          case 'social':
            return description.includes('social') || description.includes('chat') || description.includes('community');
          case 'productivity':
            return description.includes('task') || description.includes('productivity') || description.includes('manage');
          case 'ecommerce':
            return description.includes('store') || description.includes('shop') || description.includes('ecommerce');
          case 'portfolio':
            return description.includes('portfolio') || description.includes('showcase') || description.includes('personal');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'published':
          return b.published === a.published ? 0 : b.published ? 1 : -1;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [apps, searchQuery, selectedCategory, sortBy]);

  const fetchApps = async () => {
    try {
      const response = await appsAPI.getAll();
      if (response.success && (response.data || response.apps)) {
        setApps((response.data || response.apps) as unknown as App[]);
      }
    } catch (error) {
      console.error('Failed to fetch apps:', error);
      toast.error('Failed to load your apps');
    } finally {
      setLoading(false);
    }
  };

  const handleAppGenerated = (newApp: App) => {
    setApps(prev => [newApp, ...prev]);
    setShowBuilder(false);
    setShowAdvancedBuilder(false);
    toast.success('ðŸŽ‰ Your app has been generated successfully!');
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await appsAPI.delete(appId);
      if (response.success) {
        setApps(prev => prev.filter(app => app.id !== appId));
        toast.success('App deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete app:', error);
      toast.error('Failed to delete app');
    }
  };

  const handleTogglePublish = async (appId: string) => {
    try {
      const response = await appsAPI.togglePublish(appId);
      if (response.success && response.app) {
        setApps(prev => prev.map(app => 
          app.id === appId ? response.app! : app
        ));
        toast.success(response.app.published ? 'App published!' : 'App unpublished');
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update publish status');
    }
  };

  const handleViewApp = (app: App) => {
    setSelectedApp(app);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-500 rounded-full" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated':
        return 'Ready';
      case 'building':
        return 'Building...';
      case 'deployed':
        return 'Deployed';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  if (showBuilder) {
    return <AppBuilder onAppGenerated={handleAppGenerated} onClose={() => setShowBuilder(false)} />;
  }

  if (showAdvancedBuilder) {
    return <AdvancedAppBuilder onAppGenerated={handleAppGenerated} />;
  }

  if (showWorkspaceBuilder) {
    return <WorkspaceBuilder onAppGenerated={handleAppGenerated} />;
  }

  if (selectedApp) {
    return <AppEditor app={selectedApp} onBack={() => setSelectedApp(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Enhanced Header with Search and Stats */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || user?.email?.split('@')[0]}! ðŸ‘‹
            </h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                {apps.length} Total Apps
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                {apps.filter(app => app.published).length} Published
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                {apps.filter(app => app.status === 'generated').length} Ready
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-primary flex items-center whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              Quick Create
            </button>
            <button
              onClick={() => setShowAdvancedBuilder(true)}
              className="btn-secondary flex items-center whitespace-nowrap bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
            >
              <Settings className="w-5 h-5 mr-2" />
              Advanced Config
            </button>
            <button
              onClick={() => setShowWorkspaceBuilder(true)}
              className="btn-secondary flex items-center whitespace-nowrap bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 hover:from-green-600 hover:to-teal-600"
            >
              <Layout className="w-5 h-5 mr-2" />
              Workspace Builder
            </button>
          </div>
        </div>
      </div>

      {/* Community Stats Widget */}
      <div className="mb-8">
        <CommunityStatsWidget />
      </div>

      {/* Collaboration Features */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Collaboration</h2>
          <a href="/collaboration" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {collaborationFeatures.map((feature) => (
            <a 
              key={feature.id}
              href={feature.path}
              className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-8 bg-gradient-to-r from-orange-50 to-pink-50 border-orange-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search apps by name, description, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              title="Filter by category"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              title="Sort apps by"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-l-lg transition-colors`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-r-lg transition-colors`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Active Filters */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-orange-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-orange-600"
                >
                  Ã—
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="ml-2 hover:text-orange-600"
                >
                  Ã—
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-orange-600 hover:text-orange-800 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Apps Display */}
      {loading ? (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedApps.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No apps found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-12 h-12 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No apps yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first app in minutes with AI. Just describe what you want to build!
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Quick Create
                  </button>
                  <button
                    onClick={() => setShowAdvancedBuilder(true)}
                    className="btn-secondary bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Advanced Config
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedApps.length} of {apps.length} apps
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Sorted by {sortOptions.find(s => s.id === sortBy)?.name}</span>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedApps.map((app) => (
                <div key={app.id} className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(app.status)}
                      <span className="text-sm text-gray-500">
                        {getStatusText(app.status)}
                      </span>
                    </div>
                    {app.published && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Live
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors cursor-pointer"
                      onClick={() => handleViewApp(app)}>
                    {app.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {app.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {app.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                    {app.features.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{app.features.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewApp(app)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View app details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.url && (
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Open app"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleTogglePublish(app.id)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title={app.published ? 'Unpublish' : 'Publish'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete app"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredAndSortedApps.map((app) => (
                <div key={app.id} className="card hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
                        {getStatusIcon(app.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-orange-600 transition-colors"
                              onClick={() => handleViewApp(app)}>
                            {app.name}
                          </h3>
                          {app.published && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm truncate mb-2">
                          {app.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {app.features.length} features
                          </span>
                          <span className="flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            {getStatusText(app.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewApp(app)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View app details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.url && (
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Open app"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleTogglePublish(app.id)}
                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                        title={app.published ? 'Unpublish' : 'Publish'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete app"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
