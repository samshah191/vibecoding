import React, { useState } from 'react';
import { Share2, Grid, Link2, Code, Camera, Star, Settings, ExternalLink } from 'lucide-react';

// Import all the sharing components
import AppGallery from './AppGallery';
import AppSharing from './AppSharing';
import AppEmbedGenerator from './AppEmbedGenerator';
import SocialMediaSharing from './SocialMediaSharing';
import AppShowcase from './AppShowcase';
import AppRatingSystem from './AppRatingSystem';

interface AppSharingHubProps {
  appId: string;
  appTitle: string;
  appDescription: string;
  appUrl: string;
  appImage?: string;
  onClose?: () => void;
}

type SharingMode = 'overview' | 'gallery' | 'sharing' | 'embed' | 'social' | 'showcase' | 'ratings';

const AppSharingHub: React.FC<AppSharingHubProps> = ({
  appId,
  appTitle,
  appDescription,
  appUrl,
  appImage,
  onClose
}) => {
  const [activeMode, setActiveMode] = useState<SharingMode>('overview');

  const sharingOptions = [
    {
      id: 'gallery' as const,
      title: 'Public Gallery',
      description: 'Browse and discover apps in the public gallery',
      icon: <Grid className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => setActiveMode('gallery')
    },
    {
      id: 'sharing' as const,
      title: 'Share via Link',
      description: 'Create unique shareable links with custom settings',
      icon: <Link2 className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => setActiveMode('sharing')
    },
    {
      id: 'embed' as const,
      title: 'Embed Code',
      description: 'Generate embed codes for websites and blogs',
      icon: <Code className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => setActiveMode('embed')
    },
    {
      id: 'social' as const,
      title: 'Social Media',
      description: 'Share on Twitter, Facebook, LinkedIn and more',
      icon: <Share2 className="w-6 h-6" />,
      color: 'bg-pink-500',
      action: () => setActiveMode('social')
    },
    {
      id: 'showcase' as const,
      title: 'Screenshots',
      description: 'Create and manage app screenshots',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-orange-500',
      action: () => setActiveMode('showcase')
    },
    {
      id: 'ratings' as const,
      title: 'Ratings & Reviews',
      description: 'Manage ratings and community feedback',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-yellow-500',
      action: () => setActiveMode('ratings')
    }
  ];

  const renderContent = () => {
    switch (activeMode) {
      case 'gallery':
        return <AppGallery />;
      case 'sharing':
        return (
          <AppSharing
            appId={appId}
            appTitle={appTitle}
            onClose={() => setActiveMode('overview')}
          />
        );
      case 'embed':
        return (
          <AppEmbedGenerator
            appId={appId}
            appTitle={appTitle}
            onClose={() => setActiveMode('overview')}
          />
        );
      case 'social':
        return (
          <SocialMediaSharing
            appId={appId}
            appTitle={appTitle}
            appDescription={appDescription}
            appUrl={appUrl}
            appImage={appImage}
            onClose={() => setActiveMode('overview')}
          />
        );
      case 'showcase':
        return (
          <AppShowcase
            appId={appId}
            appTitle={appTitle}
            appUrl={appUrl}
            onClose={() => setActiveMode('overview')}
          />
        );
      case 'ratings':
        return (
          <div className="p-6">
            <AppRatingSystem
              appId={appId}
              appTitle={appTitle}
            />
          </div>
        );
      default:
        return (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">App Sharing Hub</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Share your amazing app with the world using powerful sharing tools and features.
              </p>
            </div>

            {/* App Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                {appImage && (
                  <img
                    src={appImage}
                    alt={appTitle}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{appTitle}</h2>
                  <p className="text-gray-600 mb-2">{appDescription}</p>
                  <a
                    href={appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Live App</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Sharing Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sharingOptions.map(option => (
                <button
                  key={option.id}
                  onClick={option.action}
                  className="group text-left p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-lg text-white mb-4 ${option.color} group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">1.2k</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600 mb-1">89</div>
                <div className="text-sm text-gray-600">Shares</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">4.7</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-orange-600 mb-1">23</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveMode('sharing')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Link2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Create Share Link</span>
                </button>
                
                <button
                  onClick={() => setActiveMode('social')}
                  className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Share on Social</span>
                </button>
                
                <button
                  onClick={() => setActiveMode('showcase')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Take Screenshots</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {activeMode !== 'overview' && (
              <button
                onClick={() => setActiveMode('overview')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to overview"
                aria-label="Back to overview"
              >
                ←
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {activeMode === 'overview' ? 'App Sharing Hub' : 
                 sharingOptions.find(opt => opt.id === activeMode)?.title || 'Sharing'}
              </h1>
              <p className="text-gray-600">{appTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {activeMode === 'overview' && (
              <button
                onClick={() => setActiveMode('gallery')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Grid className="w-4 h-4" />
                <span>Browse Gallery</span>
              </button>
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sharing hub"
              >
                <span className="text-gray-400 text-xl">&times;</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>

        {/* Footer (only in overview mode) */}
        {activeMode === 'overview' && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Share your app and connect with the VibeCoding community.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setActiveMode('ratings')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Reviews
                </button>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Sharing Guidelines
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSharingHub;