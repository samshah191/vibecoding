import React from 'react';
import {
  Palette,
  Type,
  Bold,
  Italic,
  Plus,
  Minus,
  Square,
  RotateCcw,
  Download,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { useVisualEditor } from '../hooks/useVisualEditor';

const VisualEditorToolbar: React.FC = () => {
  const {
    isActive,
    selectedElement,
    toggleVisualEditor,
    quickStyles,
    colorPalette,
    applyColor,
    applyStyles,
    resetElement,
    resetAll,
    exportStyles,
    hasChanges
  } = useVisualEditor();

  const handleExportStyles = () => {
    const cssStyles = exportStyles();
    if (cssStyles) {
      const blob = new Blob([cssStyles], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visual-editor-styles.css';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isActive && !hasChanges) {
    return (
      <button
        onClick={toggleVisualEditor}
        className="fixed bottom-6 left-6 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors z-40 flex items-center space-x-2"
        title="Enable Visual Editor"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden sm:inline">Visual Edit</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Visual Editor</h3>
          {selectedElement && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {selectedElement.tagName.toLowerCase()}
            </span>
          )}
        </div>
        <button
          onClick={toggleVisualEditor}
          className="p-1 hover:bg-gray-100 rounded"
          title="Close Visual Editor"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isActive && !selectedElement && (
        <div className="text-center py-4 text-gray-500">
          <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click any element to start editing</p>
        </div>
      )}

      {selectedElement && (
        <div className="space-y-4">
          {/* Quick Style Actions */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Quick Actions</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => quickStyles.makeBold(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Make Bold"
              >
                <Bold className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => quickStyles.makeItalic(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Make Italic"
              >
                <Italic className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => quickStyles.addShadow(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Add Shadow"
              >
                <Square className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => quickStyles.roundCorners(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Round Corners"
              >
                <div className="w-4 h-4 mx-auto border border-gray-400 rounded"></div>
              </button>
            </div>
          </div>

          {/* Font Size Controls */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Font Size</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => quickStyles.decreaseFontSize(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Decrease Font Size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 px-2">
                {window.getComputedStyle(selectedElement).fontSize}
              </span>
              <button
                onClick={() => quickStyles.increaseFontSize(selectedElement)}
                className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Increase Font Size"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Background Colors</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(colorPalette).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => applyColor(selectedElement, color, 'background')}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={`Apply ${name} background`}
                />
              ))}
            </div>
          </div>

          {/* Text Colors */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Text Colors</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(colorPalette).map(([name, color]) => (
                <button
                  key={name}
                  onClick={() => applyColor(selectedElement, color, 'text')}
                  className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ color: color }}
                  title={`Apply ${name} text color`}
                >
                  <Type className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Spacing Controls */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Spacing</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickStyles.addPadding(selectedElement)}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Add Padding"
              >
                + Padding
              </button>
              <button
                onClick={() => applyStyles(selectedElement, { margin: '16px' })}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Add Margin"
              >
                + Margin
              </button>
            </div>
          </div>

          {/* Element Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => resetElement(selectedElement)}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Element"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Actions */}
      {hasChanges && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={resetAll}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset All Changes"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
            <button
              onClick={handleExportStyles}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
              title="Download CSS"
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualEditorToolbar;