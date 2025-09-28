import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ExternalLink, User, Play, Pause, RotateCcw, Maximize2, VolumeX, Volume2 } from 'lucide-react';

interface EmbedApp {
  id: string;
  title: string;
  description: string;
  author: string;
  authorAvatar?: string;
  appUrl: string;
  thumbnailUrl: string;
  category: string;
  isInteractive: boolean;
}

interface EmbedViewerProps {
  appId?: string;
}

const EmbedViewer: React.FC<EmbedViewerProps> = ({ appId: propAppId }) => {
  const { appId: paramAppId } = useParams<{ appId: string }>();
  const appId = propAppId || paramAppId;
  const [searchParams] = useSearchParams();
  
  const [app, setApp] = useState<EmbedApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Parse embed configuration from URL params
  const embedConfig = {
    theme: searchParams.get('theme') || 'light',
    showHeader: searchParams.get('header') !== 'false',
    showFooter: searchParams.get('footer') === 'true',
    showControls: searchParams.get('controls') !== 'false',
    borderRadius: searchParams.get('radius') || '8',
    showBorder: searchParams.get('border') !== 'false',
    autoplay: searchParams.get('autoplay') === 'true'
  };

  useEffect(() => {
    if (appId) {
      loadEmbedApp();
    }
  }, [appId]);

  useEffect(() => {
    if (embedConfig.autoplay && app) {
      setIsPlaying(true);
    }
  }, [app, embedConfig.autoplay]);

  const loadEmbedApp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      setTimeout(() => {
        if (!appId) {
          setError('No app ID provided');
          setLoading(false);
          return;
        }

        // Simulate embedded app data
        const embedApp: EmbedApp = {
          id: appId,
          title: 'Interactive Todo App',
          description: 'A sleek and modern todo application with drag-and-drop functionality',
          author: 'Jane Smith',
          authorAvatar: '/api/placeholder/32/32',
          appUrl: 'https://todo-demo.vibecoding.app',
          thumbnailUrl: '/api/placeholder/800/600',
          category: 'Productivity',
          isInteractive: true
        };

        setApp(embedApp);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load app');
      setLoading(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const handleFullscreen = () => {
    if (app?.appUrl) {
      window.open(app.appUrl, '_blank');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Apply theme
  const isDark = embedConfig.theme === 'dark' || 
    (embedConfig.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const themeClasses = isDark 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${themeClasses}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm opacity-70">Loading app...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${themeClasses}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ExternalLink className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm font-medium mb-1">Unable to load app</p>
          <p className="text-xs opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-full flex flex-col ${themeClasses}`}
      style={{
        borderRadius: `${embedConfig.borderRadius}px`,
        border: embedConfig.showBorder ? `1px solid ${isDark ? '#374151' : '#e5e7eb'}` : 'none'
      }}
    >
      {/* Header */}
      {embedConfig.showHeader && (
        <div className={`flex items-center justify-between p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <img
              src={app.authorAvatar || '/api/placeholder/24/24'}
              alt={app.author}
              className="w-6 h-6 rounded-full flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium truncate">{app.title}</h3>
              <p className="text-xs opacity-70 truncate">by {app.author}</p>
            </div>
          </div>
          <a
            href={app.appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Open in new tab"
            aria-label="Open app in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative">
        {isPlaying ? (
          <iframe
            src={app.appUrl}
            className="w-full h-full border-none"
            title={app.title}
            allow="autoplay; encrypted-media; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="w-full h-full relative">
            <img
              src={app.thumbnailUrl}
              alt={`${app.title} preview`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all group"
                aria-label="Play app"
              >
                <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {embedConfig.showControls && isPlaying && (
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${
              isDark ? 'from-gray-900/80 to-transparent' : 'from-black/60 to-transparent'
            } transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePause}
                  className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                  title="Pause"
                  aria-label="Pause app"
                >
                  <Pause className="w-4 h-4 text-white" />
                </button>
                
                <button
                  onClick={handleRestart}
                  className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                  title="Restart"
                  aria-label="Restart app"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
                
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                  title={isMuted ? 'Unmute' : 'Mute'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              <button
                onClick={handleFullscreen}
                className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {embedConfig.showFooter && (
        <div className={`p-2 border-t text-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Powered by VibeCoding
          </a>
        </div>
      )}

      {/* Hover overlay for non-playing state */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handlePlay}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        />
      )}
    </div>
  );
};

export default EmbedViewer;