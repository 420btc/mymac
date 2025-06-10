import React, { useState, useCallback } from 'react';
import MacWindow from './mac-window';

interface WindowData {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface WindowManagerProps {
  openApps: string[];
  onAppClose: (appId: string) => void;
  apps: Array<{ id: string; name: string; icon: string }>;
}

const WindowManager: React.FC<WindowManagerProps> = ({ openApps, onAppClose, apps }) => {
  const [windows, setWindows] = useState<Record<string, WindowData>>({});
  const [highestZIndex, setHighestZIndex] = useState(1000);

  // Initialize window data when app opens
  const getWindowData = useCallback((appId: string): WindowData => {
    if (windows[appId]) {
      return windows[appId];
    }

    const app = apps.find(a => a.id === appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    // Calculate initial position with some randomness
    const baseX = 100;
    const baseY = 80;
    const offset = Object.keys(windows).length * 30;
    
    const newWindow: WindowData = {
      id: appId,
      title: app.name,
      icon: app.icon,
      isOpen: true,
      isMinimized: false,
      zIndex: highestZIndex + 1,
      position: { 
        x: baseX + offset, 
        y: baseY + offset 
      },
      size: { width: 600, height: 400 }
    };

    setWindows(prev => ({ ...prev, [appId]: newWindow }));
    setHighestZIndex(prev => prev + 1);
    
    return newWindow;
  }, [windows, apps, highestZIndex]);

  const handleWindowClose = useCallback((appId: string) => {
    setWindows(prev => {
      const updated = { ...prev };
      if (updated[appId]) {
        updated[appId] = { ...updated[appId], isOpen: false };
      }
      return updated;
    });
    onAppClose(appId);
  }, [onAppClose]);

  const handleWindowMinimize = useCallback((appId: string) => {
    setWindows(prev => {
      const updated = { ...prev };
      if (updated[appId]) {
        updated[appId] = { ...updated[appId], isMinimized: !updated[appId].isMinimized };
      }
      return updated;
    });
  }, []);

  const handleWindowMaximize = useCallback((appId: string) => {
    // Handle maximize logic if needed
    console.log('Maximize window:', appId);
  }, []);



  return (
    <>
      {openApps.map(appId => {
        const windowData = getWindowData(appId);
        
        return (
          <MacWindow
            key={appId}
            id={windowData.id}
            title={windowData.title}
            icon={windowData.icon}
            isOpen={windowData.isOpen && !windowData.isMinimized}
            onClose={() => handleWindowClose(appId)}
            onMinimize={() => handleWindowMinimize(appId)}
            onMaximize={() => handleWindowMaximize(appId)}
            initialPosition={windowData.position}
            initialSize={windowData.size}
            zIndex={windowData.zIndex}
          >
            {/* Content específico para cada app */}
            {appId === 'finder' && (
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-2 hover:bg-blue-100 rounded cursor-pointer">
                    <div className="w-12 h-12 bg-blue-500 rounded mb-2"></div>
                    <span className="text-xs">Documentos</span>
                  </div>
                  <div className="flex flex-col items-center p-2 hover:bg-blue-100 rounded cursor-pointer">
                    <div className="w-12 h-12 bg-green-500 rounded mb-2"></div>
                    <span className="text-xs">Descargas</span>
                  </div>
                  <div className="flex flex-col items-center p-2 hover:bg-blue-100 rounded cursor-pointer">
                    <div className="w-12 h-12 bg-purple-500 rounded mb-2"></div>
                    <span className="text-xs">Escritorio</span>
                  </div>
                  <div className="flex flex-col items-center p-2 hover:bg-blue-100 rounded cursor-pointer">
                    <div className="w-12 h-12 bg-orange-500 rounded mb-2"></div>
                    <span className="text-xs">Imágenes</span>
                  </div>
                </div>
              </div>
            )}
            
            {appId === 'calculator' && (
              <div className="p-4 bg-gray-100 h-full">
                <div className="bg-black text-white text-right p-4 mb-4 rounded text-2xl font-mono">0</div>
                <div className="grid grid-cols-4 gap-2">
                  {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((btn, i) => (
                    <button key={i} className={`p-3 rounded font-semibold ${
                      ['C', '±', '%'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400' :
                      ['÷', '×', '−', '+', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                      'bg-white hover:bg-gray-50'
                    } ${btn === '0' ? 'col-span-2' : ''}`}>
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {appId === 'terminal' && (
              <div className="bg-black text-green-400 p-4 font-mono text-sm h-full overflow-auto">
                <div>Last login: {new Date().toLocaleString()} on console</div>
                <div className="mt-2">
                  <span className="text-blue-400">user@MacBook-Pro</span>
                  <span className="text-white">:</span>
                  <span className="text-yellow-400">~</span>
                  <span className="text-white">$ </span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            )}
            
            {appId === 'safari' && (
              <div className="h-full flex flex-col">
                <div className="bg-gray-100 p-2 border-b flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <button className="w-6 h-6 rounded bg-gray-300 hover:bg-gray-400">←</button>
                    <button className="w-6 h-6 rounded bg-gray-300 hover:bg-gray-400">→</button>
                  </div>
                  <div className="flex-1 bg-white rounded px-3 py-1 text-sm border">
                    https://www.apple.com
                  </div>
                </div>
                <div className="flex-1 bg-white p-8 text-center">
                  <h1 className="text-4xl font-light mb-4">Safari</h1>
                  <p className="text-gray-600">Navegador web de Apple</p>
                </div>
              </div>
            )}
          </MacWindow>
        );
      })}
    </>
  );
};

export default WindowManager;