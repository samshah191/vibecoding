import React, { useState, useRef, useEffect } from 'react';
import {
  Move,
  Square,
  Type,
  Image,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Download,
  Upload,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  RotateCcw,
  Grid,
  Ruler,
  SmartphoneNfc,
  MonitorSpeaker,
  TabletSmartphone
} from 'lucide-react';

interface BreakpointData {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface Component {
  id: string;
  type: 'container' | 'text' | 'image' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  styles: React.CSSProperties;
  breakpoints?: {
    mobile?: BreakpointData;
    tablet?: BreakpointData;
  };
}

const VisualLayoutEditor: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([
    {
      id: '1',
      type: 'container',
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      content: 'Header Container',
      styles: {
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }
    },
    {
      id: '2',
      type: 'text',
      x: 70,
      y: 70,
      width: 200,
      height: 30,
      content: 'Welcome to our app',
      styles: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1f2937'
      }
    }
  ]);
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGrid, setShowGrid] = useState(true);
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [activeBreakpoint, setActiveBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showRulers, setShowRulers] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const selectedComp = components.find(c => c.id === selectedComponent);
  
  // Get current component properties based on active breakpoint
  const getCurrentComponentProps = (component: Component) => {
    if (activeBreakpoint === 'desktop') {
      return component;
    }
    
    const breakpointData = component.breakpoints?.[activeBreakpoint];
    if (breakpointData) {
      return {
        ...component,
        ...breakpointData
      };
    }
    
    // Fallback to desktop if no breakpoint data
    return component;
  };
  
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const component = components.find(c => c.id === id);
    if (!component) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragging({
      id,
      offsetX: e.clientX - rect.left - component.x,
      offsetY: e.clientY - rect.top - component.y
    });
    setSelectedComponent(id);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;
    
    setComponents(prev => 
      prev.map(comp => 
        comp.id === dragging.id 
          ? { ...comp, x: Math.max(0, x), y: Math.max(0, y) } 
          : comp
      )
    );
  };
  
  const handleMouseUp = () => {
    setDragging(null);
  };
  
  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: `${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 150 : type === 'button' ? 120 : 200,
      height: type === 'text' ? 30 : type === 'button' ? 40 : 150,
      content: type === 'text' ? 'New Text' : 
               type === 'button' ? 'Click Me' : 
               type === 'image' ? 'Image' : 'Container',
      styles: type === 'text' ? { 
        fontSize: '16px', 
        color: '#000' 
      } : type === 'button' ? {
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      } : type === 'image' ? {
        backgroundColor: '#e5e7eb',
        border: '1px dashed #9ca3af'
      } : {
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '4px'
      }
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };
  
  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  };
  
  const deleteComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };
  
  const getDeviceDimensions = () => {
    switch (devicePreview) {
      case 'mobile': return { width: 375, height: 667 };
      case 'tablet': return { width: 768, height: 1024 };
      default: return { width: 1200, height: 800 };
    }
  };
  
  const { width, height } = getDeviceDimensions();
  
  // Set active breakpoint when device preview changes
  useEffect(() => {
    setActiveBreakpoint(devicePreview);
  }, [devicePreview]);
  
  // Helper function to safely update breakpoint data
  const updateBreakpointData = (id: string, breakpoint: 'mobile' | 'tablet', data: Partial<BreakpointData>) => {
    setComponents(prev => 
      prev.map(comp => {
        if (comp.id === id) {
          const currentBreakpoints = comp.breakpoints || {};
          const currentBreakpointData = currentBreakpoints[breakpoint] || {};
          return {
            ...comp,
            breakpoints: {
              ...currentBreakpoints,
              [breakpoint]: {
                ...currentBreakpointData,
                ...data
              }
            }
          };
        }
        return comp;
      })
    );
  };
  
  return (
    <div className="flex h-full bg-gray-50">
      {/* Toolbox */}
      {toolboxOpen && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Components</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              <button
                onClick={() => addComponent('container')}
                className="w-full flex items-center p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <Square className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Container</div>
                  <div className="text-xs text-gray-500">Layout container</div>
                </div>
              </button>
              
              <button
                onClick={() => addComponent('text')}
                className="w-full flex items-center p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <Type className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Text</div>
                  <div className="text-xs text-gray-500">Text element</div>
                </div>
              </button>
              
              <button
                onClick={() => addComponent('button')}
                className="w-full flex items-center p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <Square className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Button</div>
                  <div className="text-xs text-gray-500">Interactive button</div>
                </div>
              </button>
              
              <button
                onClick={() => addComponent('image')}
                className="w-full flex items-center p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                <Image className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Image</div>
                  <div className="text-xs text-gray-500">Image placeholder</div>
                </div>
              </button>
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Layers</h3>
              <div className="space-y-1">
                {components.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComponent(comp.id)}
                    className={`flex items-center p-2 rounded cursor-pointer ${
                      selectedComponent === comp.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      {comp.type === 'container' && <Square className="w-3 h-3" />}
                      {comp.type === 'text' && <Type className="w-3 h-3" />}
                      {comp.type === 'button' && <Square className="w-3 h-3" />}
                      {comp.type === 'image' && <Image className="w-3 h-3" />}
                    </div>
                    <span className="text-sm truncate">{comp.content}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setToolboxOpen(!toolboxOpen)}
              className="p-2 rounded hover:bg-gray-100"
              title={toolboxOpen ? "Close toolbox" : "Open toolbox"}
            >
              <Move className="w-4 h-4" />
            </button>
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            {/* Device Preview Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-2 rounded ${devicePreview === 'desktop' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Desktop preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-2 rounded ${devicePreview === 'tablet' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Tablet preview"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-2 rounded ${devicePreview === 'mobile' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Mobile preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            {/* Breakpoint Controls */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 mr-2">Breakpoints:</span>
              <button
                onClick={() => setActiveBreakpoint('desktop')}
                className={`p-2 rounded text-xs flex items-center ${activeBreakpoint === 'desktop' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                title="Desktop breakpoint"
              >
                <MonitorSpeaker className="w-3 h-3 mr-1" />
                Desktop
              </button>
              <button
                onClick={() => setActiveBreakpoint('tablet')}
                className={`p-2 rounded text-xs flex items-center ${activeBreakpoint === 'tablet' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                title="Tablet breakpoint"
              >
                <TabletSmartphone className="w-3 h-3 mr-1" />
                Tablet
              </button>
              <button
                onClick={() => setActiveBreakpoint('mobile')}
                className={`p-2 rounded text-xs flex items-center ${activeBreakpoint === 'mobile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                title="Mobile breakpoint"
              >
                <SmartphoneNfc className="w-3 h-3 mr-1" />
                Mobile
              </button>
            </div>
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title={showGrid ? "Hide grid" : "Show grid"}
            >
              {showGrid ? <Grid className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowRulers(!showRulers)}
              className={`p-2 rounded ${showRulers ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title={showRulers ? "Hide rulers" : "Show rulers"}
            >
              <Ruler className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center">
              <Upload className="w-4 h-4 mr-1" />
              Import
            </button>
            <button className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-gray-100 relative">
          {/* Rulers */}
          {showRulers && (
            <>
              {/* Horizontal ruler */}
              <div className="absolute top-0 left-0 w-full h-6 bg-white border-b border-gray-200 flex items-center" style={{ paddingLeft: '50px' }}>
                {Array.from({ length: Math.ceil(width / 50) }).map((_, i) => (
                  <div key={i} className="h-full flex items-end" style={{ width: '50px' }}>
                    <div className="text-[10px] text-gray-500 transform -translate-x-1/2">{i * 50}</div>
                  </div>
                ))}
              </div>
              
              {/* Vertical ruler */}
              <div className="absolute top-0 left-0 h-full w-12 bg-white border-r border-gray-200" style={{ paddingTop: '50px' }}>
                {Array.from({ length: Math.ceil(height / 50) }).map((_, i) => (
                  <div key={i} className="w-full flex justify-end pr-1" style={{ height: '50px' }}>
                    <div className="text-[10px] text-gray-500 transform -translate-y-1/2">{i * 50}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div 
            ref={canvasRef}
            className="relative bg-white shadow-lg mt-6 ml-12"
            style={{ 
              width: `${width}px`, 
              height: `${height}px`,
              backgroundImage: showGrid 
                ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)' 
                : 'none',
              backgroundSize: showGrid ? '20px 20px' : '0'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedComponent(null)}
          >
            {components.map((comp) => {
              const currentProps = getCurrentComponentProps(comp);
              return (
                <div
                  key={comp.id}
                  className={`absolute cursor-move ${selectedComponent === comp.id ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: `${currentProps.x}px`,
                    top: `${currentProps.y}px`,
                    width: `${currentProps.width}px`,
                    height: `${currentProps.height}px`,
                    ...currentProps.styles
                  }}
                  onMouseDown={(e) => handleMouseDown(e, comp.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComponent(comp.id);
                  }}
                >
                  {comp.type === 'text' && (
                    <div className="w-full h-full flex items-center p-2" style={comp.styles}>
                      {comp.content}
                    </div>
                  )}
                  
                  {comp.type === 'button' && (
                    <button 
                      className="w-full h-full px-4 py-2"
                      style={comp.styles}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {comp.content}
                    </button>
                  )}
                  
                  {comp.type === 'image' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {selectedComponent === comp.id && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
                      <Trash2 
                        className="w-3 h-3 text-white" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComponent(comp.id);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          {selectedComp && (
            <div className="mt-2 flex space-x-1">
              <button
                onClick={() => setActiveBreakpoint('desktop')}
                className={`px-2 py-1 text-xs rounded ${activeBreakpoint === 'desktop' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Desktop
              </button>
              <button
                onClick={() => setActiveBreakpoint('tablet')}
                className={`px-2 py-1 text-xs rounded ${activeBreakpoint === 'tablet' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Tablet
              </button>
              <button
                onClick={() => setActiveBreakpoint('mobile')}
                className={`px-2 py-1 text-xs rounded ${activeBreakpoint === 'mobile' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Mobile
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {selectedComp ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="component-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <input
                  id="component-content"
                  type="text"
                  value={selectedComp.content}
                  onChange={(e) => updateComponent(selectedComp.id, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="component-width" className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <input
                    id="component-width"
                    type="number"
                    value={getCurrentComponentProps(selectedComp).width}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (activeBreakpoint === 'desktop') {
                        updateComponent(selectedComp.id, { width: value });
                      } else {
                        updateBreakpointData(selectedComp.id, activeBreakpoint, { width: value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="component-height" className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                  <input
                    id="component-height"
                    type="number"
                    value={getCurrentComponentProps(selectedComp).height}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (activeBreakpoint === 'desktop') {
                        updateComponent(selectedComp.id, { height: value });
                      } else {
                        updateBreakpointData(selectedComp.id, activeBreakpoint, { height: value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="component-x" className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
                  <input
                    id="component-x"
                    type="number"
                    value={getCurrentComponentProps(selectedComp).x}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (activeBreakpoint === 'desktop') {
                        updateComponent(selectedComp.id, { x: value });
                      } else {
                        updateBreakpointData(selectedComp.id, activeBreakpoint, { x: value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="component-y" className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
                  <input
                    id="component-y"
                    type="number"
                    value={getCurrentComponentProps(selectedComp).y}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (activeBreakpoint === 'desktop') {
                        updateComponent(selectedComp.id, { y: value });
                      } else {
                        updateBreakpointData(selectedComp.id, activeBreakpoint, { y: value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="background-color" className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <div className="flex items-center">
                  <input
                    id="background-color"
                    type="color"
                    value={selectedComp.styles.backgroundColor as string || '#ffffff'}
                    onChange={(e) => updateComponent(selectedComp.id, { 
                      styles: { ...selectedComp.styles, backgroundColor: e.target.value } 
                    })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    id="background-color-value"
                    type="text"
                    value={selectedComp.styles.backgroundColor as string || ''}
                    onChange={(e) => updateComponent(selectedComp.id, { 
                      styles: { ...selectedComp.styles, backgroundColor: e.target.value } 
                    })}
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              
              {selectedComp.type === 'text' && (
                <>
                  <div>
                    <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input
                      id="font-size"
                      type="number"
                      value={parseInt(selectedComp.styles.fontSize as string || '16')}
                      onChange={(e) => updateComponent(selectedComp.id, { 
                        styles: { ...selectedComp.styles, fontSize: `${e.target.value}px` } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex items-center">
                      <input
                        id="text-color"
                        type="color"
                        value={selectedComp.styles.color as string || '#000000'}
                        onChange={(e) => updateComponent(selectedComp.id, { 
                          styles: { ...selectedComp.styles, color: e.target.value } 
                        })}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        id="text-color-value"
                        type="text"
                        value={selectedComp.styles.color as string || ''}
                        onChange={(e) => updateComponent(selectedComp.id, { 
                          styles: { ...selectedComp.styles, color: e.target.value } 
                        })}
                        className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => deleteComponent(selectedComp.id)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
                <button
                  onClick={() => {
                    const newComp = {...selectedComp, id: `${Date.now()}`, x: selectedComp.x + 20, y: selectedComp.y + 20};
                    setComponents([...components, newComp]);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 inline mr-1" />
                  Duplicate
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a component to edit its properties</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button className="w-full py-2 px-4 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            Generate Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualLayoutEditor;