import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check, 
  QrCode, 
  Download,
  Users,
  TrendingUp,
  Eye
} from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (params: ShareParams) => string;
  isAvailable: boolean;
  description?: string;
}

interface ShareParams {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

interface ShareStats {
  platform: string;
  shares: number;
  clicks: number;
  engagement: number;
}

interface SocialMediaSharingProps {
  appId: string;
  appTitle: string;
  appDescription: string;
  appUrl: string;
  appImage?: string;
  onClose?: () => void;
}

const SocialMediaSharing: React.FC<SocialMediaSharingProps> = ({
  appId,
  appTitle,
  appDescription,
  appUrl,
  appImage,
  onClose
}) => {
  const [shareStats, setShareStats] = useState<ShareStats[]>([]);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>(['VibeCoding', 'NoCode', 'WebApp']);
  const [showQR, setShowQR] = useState(false);
  const [shareHistory, setShareHistory] = useState<any[]>([]);

  const suggestedHashtags = [
    'VibeCoding', 'NoCode', 'WebApp', 'AI', 'JavaScript', 'React', 
    'Productivity', 'Tool', 'OpenSource', 'Innovation', 'Tech', 'Startup'
  ];

  const shareParams: ShareParams = {
    url: appUrl,
    title: appTitle,
    description: customMessage || appDescription,
    image: appImage,
    hashtags: selectedHashtags
  };

  const platforms: SocialPlatform[] = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-blue-500',
      shareUrl: (params) => {
        const text = `${params.title}

${params.description}

${params.hashtags?.map(tag => `#${tag}`).join(' ') || ''}`;
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(params.url)}`;
      },
      isAvailable: true,
      description: 'Share with your followers'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-600',
      shareUrl: (params) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(params.url)}&quote=${encodeURIComponent(params.title + ' - ' + params.description)}`,
      isAvailable: true,
      description: 'Share on your timeline'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-700',
      shareUrl: (params) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(params.url)}&title=${encodeURIComponent(params.title)}&summary=${encodeURIComponent(params.description)}`,
      isAvailable: true,
      description: 'Share with professionals'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-green-500',
      shareUrl: (params) => 
        `https://wa.me/?text=${encodeURIComponent(`${params.title}

${params.description}

${params.url}`)}`,
      isAvailable: true,
      description: 'Share with contacts'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-gray-600',
      shareUrl: (params) => 
        `mailto:?subject=${encodeURIComponent(params.title)}&body=${encodeURIComponent(`${params.description}\n\nCheck it out: ${params.url}`)}`,
      isAvailable: true,
      description: 'Send via email'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-orange-500',
      shareUrl: (params) => 
        `https://reddit.com/submit?title=${encodeURIComponent(params.title)}&url=${encodeURIComponent(params.url)}`,
      isAvailable: true,
      description: 'Share with communities'
    }
  ];

  useEffect(() => {
    loadShareStats();
    loadShareHistory();
  }, [appId]);

  const loadShareStats = async () => {
    // Simulate API call to get share statistics
    setTimeout(() => {
      const stats: ShareStats[] = [
        { platform: 'twitter', shares: 45, clicks: 234, engagement: 12.5 },
        { platform: 'facebook', shares: 32, clicks: 156, engagement: 8.7 },
        { platform: 'linkedin', shares: 28, clicks: 189, engagement: 15.2 },
        { platform: 'whatsapp', shares: 67, clicks: 301, engagement: 22.1 },
        { platform: 'email', shares: 23, clicks: 98, engagement: 9.8 },
        { platform: 'reddit', shares: 15, clicks: 87, engagement: 18.3 }
      ];
      setShareStats(stats);
    }, 500);
  };

  const loadShareHistory = async () => {
    // Simulate API call to get share history
    setTimeout(() => {
      const history = [
        { platform: 'twitter', timestamp: '2024-01-15T10:30:00Z', clicks: 12 },
        { platform: 'facebook', timestamp: '2024-01-14T15:20:00Z', clicks: 8 },
        { platform: 'linkedin', timestamp: '2024-01-13T09:15:00Z', clicks: 15 }
      ];
      setShareHistory(history);
    }, 600);
  };

  const handleShare = async (platform: SocialPlatform) => {
    try {
      const shareUrl = platform.shareUrl(shareParams);
      
      // Track share event
      await trackShare(platform.id);
      
      // Open share window
      if (platform.id === 'email') {
        window.location.href = shareUrl;
      } else {
        const popup = window.open(
          shareUrl,
          'share',
          'width=600,height=400,scrollbars=yes,resizable=yes'
        );
        
        // Focus the popup
        if (popup) {
          popup.focus();
        }
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const trackShare = async (platform: string) => {
    // Simulate API call to track share
    console.log(`Tracking share to ${platform} for app ${appId}`);
    
    // Update local stats
    setShareStats(prev => 
      prev.map(stat => 
        stat.platform === platform 
          ? { ...stat, shares: stat.shares + 1 }
          : stat
      )
    );
  };

  const copyToClipboard = async () => {
    try {
      const shareText = `${shareParams.title}

${shareParams.description}

${shareParams.url}

${selectedHashtags.map(tag => `#${tag}`).join(' ')}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleHashtag = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag)
        ? prev.filter(tag => tag !== hashtag)
        : [...prev, hashtag]
    );
  };

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl)}`;
  };

  const downloadShareKit = () => {
    // Generate a share kit with assets and copy
    const shareKit = {
      title: appTitle,
      description: appDescription,
      url: appUrl,
      hashtags: selectedHashtags,
      image: appImage,
      socialCopy: {
        twitter: `🚀 Just built an amazing ${appTitle} with @VibeCoding! ${selectedHashtags.map(tag => `#${tag}`).join(' ')}\n\nTry it here: ${appUrl}`,
        facebook: `Excited to share my latest creation: ${appTitle}!

${appDescription}

Built with VibeCoding's AI-powered platform. Check it out!`,
        linkedin: `I'm thrilled to showcase ${appTitle}, a web application I built using VibeCoding.\n\n${appDescription}\n\nThe power of no-code development continues to amaze me. What do you think?\n\n${selectedHashtags.map(tag => `#${tag}`).join(' ')}`
      }
    };

    const blob = new Blob([JSON.stringify(shareKit, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appTitle.replace(/\s+/g, '-').toLowerCase()}-share-kit.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalShares = shareStats.reduce((sum, stat) => sum + stat.shares, 0);
  const totalClicks = shareStats.reduce((sum, stat) => sum + stat.clicks, 0);
  const avgEngagement = shareStats.length > 0 
    ? shareStats.reduce((sum, stat) => sum + stat.engagement, 0) / shareStats.length 
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Share Your App</h2>
                <p className="text-gray-600">{appTitle}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sharing dialog"
              >
                <span className="text-gray-400 text-xl">&times;</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Main Sharing Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={appDescription}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map(hashtag => (
                    <button
                      key={hashtag}
                      onClick={() => toggleHashtag(hashtag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedHashtags.includes(hashtag)
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      #{hashtag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Platforms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share On</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform)}
                      disabled={!platform.isAvailable}
                      className={`flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all group ${
                        !platform.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                    >
                      <div className={`p-2 rounded-lg text-white ${platform.color} group-hover:scale-110 transition-transform`}>
                        {platform.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-green-600 mb-2" />
                    ) : (
                      <Copy className="w-6 h-6 text-gray-600 mb-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {copied ? 'Copied!' : 'Copy Text'}
                    </span>
                  </button>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <QrCode className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">QR Code</span>
                  </button>

                  <button
                    onClick={downloadShareKit}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <Download className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Share Kit</span>
                  </button>

                  <button
                    onClick={() => window.open(appUrl, '_blank')}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
                  >
                    <Eye className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">Preview</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQR && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-600">Scan to visit app</p>
                </div>
              )}
            </div>

            {/* Stats Panel */}
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Total Shares</span>
                    </div>
                    <span className="font-bold text-gray-900">{totalShares}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Total Clicks</span>
                    </div>
                    <span className="font-bold text-gray-900">{totalClicks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Avg. Engagement</span>
                    </div>
                    <span className="font-bold text-gray-900">{avgEngagement.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Platform Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
                <div className="space-y-3">
                  {shareStats.map(stat => {
                    const platform = platforms.find(p => p.id === stat.platform);
                    if (!platform) return null;
                    
                    return (
                      <div key={stat.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded text-white ${platform.color}`}>
                            {platform.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{stat.shares}</p>
                          <p className="text-xs text-gray-600">{stat.clicks} clicks</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              {shareHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shares</h3>
                  <div className="space-y-2">
                    {shareHistory.slice(0, 5).map((share, index) => {
                      const platform = platforms.find(p => p.id === share.platform);
                      if (!platform) return null;
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded text-white ${platform.color}`}>
                              {React.cloneElement(platform.icon as React.ReactElement, { className: 'w-3 h-3' })}
                            </div>
                            <span className="text-gray-700">{platform.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600">{share.clicks} clicks</p>
                            <p className="text-xs text-gray-500">
                              {new Date(share.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">💡 Sharing Tips</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Use relevant hashtags to increase reach</li>
                  <li>• Add personal context to your shares</li>
                  <li>• Share at optimal times for your audience</li>
                  <li>• Engage with comments and feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSharing;