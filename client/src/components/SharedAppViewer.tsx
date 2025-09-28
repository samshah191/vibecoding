import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, User, Calendar, Eye, Heart, Share2, Code, Download } from 'lucide-react';

interface SharedAppData {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  screenshots: string[];
  code: string;
  liveUrl?: string;
  createdAt: string;
  sharedAt: string;
  views: number;
  likes: number;
  isExpired: boolean;
  requiresAuth: boolean;
}

interface SharedAppViewerProps {
  shareId?: string;
}

const SharedAppViewer: React.FC<SharedAppViewerProps> = ({ shareId: propShareId }) => {
  const { shareId: paramShareId } = useParams<{ shareId: string }>();
  const shareId = propShareId || paramShareId;
  
  const [appData, setAppData] = useState<SharedAppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (shareId) {
      loadSharedApp();
    }
  }, [shareId]);

  const loadSharedApp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      setTimeout(() => {
        // Check if share ID exists and is valid
        if (!shareId || shareId.length < 10) {
          setError('Invalid share link');
          setLoading(false);
          return;
        }

        // Simulate shared app data
        const sharedApp: SharedAppData = {
          id: '1',
          title: 'Weather Dashboard Pro',
          description: 'A beautiful and responsive weather dashboard with detailed forecasts, interactive maps, and customizable widgets. Built with modern web technologies.',
          author: 'John Doe',
          authorAvatar: '/api/placeholder/40/40',
          category: 'Weather',
          tags: ['weather', 'dashboard', 'responsive', 'api'],
          screenshots: [
            '/api/placeholder/800/500',
            '/api/placeholder/800/500',
            '/api/placeholder/800/500'
          ],
          code: `import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain } from 'lucide-react';

const WeatherDashboard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    // Weather API call
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Weather Dashboard</h1>
        {/* Weather content */}
      </div>
    </div>
  );
};

export default WeatherDashboard;`,
          liveUrl: 'https://weather-demo.vibecoding.app',
          createdAt: '2024-01-15T10:30:00Z',
          sharedAt: '2024-01-15T14:20:00Z',
          views: 1247,
          likes: 89,
          isExpired: false,
          requiresAuth: false
        };

        setAppData(sharedApp);
        
        // Increment view count
        incrementViewCount();
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to load shared app');
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    // Simulate API call to increment view count
    console.log('Incrementing view count for share:', shareId);
  };

  const handleLike = async () => {
    if (!appData) return;
    
    try {
      setLiked(!liked);
      setAppData(prev => prev ? {
        ...prev,
        likes: liked ? prev.likes - 1 : prev.likes + 1
      } : null);
      
      // Simulate API call
      console.log('Toggling like for shared app:', shareId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && appData) {
      navigator.share({
        title: appData.title,
        text: appData.description,
        url: window.location.href
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const downloadCode = () => {
    if (!appData) return;
    
    const blob = new Blob([appData.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appData.title.replace(/\s+/g, '-').toLowerCase()}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared app...</p>
        </div>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">App Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This shared app link is invalid or has expired.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to VibeCoding
          </a>
        </div>
      </div>
    );
  }

  if (appData.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This shared app link has expired and is no longer available.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Public Gallery
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-2xl font-bold text-blue-600">
                VibeCoding
              </a>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Shared App</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  liked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{appData.likes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{appData.title}</h1>
                  <p className="text-gray-600 text-lg">{appData.description}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {appData.category}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>by {appData.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{appData.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Shared {new Date(appData.sharedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {appData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Screenshots</h2>
              
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={appData.screenshots[currentScreenshot]}
                    alt={`${appData.title} screenshot ${currentScreenshot + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {appData.screenshots.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {appData.screenshots.map((screenshot, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentScreenshot(index)}
                        className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                          currentScreenshot === index 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={screenshot}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Demo */}
            {appData.liveUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Live Demo</h2>
                  <a
                    href={appData.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live App</span>
                  </a>
                </div>
                
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={appData.liveUrl}
                    className="w-full h-full"
                    title={`${appData.title} live demo`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            )}

            {/* Code */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Source Code</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    <span>{showCode ? 'Hide Code' : 'View Code'}</span>
                  </button>
                  <button
                    onClick={downloadCode}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {showCode && (
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-100">
                    <code>{appData.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={appData.authorAvatar || '/api/placeholder/48/48'}
                  alt={appData.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{appData.author}</p>
                  <p className="text-sm text-gray-600">App Creator</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Built this amazing app using VibeCoding's AI-powered platform.
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">App Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{appData.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-medium">{appData.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(appData.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{appData.category}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Create Your Own App</h3>
              <p className="text-blue-100 text-sm mb-4">
                Use VibeCoding's AI to build amazing apps in minutes.
              </p>
              <a
                href="/"
                className="block w-full text-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Start Building
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedAppViewer;