import { useState, useCallback, useEffect } from 'react';

interface VisualEditingState {
  isActive: boolean;
  selectedElement: HTMLElement | null;
  highlightedElement: HTMLElement | null;
}

interface StyleChanges {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export const useVisualEditor = () => {
  const [state, setState] = useState<VisualEditingState>({
    isActive: false,
    selectedElement: null,
    highlightedElement: null
  });

  const [styleHistory, setStyleHistory] = useState<Map<HTMLElement, StyleChanges>>(new Map());

  // Enable/disable visual editing mode
  const toggleVisualEditor = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      selectedElement: null,
      highlightedElement: null
    }));
  }, []);

  // Apply styles to selected element with real-time preview
  const applyStyles = useCallback((element: HTMLElement, styles: StyleChanges) => {
    if (!element) return;

    // Store original styles for undo functionality
    if (!styleHistory.has(element)) {
      const computedStyles = window.getComputedStyle(element);
      const originalStyles: StyleChanges = {
        backgroundColor: computedStyles.backgroundColor,
        color: computedStyles.color,
        fontSize: computedStyles.fontSize,
        fontWeight: computedStyles.fontWeight,
        padding: computedStyles.padding,
        margin: computedStyles.margin,
        borderRadius: computedStyles.borderRadius,
        boxShadow: computedStyles.boxShadow
      };
      setStyleHistory(prev => new Map(prev).set(element, originalStyles));
    }

    // Apply new styles
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        element.style.setProperty(cssProperty, value);
      }
    });
  }, [styleHistory]);

  // Quick style presets for common changes
  const quickStyles = {
    makeBold: (element: HTMLElement) => applyStyles(element, { fontWeight: 'bold' }),
    makeItalic: (element: HTMLElement) => {
      element.style.fontStyle = element.style.fontStyle === 'italic' ? 'normal' : 'italic';
    },
    increaseFontSize: (element: HTMLElement) => {
      const currentSize = parseInt(window.getComputedStyle(element).fontSize);
      applyStyles(element, { fontSize: `${currentSize + 2}px` });
    },
    decreaseFontSize: (element: HTMLElement) => {
      const currentSize = parseInt(window.getComputedStyle(element).fontSize);
      applyStyles(element, { fontSize: `${Math.max(currentSize - 2, 10)}px` });
    },
    addShadow: (element: HTMLElement) => {
      applyStyles(element, { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' });
    },
    removeShadow: (element: HTMLElement) => {
      applyStyles(element, { boxShadow: 'none' });
    },
    roundCorners: (element: HTMLElement) => {
      applyStyles(element, { borderRadius: '8px' });
    },
    addPadding: (element: HTMLElement) => {
      const currentPadding = parseInt(window.getComputedStyle(element).padding) || 0;
      applyStyles(element, { padding: `${currentPadding + 8}px` });
    }
  };

  // Color palette for quick color changes
  const colorPalette = {
    primary: '#f97316', // Orange
    secondary: '#ec4899', // Pink
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#3b82f6', // Blue
    light: '#f8fafc', // Light gray
    dark: '#1f2937' // Dark gray
  };

  // Apply color from palette
  const applyColor = useCallback((element: HTMLElement, color: string, type: 'background' | 'text' = 'background') => {
    if (type === 'background') {
      applyStyles(element, { backgroundColor: color });
    } else {
      applyStyles(element, { color: color });
    }
  }, [applyStyles]);

  // Reset element to original styles
  const resetElement = useCallback((element: HTMLElement) => {
    const originalStyles = styleHistory.get(element);
    if (originalStyles) {
      applyStyles(element, originalStyles);
      setStyleHistory(prev => {
        const newMap = new Map(prev);
        newMap.delete(element);
        return newMap;
      });
    }
  }, [styleHistory, applyStyles]);

  // Reset all changes
  const resetAll = useCallback(() => {
    styleHistory.forEach((originalStyles, element) => {
      applyStyles(element, originalStyles);
    });
    setStyleHistory(new Map());
  }, [styleHistory, applyStyles]);

  // Export styles as CSS
  const exportStyles = useCallback(() => {
    const styles: string[] = [];
    
    styleHistory.forEach((_, element) => {
      const computedStyles = window.getComputedStyle(element);
      const className = element.className || element.tagName.toLowerCase();
      const selector = `.${className.replace(/\s+/g, '.')}`;
      
      const cssRules = [
        `background-color: ${computedStyles.backgroundColor};`,
        `color: ${computedStyles.color};`,
        `font-size: ${computedStyles.fontSize};`,
        `font-weight: ${computedStyles.fontWeight};`,
        `padding: ${computedStyles.padding};`,
        `margin: ${computedStyles.margin};`,
        `border-radius: ${computedStyles.borderRadius};`,
        `box-shadow: ${computedStyles.boxShadow};`
      ].filter(rule => !rule.includes('none') && !rule.includes('rgba(0, 0, 0, 0)'));

      styles.push(`${selector} {\n  ${cssRules.join('\n  ')}\n}`);
    });

    return styles.join('\n\n');
  }, [styleHistory]);

  // Click handler for element selection
  const handleElementClick = useCallback((event: Event) => {
    if (!state.isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target as HTMLElement;
    setState(prev => ({
      ...prev,
      selectedElement: element,
      highlightedElement: null
    }));
  }, [state.isActive]);

  // Mouse over handler for element highlighting
  const handleElementHover = useCallback((event: Event) => {
    if (!state.isActive) return;
    
    const element = event.target as HTMLElement;
    
    // Remove previous highlight
    if (state.highlightedElement) {
      state.highlightedElement.classList.remove('visual-editor-highlight');
    }
    
    // Add highlight to current element
    element.classList.add('visual-editor-highlight');
    setState(prev => ({
      ...prev,
      highlightedElement: element
    }));
  }, [state.isActive, state.highlightedElement]);

  // Mouse leave handler
  const handleElementLeave = useCallback((event: Event) => {
    if (!state.isActive) return;
    
    const element = event.target as HTMLElement;
    element.classList.remove('visual-editor-highlight');
    
    setState(prev => ({
      ...prev,
      highlightedElement: null
    }));
  }, [state.isActive]);

  // Setup event listeners when visual editor is active
  useEffect(() => {
    if (state.isActive) {
      document.addEventListener('click', handleElementClick, true);
      document.addEventListener('mouseover', handleElementHover, true);
      document.addEventListener('mouseleave', handleElementLeave, true);
      
      // Add visual indicator that editing mode is active
      document.body.style.cursor = 'crosshair';
      
      return () => {
        document.removeEventListener('click', handleElementClick, true);
        document.removeEventListener('mouseover', handleElementHover, true);
        document.removeEventListener('mouseleave', handleElementLeave, true);
        document.body.style.cursor = 'default';
        
        // Clean up highlights
        document.querySelectorAll('.visual-editor-highlight').forEach(el => {
          el.classList.remove('visual-editor-highlight');
        });
      };
    }
  }, [state.isActive, handleElementClick, handleElementHover, handleElementLeave]);

  return {
    isActive: state.isActive,
    selectedElement: state.selectedElement,
    toggleVisualEditor,
    applyStyles,
    quickStyles,
    colorPalette,
    applyColor,
    resetElement,
    resetAll,
    exportStyles,
    hasChanges: styleHistory.size > 0
  };
};