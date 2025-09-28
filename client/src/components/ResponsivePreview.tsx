import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Eye } from 'lucide-react';

interface ResponsivePreviewProps {
  children: React.ReactNode;
  className?: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({ children, className = '' }) => {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const devices = {
    mobile: {
      name: 'Mobile',
      icon: Smartphone,
      width: '375px',
      height: '667px',
      description: 'iPhone SE / 8'
    },
    tablet: {
      name: 'Tablet',
      icon: Tablet,
      width: '768px',
      height: '1024px',
      description: 'iPad'
    },
    desktop: {
      name: 'Desktop',
      icon: Monitor,
      width: '100%',
      height: '100%',
      description: '1920x1080'
    }
  };

  const getDeviceClasses = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-3xl mx-auto';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 h-5/6 flex flex-col">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Responsive Preview</h3>
              <div className="flex items-center space-x-2">
                {Object.entries(devices).map(([key, device]) => {
                  const IconComponent = device.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setCurrentDevice(key as DeviceType)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentDevice === key
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title={device.description}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{device.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {devices[currentDevice].width} × {devices[currentDevice].height}
              </span>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 bg-gray-50 overflow-auto">
            <div 
              className={`bg-white rounded-lg shadow-lg mx-auto transition-all duration-300 ${
                currentDevice === 'desktop' ? 'w-full h-full' : ''
              }`}
              style={{
                width: currentDevice !== 'desktop' ? devices[currentDevice].width : undefined,
                height: currentDevice !== 'desktop' ? devices[currentDevice].height : undefined,
                maxWidth: '100%'
              }}
            >
              <div className={`h-full overflow-auto ${getDeviceClasses(currentDevice)}`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {children}
      
      {/* Responsive Preview Toggle */}
      <button
        onClick={() => setIsPreviewMode(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-40"
        title="Preview on different devices"
      >
        <Eye className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ResponsivePreview;