import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Type,
  Eye,
  EyeOff,
  Move,
  RotateCcw,
  Save,
  Download,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
  Copy,
  Trash2,
  Plus,
  Minus,
  Square
} from 'lucide-react';

interface VisualEditorProps {
  isOpen: boolean;
  onClose: () => void;
  targetElement?: HTMLElement | null;
}

interface StyleConfig {
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  padding: string;
  margin: string;
  border: string;
  boxShadow: string;
  opacity: number;
}

const VisualEditor: React.FC<VisualEditorProps> = ({ isOpen, onClose, targetElement }) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects'>('colors');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [styles, setStyles] = useState<StyleConfig>({
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '16px',
    fontWeight: '400',
    borderRadius: '8px',
    padding: '16px',
    margin: '0px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    opacity: 1
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });

  // Predefined color palettes
  const colorPalettes = {
    primary: ['#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b'],
    secondary: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'],
    neutral: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af'],
    success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
    accent: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
  };

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
  const fontWeights = ['300', '400', '500', '600', '700', '800', '900'];
  const spacingValues = ['0px', '4px', '8px', '12px', '16px', '20px', '24px', '32px', '48px', '64px'];
  const borderRadiusValues = ['0px', '4px', '8px', '12px', '16px', '24px', '50%'];

  useEffect(() => {
    if (targetElement) {
      const computedStyles = window.getComputedStyle(targetElement);
      setStyles({
        backgroundColor: rgbToHex(computedStyles.backgroundColor) || '#ffffff',
        color: rgbToHex(computedStyles.color) || '#000000',
        fontSize: computedStyles.fontSize || '16px',
        fontWeight: computedStyles.fontWeight || '400',
        borderRadius: computedStyles.borderRadius || '8px',
        padding: computedStyles.padding || '16px',
        margin: computedStyles.margin || '0px',
        border: computedStyles.border || '1px solid #e5e7eb',
        boxShadow: computedStyles.boxShadow || '0 1px 3px rgba(0, 0, 0, 0.1)',
        opacity: parseFloat(computedStyles.opacity) || 1
      });
    }
  }, [targetElement]);

  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const matches = rgb.match(/\d+/g);
    if (!matches) return '#ffffff';
    const [r, g, b] = matches.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const applyStyles = (newStyles: Partial<StyleConfig>) => {
    const updatedStyles = { ...styles, ...newStyles };
    setStyles(updatedStyles);
    
    if (targetElement) {
      Object.entries(newStyles).forEach(([property, value]) => {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        targetElement.style.setProperty(cssProperty, value as string);
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      dragRef.current = {
        isDragging: true,
        startX: e.clientX - position.x,
        startY: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragRef.current.isDragging) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current.isDragging = false;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const resetStyles = () => {
    const defaultStyles = {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: '16px',
      fontWeight: '400',
      borderRadius: '8px',
      padding: '16px',
      margin: '0px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      opacity: 1
    };
    applyStyles(defaultStyles);
  };

  const saveStyles = () => {
    // In a real app, this would save to a backend or local storage
    const styleData = {
      selector: targetElement?.tagName + (targetElement?.className ? `.${targetElement.className.replace(/\s+/g, '.')}` : ''),
      styles: styles
    };
    
    // Create a downloadable CSS file
    const cssContent = `/* Generated by VibeCoding Visual Editor */
${styleData.selector} {
  background-color: ${styles.backgroundColor};
  color: ${styles.color};
  font-size: ${styles.fontSize};
  font-weight: ${styles.fontWeight};
  border-radius: ${styles.borderRadius};
  padding: ${styles.padding};
  margin: ${styles.margin};
  border: ${styles.border};
  box-shadow: ${styles.boxShadow};
  opacity: ${styles.opacity};
}`;

    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visual-editor-styles.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={editorRef}
      className={`fixed bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
        isMinimized ? 'w-64 h-12' : 'w-80 h-96'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-4 border-b border-gray-200 cursor-grab active:cursor-grabbing">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Visual Editor</h3>
          {targetElement && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {targetElement.tagName.toLowerCase()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'colors', icon: Palette, label: 'Colors' },
              { id: 'typography', icon: Type, label: 'Text' },
              { id: 'spacing', icon: Square, label: 'Layout' },
              { id: 'effects', icon: Settings, label: 'Effects' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 h-64 overflow-y-auto">
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={styles.backgroundColor}
                      onChange={(e) => applyStyles({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                      title="Pick background color"
                    />
                    <input
                      type="text"
                      value={styles.backgroundColor}
                      onChange={(e) => applyStyles({ backgroundColor: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#ffffff"
                      title="Background color hex value"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-1 mt-2">
                    {Object.values(colorPalettes).flat().map((color, index) => (
                      <button
                        key={index}
                        onClick={() => applyStyles({ backgroundColor: color })}
                        className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={styles.color}
                      onChange={(e) => applyStyles({ color: e.target.value })}
                      className="w-8 h-8 rounded border border-gray-300"
                      title="Pick text color"
                    />
                    <input
                      type="text"
                      value={styles.color}
                      onChange={(e) => applyStyles({ color: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#000000"
                      title="Text color hex value"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Font Size</label>
                  <select
                    value={styles.fontSize}
                    onChange={(e) => applyStyles({ fontSize: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select font size"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={styles.fontWeight}
                    onChange={(e) => applyStyles({ fontWeight: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select font weight"
                  >
                    {fontWeights.map(weight => (
                      <option key={weight} value={weight}>
                        {weight === '300' ? 'Light' :
                         weight === '400' ? 'Regular' :
                         weight === '500' ? 'Medium' :
                         weight === '600' ? 'Semi Bold' :
                         weight === '700' ? 'Bold' :
                         weight === '800' ? 'Extra Bold' : 'Black'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'spacing' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Padding</label>
                  <select
                    value={styles.padding}
                    onChange={(e) => applyStyles({ padding: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select padding value"
                  >
                    {spacingValues.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Margin</label>
                  <select
                    value={styles.margin}
                    onChange={(e) => applyStyles({ margin: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select margin value"
                  >
                    {spacingValues.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Border Radius</label>
                  <select
                    value={styles.borderRadius}
                    onChange={(e) => applyStyles({ borderRadius: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select border radius value"
                  >
                    {borderRadiusValues.map(value => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Opacity</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={styles.opacity}
                      onChange={(e) => applyStyles({ opacity: parseFloat(e.target.value) })}
                      className="flex-1"
                      title="Adjust opacity"
                    />
                    <span className="text-xs text-gray-600 w-8">{Math.round(styles.opacity * 100)}%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Shadow</label>
                  <select
                    value={styles.boxShadow}
                    onChange={(e) => applyStyles({ boxShadow: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Select shadow style"
                  >
                    <option value="none">None</option>
                    <option value="0 1px 3px rgba(0, 0, 0, 0.1)">Small</option>
                    <option value="0 4px 6px rgba(0, 0, 0, 0.1)">Medium</option>
                    <option value="0 10px 15px rgba(0, 0, 0, 0.1)">Large</option>
                    <option value="0 20px 25px rgba(0, 0, 0, 0.1)">Extra Large</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <button
                onClick={resetStyles}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Reset styles"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(styles, null, 2))}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Copy styles"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={saveStyles}
                className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                title="Save & Download CSS"
              >
                <Download className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VisualEditor;