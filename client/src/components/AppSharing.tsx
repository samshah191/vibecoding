import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, QrCode, Mail, MessageCircle, ExternalLink } from 'lucide-react';

interface SharedApp {
  id: string;
  title: string;
  description: string;
  author: string;
  shareId: string;
  shareUrl: string;
  isPublic: boolean;
  createdAt: string;
  expiresAt?: string;
  views: number;
  lastViewed?: string;
}

interface AppSharingProps {
  appId: string;
  appTitle: string;
  onClose?: () => void;
}

const AppSharing: React.FC<AppSharingProps> = ({ appId, appTitle, onClose }) => {
  const [shareData, setShareData] = useState<SharedApp | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    isPublic: true,
    hasExpiry: false,
    expiryDays: 30,
    requireAuth: false
  });

  useEffect(() => {
    loadExistingShare();
  }, [appId]);

  const loadExistingShare = async () => {
    setLoading(true);
    try {
      // Simulate API call to check if app is already shared
      setTimeout(() => {
        const existingShare: SharedApp = {
          id: appId,
          title: appTitle,
          description: 'Shared app created with VibeCoding',
          author: 'Current User',
          shareId: generateShareId(),
          shareUrl: `${window.location.origin}/shared/${generateShareId()}`,
          isPublic: true,
          createdAt: new Date().toISOString(),
          views: 0
        };
        setShareData(existingShare);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load share data:', error);
      setLoading(false);
    }
  };

  const generateShareId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createOrUpdateShare = async () => {
    setLoading(true);
    try {
      // Simulate API call to create/update share
      const newShareId = generateShareId();
      const shareUrl = `${window.location.origin}/shared/${newShareId}`;
      
      const updatedShare: SharedApp = {
        id: appId,
        title: appTitle,
        description: 'Shared app created with VibeCoding',
        author: 'Current User',
        shareId: newShareId,
        shareUrl: shareUrl,
        isPublic: shareSettings.isPublic,
        createdAt: new Date().toISOString(),
        expiresAt: shareSettings.hasExpiry 
          ? new Date(Date.now() + shareSettings.expiryDays * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        views: shareData?.views || 0
      };

      setTimeout(() => {
        setShareData(updatedShare);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to create share:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this app: ${appTitle}`);
    const body = encodeURIComponent(
      `Hi,

I wanted to share this amazing app I created with VibeCoding:

${appTitle}

You can view it here: ${shareData?.shareUrl}

Best regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`Check out this app I created: ${appTitle}\n${shareData?.shareUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const openInNewTab = () => {
    if (shareData?.shareUrl) {
      window.open(shareData.shareUrl, '_blank');
    }
  };

  const generateQRCode = () => {
    // In a real implementation, you would use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData?.shareUrl || '')}`;
  };

  if (loading && !shareData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Share App</h2>
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

        <div className="p-6 space-y-6">
          {/* Share Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Share Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareSettings.isPublic}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Make app publicly discoverable in gallery</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareSettings.hasExpiry}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, hasExpiry: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Set expiry date</span>
              </label>

              {shareSettings.hasExpiry && (
                <div className="ml-6">
                  <label className="block text-sm text-gray-700 mb-1">Expires in:</label>
                  <select
                    value={shareSettings.expiryDays}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                    aria-label="Select expiry duration"
                    title="Select expiry duration"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
              )}

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={shareSettings.requireAuth}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, requireAuth: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Require authentication to view</span>
              </label>
            </div>

            <button
              onClick={createOrUpdateShare}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update Share Settings'}
            </button>
          </div>

          {/* Share URL */}
          {shareData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Share Link</h3>
              
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                <input
                  type="text"
                  value={shareData.shareUrl}
                  readOnly
                  aria-label="Share URL"
                  title="Share URL - Read only"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700"
                />
                <button
                  onClick={() => copyToClipboard(shareData.shareUrl)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copy link"
                  aria-label="Copy share link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Show QR Code"
                  aria-label="Show QR code"
                >
                  <QrCode className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={openInNewTab}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Open in new tab"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {copied && (
                <p className="text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Link copied to clipboard!
                </p>
              )}

              {/* QR Code */}
              {showQR && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <img
                    src={generateQRCode()}
                    alt="QR Code"
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-600">Scan to share</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Share Options */}
          {shareData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Share</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaEmail}
                  className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Email</span>
                </button>
                
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* Share Statistics */}
          {shareData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Share Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-blue-900">{shareData.views}</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Shared On</p>
                  <p className="text-sm text-green-900">
                    {new Date(shareData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {shareData.expiresAt && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Expires On</p>
                  <p className="text-sm text-yellow-900">
                    {new Date(shareData.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Share your app with the world and get feedback from the community.
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSharing;