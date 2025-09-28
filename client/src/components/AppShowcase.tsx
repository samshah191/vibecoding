import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download, 
  Upload, 
  X, 
  Plus, 
  Edit3, 
  Save, 
  RefreshCw,
  Eye,
  Settings,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface Screenshot {
  id: string;
  url: string;
  device: 'desktop' | 'tablet' | 'mobile';
  title: string;
  description?: string;
  isDefault: boolean;
  timestamp: string;
}

interface AppShowcaseProps {
  appId: string;
  appTitle: string;
  appUrl: string;
  onClose?: () => void;
}

const AppShowcase: React.FC<AppShowcaseProps> = ({ appId, appTitle, appUrl, onClose }) => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState<number | null>(null);
  const [customUrls, setCustomUrls] = useState<string[]>(['']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);

  const deviceDimensions = {
    desktop: { width: 1920, height: 1080, label: 'Desktop (1920x1080)' },
    tablet: { width: 768, height: 1024, label: 'Tablet (768x1024)' },
    mobile: { width: 375, height: 667, label: 'Mobile (375x667)' }
  };

  useEffect(() => {
    loadExistingScreenshots();
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [appId]);

  const loadExistingScreenshots = async () => {
    setLoading(true);
    try {
      // Simulate API call to load existing screenshots
      setTimeout(() => {
        const mockScreenshots: Screenshot[] = [
          {
            id: '1',
            url: '/api/placeholder/1920/1080',
            device: 'desktop',
            title: 'Desktop View - Main Dashboard',
            description: 'Full desktop experience showing all features',
            isDefault: true,
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            url: '/api/placeholder/768/1024',
            device: 'tablet',
            title: 'Tablet View - Navigation',
            description: 'Responsive tablet layout',
            isDefault: false,
            timestamp: new Date().toISOString()
          },
          {
            id: '3',
            url: '/api/placeholder/375/667',
            device: 'mobile',
            title: 'Mobile View - Touch Interface',
            description: 'Mobile-optimized interface',
            isDefault: false,
            timestamp: new Date().toISOString()
          }
        ];
        setScreenshots(mockScreenshots);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load screenshots:', error);
      setLoading(false);
    }
  };

  const captureScreenshot = async () => {
    setLoading(true);
    try {
      // Simulate screenshot capture
      const deviceInfo = deviceDimensions[selectedDevice];
      const newScreenshot: Screenshot = {
        id: Date.now().toString(),
        url: `/api/placeholder/${deviceInfo.width}/${deviceInfo.height}`,
        device: selectedDevice,
        title: `${selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1)} Screenshot`,
        description: `Captured on ${new Date().toLocaleDateString()}`,
        isDefault: screenshots.length === 0,
        timestamp: new Date().toISOString()
      };

      setScreenshots(prev => [...prev, newScreenshot]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      setLoading(false);
    }
  };

  const uploadScreenshot = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newScreenshot: Screenshot = {
            id: Date.now().toString(),
            url: e.target.result as string,
            device: selectedDevice,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: 'Uploaded screenshot',
            isDefault: screenshots.length === 0,
            timestamp: new Date().toISOString()
          };
          setScreenshots(prev => [...prev, newScreenshot]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(shot => shot.id !== id));
    if (currentSlide >= screenshots.length - 1) {
      setCurrentSlide(Math.max(0, screenshots.length - 2));
    }
  };

  const updateScreenshot = (id: string, updates: Partial<Screenshot>) => {
    setScreenshots(prev => 
      prev.map(shot => shot.id === id ? { ...shot, ...updates } : shot)
    );
    setEditingId(null);
  };

  const setAsDefault = (id: string) => {
    setScreenshots(prev => 
      prev.map(shot => ({ ...shot, isDefault: shot.id === id }))
    );
  };

  const startSlideshow = () => {
    setIsSlideshow(true);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % screenshots.length);
    }, 3000);
    setSlideshowInterval(interval);
  };

  const stopSlideshow = () => {
    setIsSlideshow(false);
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      setSlideshowInterval(null);
    }
  };

  const downloadScreenshot = (screenshot: Screenshot) => {
    const link = document.createElement('a');
    link.href = screenshot.url;
    link.download = `${appTitle}-${screenshot.device}-${screenshot.title}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllScreenshots = () => {
    screenshots.forEach((screenshot, index) => {
      setTimeout(() => downloadScreenshot(screenshot), index * 500);
    });
  };

  const generateFromUrls = async () => {
    setLoading(true);
    try {
      for (const url of customUrls.filter(url => url.trim())) {
        // Simulate screenshot generation from URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const deviceInfo = deviceDimensions[selectedDevice];
        const newScreenshot: Screenshot = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: `/api/placeholder/${deviceInfo.width}/${deviceInfo.height}`,
          device: selectedDevice,
          title: `Generated from ${new URL(url).hostname}`,
          description: `Auto-generated screenshot`,
          isDefault: screenshots.length === 0,
          timestamp: new Date().toISOString()
        };
        
        setScreenshots(prev => [...prev, newScreenshot]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to generate screenshots:', error);
      setLoading(false);
    }
  };

  const currentScreenshot = screenshots[currentSlide];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">App Showcase</h2>
                <p className="text-gray-600">{appTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">{screenshots.length} screenshots</span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close showcase"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Capture Tools */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Capture Tools</h3>
                
                {/* Device Selection */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Device Type</label>
                  <div className="grid grid-cols-3 gap-1">
                    {Object.entries(deviceDimensions).map(([device, info]) => (
                      <button
                        key={device}
                        onClick={() => setSelectedDevice(device as any)}
                        className={`p-2 rounded-lg flex flex-col items-center transition-colors ${
                          selectedDevice === device
                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {device === 'desktop' && <Monitor className="w-4 h-4 mb-1" />}
                        {device === 'tablet' && <Tablet className="w-4 h-4 mb-1" />}
                        {device === 'mobile' && <Smartphone className="w-4 h-4 mb-1" />}
                        <span className="text-xs font-medium capitalize">{device}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capture Actions */}
                <div className="space-y-2">
                  <button
                    onClick={captureScreenshot}
                    disabled={loading}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{loading ? 'Capturing...' : 'Capture Screenshot'}</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Screenshot</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={uploadScreenshot}
                    className="hidden"
                    aria-label="Upload screenshot files"
                    title="Upload screenshot files"
                  />
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
                >
                  <span>Advanced Options</span>
                  <Settings className="w-4 h-4" />
                </button>

                {showAdvanced && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Generate from URLs
                      </label>
                      {customUrls.map((url, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...customUrls];
                              newUrls[index] = e.target.value;
                              setCustomUrls(newUrls);
                            }}
                            placeholder="https://example.com"
                            aria-label={`URL ${index + 1}`}
                            title={`URL ${index + 1}`}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          {index === customUrls.length - 1 && (
                            <button
                              onClick={() => setCustomUrls([...customUrls, ''])}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Add another URL"
                              aria-label="Add another URL"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={generateFromUrls}
                        disabled={loading || !customUrls.some(url => url.trim())}
                        className="w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Generate Screenshots
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Screenshot List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Screenshots</h3>
                  {screenshots.length > 0 && (
                    <button
                      onClick={downloadAllScreenshots}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Download All
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {screenshots.map((screenshot, index) => (
                    <div
                      key={screenshot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        currentSlide === index
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentSlide(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={screenshot.url}
                          alt={screenshot.title}
                          className="w-12 h-8 object-cover rounded border"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {screenshot.title}
                            </p>
                            {screenshot.isDefault && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize">
                              {screenshot.device}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(screenshot.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAsDefault(screenshot.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Set as default"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadScreenshot(screenshot);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScreenshot(screenshot.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Preview */}
          <div className="flex-1 flex flex-col">
            {/* Preview Controls */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    title="Previous screenshot"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {currentSlide + 1} of {screenshots.length}
                  </span>
                  
                  <button
                    onClick={() => setCurrentSlide(Math.min(screenshots.length - 1, currentSlide + 1))}
                    disabled={currentSlide === screenshots.length - 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    title="Next screenshot"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {screenshots.length > 1 && (
                    <button
                      onClick={isSlideshow ? stopSlideshow : startSlideshow}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isSlideshow
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-green-100 text-green-700 border border-green-300'
                      }`}
                    >
                      {isSlideshow ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Stop Slideshow</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Slideshow</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => setCurrentSlide(0)}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                    title="Reset to first"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
              {screenshots.length === 0 ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Screenshots Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Capture or upload screenshots to showcase your app
                  </p>
                  <button
                    onClick={captureScreenshot}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take First Screenshot</span>
                  </button>
                </div>
              ) : currentScreenshot ? (
                <div className="max-w-full max-h-full">
                  <img
                    src={currentScreenshot.url}
                    alt={currentScreenshot.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentScreenshot.title}
                    </h3>
                    {currentScreenshot.description && (
                      <p className="text-gray-600 mt-1">{currentScreenshot.description}</p>
                    )}
                    <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{currentScreenshot.device}</span>
                      <span>•</span>
                      <span>{new Date(currentScreenshot.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Screenshot</h3>
              {(() => {
                const screenshot = screenshots.find(s => s.id === editingId);
                if (!screenshot) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={screenshot.title}
                        onChange={(e) => updateScreenshot(editingId, { title: e.target.value })}
                        aria-label="Screenshot title"
                        title="Screenshot title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={screenshot.description || ''}
                        onChange={(e) => updateScreenshot(editingId, { description: e.target.value })}
                        rows={3}
                        aria-label="Screenshot description"
                        title="Screenshot description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateScreenshot(editingId, {})}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppShowcase;