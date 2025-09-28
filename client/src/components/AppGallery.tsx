import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart, Bookmark, Share2, Eye, Star, TrendingUp } from 'lucide-react';

interface PublicApp {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  screenshot: string;
  likes: number;
  views: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  isLiked: boolean;
  isBookmarked: boolean;
  isFeatured: boolean;
  isTrending: boolean;
}

interface AppGalleryProps {
  className?: string;
}

const AppGallery: React.FC<AppGalleryProps> = ({ className = '' }) => {
  const [apps, setApps] = useState<PublicApp[]>([]);
  const [filteredApps, setFilteredApps] = useState<PublicApp[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  // Sample data - replace with API call
  const sampleApps: PublicApp[] = [
    {
      id: '1',
      title: 'Task Manager Pro',
      description: 'A powerful task management app with team collaboration features',
      author: 'John Doe',
      category: 'Productivity',
      tags: ['productivity', 'collaboration', 'tasks'],
      screenshot: '/api/placeholder/400/250',
      likes: 156,
      views: 2340,
      rating: 4.8,
      ratingCount: 45,
      createdAt: '2024-01-15',
      isLiked: false,
      isBookmarked: true,
      isFeatured: true,
      isTrending: true
    },
    {
      id: '2',
      title: 'Weather Dashboard',
      description: 'Beautiful weather app with detailed forecasts and maps',
      author: 'Jane Smith',
      category: 'Weather',
      tags: ['weather', 'forecast', 'maps'],
      screenshot: '/api/placeholder/400/250',
      likes: 89,
      views: 1560,
      rating: 4.6,
      ratingCount: 23,
      createdAt: '2024-01-12',
      isLiked: true,
      isBookmarked: false,
      isFeatured: false,
      isTrending: true
    },
    {
      id: '3',
      title: 'Recipe Finder',
      description: 'Discover and save your favorite recipes with smart search',
      author: 'Mike Johnson',
      category: 'Food',
      tags: ['recipes', 'cooking', 'food'],
      screenshot: '/api/placeholder/400/250',
      likes: 234,
      views: 3420,
      rating: 4.9,
      ratingCount: 67,
      createdAt: '2024-01-10',
      isLiked: false,
      isBookmarked: false,
      isFeatured: true,
      isTrending: false
    }
  ];

  const categories = ['All', 'Productivity', 'Weather', 'Food', 'Finance', 'Games', 'Education'];

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setApps(sampleApps);
      setFilteredApps(sampleApps);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = apps;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort apps
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredApps(filtered);
  }, [apps, selectedCategory, searchTerm, sortBy]);

  const handleLike = (appId: string) => {
    setApps(prev => prev.map(app =>
      app.id === appId
        ? {
            ...app,
            isLiked: !app.isLiked,
            likes: app.isLiked ? app.likes - 1 : app.likes + 1
          }
        : app
    ));
  };

  const handleBookmark = (appId: string) => {
    setApps(prev => prev.map(app =>
      app.id === appId ? { ...app, isBookmarked: !app.isBookmarked } : app
    ));
  };

  const handleShare = (app: PublicApp) => {
    // Will be implemented in sharing integration task
    console.log('Sharing app:', app.title);
  };

  const featuredApps = apps.filter(app => app.isFeatured);
  const trendingApps = apps.filter(app => app.isTrending);

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 space-y-4">
                  <div className="h-40 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VibeCoding App Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing apps built with VibeCoding. Get inspired, share your creations, and connect with the community.
          </p>
        </div>

        {/* Featured Apps Section */}
        {featuredApps.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 text-yellow-500 mr-2" />
              Featured Apps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.slice(0, 3).map(app => (
                <div key={app.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 border border-yellow-200">
                  <div className="relative">
                    <img
                      src={app.screenshot}
                      alt={app.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{app.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{app.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>by {app.author}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{app.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLike(app.id)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            app.isLiked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${app.isLiked ? 'fill-current' : ''}`} />
                          <span>{app.likes}</span>
                        </button>
                        <button
                          onClick={() => handleBookmark(app.id)}
                          title={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                          aria-label={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                          className={`p-2 rounded-full transition-colors ${
                            app.isBookmarked
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${app.isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleShare(app)}
                        title="Share app"
                        aria-label="Share app"
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Apps Section */}
        {trendingApps.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
              Trending Apps
            </h2>
            <div className="flex overflow-x-auto space-x-6 pb-4">
              {trendingApps.map(app => (
                <div key={app.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={app.screenshot}
                    alt={app.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-1">{app.title}</h3>
                    <p className="text-gray-600 text-xs mb-2">{app.description.slice(0, 60)}...</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{app.author}</span>
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{app.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                title="Filter by category"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort apps by"
              title="Sort apps by"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="views">Most Viewed</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                aria-label="Switch to grid view"
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                aria-label="Switch to list view"
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Apps Grid/List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Apps ({filteredApps.length})
            </h2>
          </div>

          {filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No apps found matching your criteria</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredApps.map(app => (
                viewMode === 'grid' ? (
                  <div key={app.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={app.screenshot}
                      alt={app.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{app.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{app.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>by {app.author}</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{app.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLike(app.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                              app.isLiked
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${app.isLiked ? 'fill-current' : ''}`} />
                            <span>{app.likes}</span>
                          </button>
                          <button
                            onClick={() => handleBookmark(app.id)}
                            title={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            aria-label={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            className={`p-2 rounded-full transition-colors ${
                              app.isBookmarked
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${app.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleShare(app)}
                          title="Share app"
                          aria-label="Share app"
                          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={app.id} className="bg-white rounded-lg shadow-md p-6 flex gap-6">
                    <img
                      src={app.screenshot}
                      alt={app.title}
                      className="w-32 h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{app.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{app.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>by {app.author}</span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span>{app.rating} ({app.ratingCount})</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{app.views}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleLike(app.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                              app.isLiked
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${app.isLiked ? 'fill-current' : ''}`} />
                            <span>{app.likes}</span>
                          </button>
                          <button
                            onClick={() => handleBookmark(app.id)}
                            title={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            aria-label={app.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            className={`p-2 rounded-full transition-colors ${
                              app.isBookmarked
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${app.isBookmarked ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleShare(app)}
                            title="Share app"
                            aria-label="Share app"
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppGallery;