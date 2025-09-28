import React, { useState, useEffect } from 'react';
import { Code, Copy, Check, Settings, Eye, Monitor, Tablet, Smartphone, Maximize, Minimize } from 'lucide-react';

interface EmbedConfig {
  width: string;
  height: string;
  theme: 'light' | 'dark' | 'auto';
  showHeader: boolean;
  showFooter: boolean;
  showControls: boolean;
  borderRadius: string;
  border: boolean;
  responsive: boolean;
  autoplay: boolean;
}

interface AppEmbedGeneratorProps {
  appId: string;
  appTitle: string;
  onClose?: () => void;
}

const AppEmbedGenerator: React.FC<AppEmbedGeneratorProps> = ({ appId, appTitle, onClose }) => {
  const [config, setConfig] = useState<EmbedConfig>({
    width: '800',
    height: '600',
    theme: 'light',
    showHeader: true,
    showFooter: false,
    showControls: true,
    borderRadius: '8',
    border: true,
    responsive: true,
    autoplay: false
  });

  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'iframe' | 'javascript' | 'wordpress'>('iframe');

  useEffect(() => {
    generateEmbedCode();
  }, [config, activeTab]);

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed/${appId}`;
    
    // Build query parameters
    const params = new URLSearchParams({
      theme: config.theme,
      header: config.showHeader.toString(),
      footer: config.showFooter.toString(),
      controls: config.showControls.toString(),
      radius: config.borderRadius,
      border: config.border.toString(),
      autoplay: config.autoplay.toString()
    });

    const fullEmbedUrl = `${embedUrl}?${params.toString()}`;

    switch (activeTab) {
      case 'iframe':
        setEmbedCode(generateIframeCode(fullEmbedUrl));
        break;
      case 'javascript':
        setEmbedCode(generateJavaScriptCode(fullEmbedUrl));
        break;
      case 'wordpress':
        setEmbedCode(generateWordPressCode(fullEmbedUrl));
        break;
    }
  };

  const generateIframeCode = (url: string) => {
    const responsive = config.responsive;
    const width = responsive ? '100%' : `${config.width}px`;
    const height = `${config.height}px`;
    
    const styles = [
      responsive ? 'max-width: 100%' : '',
      config.border ? 'border: 1px solid #e5e7eb' : 'border: none',
      `border-radius: ${config.borderRadius}px`,
      'display: block'
    ].filter(Boolean).join('; ');

    if (responsive) {
      return `<!-- Responsive VibeCoding App Embed -->
<div style="position: relative; width: 100%; height: 0; padding-bottom: ${(parseInt(config.height) / parseInt(config.width)) * 100}%;">
  <iframe 
    src="${url}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; ${styles}"
    frameborder="0"
    allowfullscreen
    title="${appTitle}">
  </iframe>
</div>`;
    } else {
      return `<!-- VibeCoding App Embed -->
<iframe 
  src="${url}"
  width="${config.width}"
  height="${config.height}"
  style="${styles}"
  frameborder="0"
  allowfullscreen
  title="${appTitle}">
</iframe>`;
    }
  };

  const generateJavaScriptCode = (url: string) => {
    return `<!-- VibeCoding App Embed Script -->
<div id="vibecoding-app-${appId}"></div>
<script>
(function() {
  var container = document.getElementById('vibecoding-app-${appId}');
  var iframe = document.createElement('iframe');
  iframe.src = '${url}';
  iframe.width = '${config.responsive ? '100%' : config.width}';
  iframe.height = '${config.height}';
  iframe.style.cssText = '${config.border ? 'border: 1px solid #e5e7eb;' : 'border: none;'} border-radius: ${config.borderRadius}px; display: block; ${config.responsive ? 'max-width: 100%;' : ''}';
  iframe.frameBorder = '0';
  iframe.allowFullscreen = true;
  iframe.title = '${appTitle}';
  container.appendChild(iframe);
})();
</script>`;
  };

  const generateWordPressCode = (url: string) => {
    return `[vibecoding_embed 
  url="${url}" 
  width="${config.width}" 
  height="${config.height}" 
  responsive="${config.responsive}" 
  border="${config.border}"
  radius="${config.borderRadius}"
  title="${appTitle}"]`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: config.responsive ? '100%' : `${config.width}px`, height: `${config.height}px` };
    }
  };

  const previewDimensions = getPreviewDimensions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Embed App</h2>
                <p className="text-gray-600">{appTitle}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close embed generator"
              >
                <span className="text-gray-400 text-xl">&times;</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Settings Panel */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Embed Settings
            </h3>

            <div className="space-y-6">
              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={config.width}
                      onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))}
                      aria-label="Width in pixels"
                      title="Width in pixels"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="300"
                      max="1920"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={config.height}
                      onChange={(e) => setConfig(prev => ({ ...prev, height: e.target.value }))}
                      aria-label="Height in pixels"
                      title="Height in pixels"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="200"
                      max="1080"
                    />
                  </div>
                </div>
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={config.responsive}
                    onChange={(e) => setConfig(prev => ({ ...prev, responsive: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Responsive</span>
                </label>
              </div>

              {/* Appearance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appearance</label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Theme</label>
                    <select
                      value={config.theme}
                      onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
                      aria-label="Select theme"
                      title="Select theme"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Border Radius (px)</label>
                    <input
                      type="number"
                      value={config.borderRadius}
                      onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: e.target.value }))}
                      aria-label="Border radius in pixels"
                      title="Border radius in pixels"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="24"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showHeader}
                      onChange={(e) => setConfig(prev => ({ ...prev, showHeader: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show header</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showFooter}
                      onChange={(e) => setConfig(prev => ({ ...prev, showFooter: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show footer</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.showControls}
                      onChange={(e) => setConfig(prev => ({ ...prev, showControls: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show controls</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.border}
                      onChange={(e) => setConfig(prev => ({ ...prev, border: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show border</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.autoplay}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoplay: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Autoplay</span>
                  </label>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, width: '400', height: '300', responsive: true }))}
                    className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Small
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, width: '800', height: '600', responsive: true }))}
                    className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, width: '1200', height: '800', responsive: true }))}
                    className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Large
                  </button>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, width: '100%', height: '400', responsive: true }))}
                    className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Full Width
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Preview */}
            <div className="flex-1 bg-gray-100 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === 'desktop' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Desktop preview"
                    aria-label="Desktop preview"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === 'tablet' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Tablet preview"
                    aria-label="Tablet preview"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === 'mobile' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Mobile preview"
                    aria-label="Mobile preview"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-full flex items-center justify-center">
                <div 
                  className="bg-white shadow-lg"
                  style={{
                    width: previewDimensions.width,
                    height: previewDimensions.height,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: `${config.borderRadius}px`,
                    border: config.border ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-4"></div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{appTitle}</h4>
                      <p className="text-gray-600 text-sm">Embedded App Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Tabs */}
            <div className="border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab('iframe')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'iframe'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    HTML/iframe
                  </button>
                  <button
                    onClick={() => setActiveTab('javascript')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'javascript'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setActiveTab('wordpress')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === 'wordpress'
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    WordPress
                  </button>
                </div>

                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-gray-900 text-gray-100 overflow-x-auto max-h-64">
                <pre className="text-sm">
                  <code>{embedCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppEmbedGenerator;