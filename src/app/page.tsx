'use client';

import React, { useState } from 'react';
import MacOSDock from '../components/mac-os-dock';
import { Mac } from '../components/ui/mac';
import WindowManager from '../components/window-manager';

// Sample app data with actual macOS-style icons
const sampleApps = [
  {
    id: 'finder',
    name: 'Finder',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/calculator-2021-04-29.png?rf=1024'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/terminal-2021-06-03.png?rf=1024'
  },
  {
    id: 'mail',
    name: 'Mail',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/mail-2021-05-25.png?rf=1024'
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/notes-2021-05-25.png?rf=1024'
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/safari-2021-06-02.png?rf=1024'
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/photos-2021-05-28.png?rf=1024'
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/music-2021-05-25.png?rf=1024'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: 'https://cdn.jim-nielsen.com/macos/1024/calendar-2021-04-29.png?rf=1024'
  },
];

const DockDemo: React.FC = () => {
  const [openApps, setOpenApps] = useState<string[]>([]);

  const handleAppClick = (appId: string) => {
    console.log('App clicked:', appId);
    
    // Add app to openApps if not already open
    setOpenApps(prev => 
      prev.includes(appId) 
        ? prev // Don't add if already open, just bring to front
        : [...prev, appId]
    );
  };

  const handleAppClose = (appId: string) => {
    setOpenApps(prev => prev.filter(id => id !== appId));
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      position: 'relative'
    }}>
      {/* Mac Container with 180% scale */}
      <div style={{
         position: 'relative',
         transform: 'scale(1.8)',
         transformOrigin: 'center center'
       }}>
        {/* Mac SVG Background */}
        <Mac 
          width={600} 
          height={500}
          src="/diseño1.png"
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
          }}
        />
        
        {/* Windows inside Mac screen */}
        <div style={{
          position: 'absolute',
          top: '60px', // Start from top of Mac screen
          left: '60px', // Left margin of Mac screen
          width: '480px', // Width of Mac screen area
          height: '300px', // Height of Mac screen area
          overflow: 'hidden',
          transform: 'scale(0.6)', // Scale down windows to fit
          transformOrigin: 'top left'
        }}>
          <WindowManager
            openApps={openApps}
            onAppClose={handleAppClose}
            apps={sampleApps}
          />
        </div>
        
        {/* Dock positioned inside the Mac screen */}
        <div style={{
          position: 'absolute',
          bottom: '175px', // Position dock inside the Mac screen area
          left: '50%',
          transform: 'translateX(-50%) scale(0.48)', // Scale down dock to fit inside Mac screen
          transformOrigin: 'center bottom',
          zIndex: 10
        }}>
          <MacOSDock
            apps={sampleApps}
            onAppClick={handleAppClick}
            openApps={openApps}
          />
        </div>
      </div>
    </div>
  );
};

export default DockDemo;
