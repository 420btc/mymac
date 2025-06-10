import React, { useState, useCallback, useEffect, useRef } from 'react';
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

  const prevOpenAppsRef = useRef<string[]>([]);

  // Handle dock click actions
  useEffect(() => {
    const newApps = openApps.filter(appId => !prevOpenAppsRef.current.includes(appId));
    const reClickedApps = openApps.filter(appId => 
      prevOpenAppsRef.current.includes(appId) && windows[appId]?.isMinimized
    );
    
    // Handle newly opened apps
    newApps.forEach(appId => {
      if (windows[appId] && !windows[appId].isOpen) {
        setWindows(prev => ({
          ...prev,
          [appId]: {
            ...prev[appId],
            isOpen: true,
            isMinimized: false,
            zIndex: prev[appId].zIndex
          }
        }));
      }
    });
    
    // Handle re-clicked minimized apps
    reClickedApps.forEach(appId => {
      setWindows(prev => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          isMinimized: false
        }
      }));
    });
    
    prevOpenAppsRef.current = openApps;
  }, [openApps]);

  // Initialize window data when app opens
  const getWindowData = useCallback((appId: string): WindowData => {
    if (windows[appId]) {
      return windows[appId];
    }

    const app = apps.find(a => a.id === appId);
    if (!app) {
      throw new Error(`App with id ${appId} not found`);
    }

    // Calculate initial position centered within Mac screen area
    const windowWidth = 800;
    const windowHeight = 600;
    // Mac screen area is 520px wide, 360px tall, but scaled by 0.45
    // So effective area is 520/0.45 = ~1155px wide, 360/0.45 = ~800px tall
    const macScreenWidth = 520 / 0.45;
    const macScreenHeight = 360 / 0.45;
    
    // Position the window in the upper area of the Mac screen
    const baseX = Math.max(50, (macScreenWidth - windowWidth) / 2);
    const baseY = Math.max(50, (macScreenHeight - windowHeight) / 2 - 300);
    const offset = Object.keys(windows).length * 30; // Smaller offset for better stacking
    
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
      size: { width: windowWidth, height: windowHeight }
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
              <div className="h-full flex">
                {/* Sidebar */}
                <div className="w-48 bg-gray-50 border-r p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Favoritos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Documentos</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Descargas</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm">Escritorio</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-sm">Imágenes</span>
                    </div>
                  </div>
                </div>
                {/* Main content */}
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-6 gap-4">
                    {Array.from({length: 18}, (_, i) => (
                      <div key={i} className="flex flex-col items-center p-3 hover:bg-blue-100 rounded cursor-pointer">
                        <div className={`w-16 h-16 rounded mb-2 ${
                          ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][i % 6]
                        }`}></div>
                        <span className="text-xs text-center">Archivo {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {appId === 'calculator' && (
              <div className="p-8 bg-gray-100 h-full flex flex-col">
                <div className="bg-black text-white text-right p-6 mb-6 rounded text-4xl font-mono min-h-[80px] flex items-center justify-end">
                  0
                </div>
                <div className="grid grid-cols-4 gap-3 flex-1">
                  {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map((btn, i) => (
                    <button key={i} className={`rounded-lg font-semibold text-xl transition-all duration-150 hover:scale-105 ${
                      ['C', '±', '%'].includes(btn) ? 'bg-gray-300 hover:bg-gray-400 text-black' :
                      ['÷', '×', '−', '+', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' :
                      'bg-white hover:bg-gray-50 text-black shadow-md'
                    } ${btn === '0' ? 'col-span-2' : ''} ${btn === '=' ? 'row-span-2' : ''}`}>
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {appId === 'terminal' && (
              <div className="bg-black text-green-400 p-6 font-mono text-sm h-full overflow-auto">
                <div className="text-gray-400">Last login: {new Date().toLocaleString()} on ttys000</div>
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-blue-400">user@MacBook-Pro</span>
                    <span className="text-white">:</span>
                    <span className="text-yellow-400">~</span>
                    <span className="text-white">$ </span>
                    <span className="text-green-400">ls -la</span>
                  </div>
                  <div className="text-gray-300 mb-2">
                    <div>total 64</div>
                    <div>drwxr-xr-x  12 user  staff   384 Dec 15 10:30 .</div>
                    <div>drwxr-xr-x   6 root  admin   192 Dec 10 09:15 ..</div>
                    <div>-rw-r--r--   1 user  staff  1024 Dec 14 16:45 .bash_profile</div>
                    <div>-rw-r--r--   1 user  staff   256 Dec 12 11:20 .gitconfig</div>
                    <div>drwxr-xr-x   8 user  staff   256 Dec 15 09:30 Desktop</div>
                    <div>drwxr-xr-x  15 user  staff   480 Dec 14 18:22 Documents</div>
                    <div>drwxr-xr-x  12 user  staff   384 Dec 15 08:45 Downloads</div>
                    <div>drwxr-xr-x   4 user  staff   128 Dec 13 14:10 Pictures</div>
                  </div>
                  <div className="mb-2">
                    <span className="text-blue-400">user@MacBook-Pro</span>
                    <span className="text-white">:</span>
                    <span className="text-yellow-400">~</span>
                    <span className="text-white">$ </span>
                    <span className="text-green-400">pwd</span>
                  </div>
                  <div className="text-gray-300 mb-2">/Users/user</div>
                  <div className="mb-2">
                    <span className="text-blue-400">user@MacBook-Pro</span>
                    <span className="text-white">:</span>
                    <span className="text-yellow-400">~</span>
                    <span className="text-white">$ </span>
                    <span className="text-green-400">echo &quot;Hola desde la Terminal!&quot;</span>
                  </div>
                  <div className="text-gray-300 mb-4">Hola desde la Terminal!</div>
                  <div>
                    <span className="text-blue-400">user@MacBook-Pro</span>
                    <span className="text-white">:</span>
                    <span className="text-yellow-400">~</span>
                    <span className="text-white">$ </span>
                    <span className="animate-pulse bg-green-400 text-black px-1">_</span>
                  </div>
                </div>
              </div>
            )}
            
            {appId === 'safari' && (
              <div className="h-full flex flex-col">
                <div className="bg-gray-100 p-3 border-b flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600">←</button>
                    <button className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600">→</button>
                    <button className="w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600">↻</button>
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-4 py-2 text-sm border shadow-sm">
                    🔒 https://www.apple.com
                  </div>
                  <button className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center">+</button>
                </div>
                <div className="flex-1 bg-white overflow-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-12 text-center">
                    <h1 className="text-6xl font-light mb-4">Apple</h1>
                    <p className="text-xl opacity-90">Think Different</p>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                      <div className="grid grid-cols-3 gap-8 mb-12">
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                          <h3 className="text-lg font-semibold mb-2">iPhone 15 Pro</h3>
                          <p className="text-gray-600">Titanio. Tan resistente. Tan ligero. Tan Pro.</p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                          <h3 className="text-lg font-semibold mb-2">MacBook Pro</h3>
                          <p className="text-gray-600">Supercargado por M3, M3 Pro y M3 Max.</p>
                        </div>
                        <div className="text-center p-6 bg-gray-50 rounded-xl">
                          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                          <h3 className="text-lg font-semibold mb-2">Apple Watch</h3>
                          <p className="text-gray-600">Tu compañero de salud y fitness más avanzado.</p>
                        </div>
                      </div>
                    </div>
                  </div>
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