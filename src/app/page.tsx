'use client';

import React, { useState } from 'react';
import MacOSDock from '../components/mac-os-dock';
import { Mac } from '../components/ui/mac';

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
  const [openApps, setOpenApps] = useState<string[]>(['finder', 'safari']);

  const handleAppClick = (appId: string) => {
    console.log('App clicked:', appId);
    
    // Toggle app in openApps array
    setOpenApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      {/* Mac Container with 150% scale */}
      <div style={{
         position: 'relative',
         transform: 'scale(1.5)',
         transformOrigin: 'center center'
       }}>
        {/* Mac SVG Background */}
        <Mac 
          width={600} 
          height={500}
          style={{
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
          }}
        />
        
        {/* Dock positioned at the bottom of the Mac screen */}
        <div style={{
          position: 'absolute',
          bottom: '120px', // Adjusted to position dock at bottom of Mac screen
          left: '50%',
          transform: 'translateX(-50%) scale(0.8)', // Scale down dock to fit Mac proportions
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
