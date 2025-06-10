'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';

// Types for the component
interface DockApp {
  id: string;
  name: string;
  icon: string;
}

interface GSAPInstance {
  to: (target: HTMLElement | null, options: {
    y: number;
    duration: number;
    ease: string;
    yoyo: boolean;
    repeat: number;
    transformOrigin: string;
  }) => void;
}

interface WindowWithGSAP extends Window {
  gsap?: GSAPInstance;
}

interface MacOSDockProps {
  apps: DockApp[];
  onAppClick: (appId: string) => void;
  openApps?: string[];
  className?: string;
}

const MacOSDock: React.FC<MacOSDockProps> = ({ 
  apps, 
  onAppClick, 
  openApps = [],
  className = ''
}) => {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [currentScales, setCurrentScales] = useState<number[]>(apps.map(() => 1));
  const [currentPositions, setCurrentPositions] = useState<number[]>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastMouseMoveTime = useRef<number>(0);

  // Fixed configuration to avoid hydration issues
  const baseIconSize = 64;
  const maxScale = 1.8;
  const effectWidth = 300;
  const minScale = 1.0;
  const baseSpacing = 8;
  
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Authentic macOS cosine-based magnification algorithm
  const calculateTargetMagnification = useCallback((mousePosition: number | null) => {
    if (mousePosition === null) {
      return apps.map(() => minScale);
    }

    return apps.map((_, index) => {
      const normalIconCenter = (index * (baseIconSize + baseSpacing)) + (baseIconSize / 2);
      const minX = mousePosition - (effectWidth / 2);
      const maxX = mousePosition + (effectWidth / 2);
      
      if (normalIconCenter < minX || normalIconCenter > maxX) {
        return minScale;
      }
      
      const theta = ((normalIconCenter - minX) / effectWidth) * 2 * Math.PI;
      const cappedTheta = Math.min(Math.max(theta, 0), 2 * Math.PI);
      const scaleFactor = (1 - Math.cos(cappedTheta)) / 2;
      
      return minScale + (scaleFactor * (maxScale - minScale));
    });
  }, [apps, baseIconSize, baseSpacing, effectWidth, maxScale, minScale]);

  // Calculate positions based on current scales
  const calculatePositions = useCallback((scales: number[]) => {
    let currentX = 0;
    
    return scales.map((scale) => {
      const scaledWidth = baseIconSize * scale;
      const centerX = currentX + (scaledWidth / 2);
      currentX += scaledWidth + baseSpacing;
      return centerX;
    });
  }, [baseIconSize, baseSpacing]);

  // Initialize positions
  useEffect(() => {
    const initialScales = apps.map(() => minScale);
    const initialPositions = calculatePositions(initialScales);
    setCurrentScales(initialScales);
    setCurrentPositions(initialPositions);
  }, [apps, calculatePositions, minScale]);

  // Animation loop
  const animateToTarget = useCallback(() => {
    const targetScales = calculateTargetMagnification(mouseX);
    const targetPositions = calculatePositions(targetScales);
    const lerpFactor = mouseX !== null ? 0.2 : 0.12;

    setCurrentScales(prevScales => {
      return prevScales.map((currentScale, index) => {
        const diff = targetScales[index] - currentScale;
        return currentScale + (diff * lerpFactor);
      });
    });

    setCurrentPositions(prevPositions => {
      return prevPositions.map((currentPos, index) => {
        const diff = targetPositions[index] - currentPos;
        return currentPos + (diff * lerpFactor);
      });
    });

    const scalesNeedUpdate = currentScales.some((scale, index) => 
      Math.abs(scale - targetScales[index]) > 0.002
    );
    const positionsNeedUpdate = currentPositions.some((pos, index) => 
      Math.abs(pos - targetPositions[index]) > 0.1
    );
    
    if (scalesNeedUpdate || positionsNeedUpdate || mouseX !== null) {
      animationFrameRef.current = requestAnimationFrame(animateToTarget);
    }
  }, [mouseX, calculateTargetMagnification, calculatePositions, currentScales, currentPositions]);

  // Start/stop animation loop
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateToTarget);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateToTarget]);

  // Throttled mouse movement handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = performance.now();
    
    if (now - lastMouseMoveTime.current < 16) {
      return;
    }
    
    lastMouseMoveTime.current = now;
    
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      const padding = Math.max(8, baseIconSize * 0.12);
      setMouseX(e.clientX - rect.left - padding);
    }
  }, [baseIconSize]);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const createBounceAnimation = (element: HTMLElement) => {
    // Add bounce class for CSS animation
    element.classList.add('dock-icon-bounce');
    
    // Remove class after animation completes
    setTimeout(() => {
      element.classList.remove('dock-icon-bounce');
    }, 400);
  };

  const handleAppClick = (appId: string, index: number) => {
    if (iconRefs.current[index]) {
      if (typeof window !== 'undefined' && (window as WindowWithGSAP).gsap) {
        const gsap = (window as WindowWithGSAP).gsap!;
        const bounceHeight = currentScales[index] > 1.3 ? -baseIconSize * 0.2 : -baseIconSize * 0.15;
        
        gsap.to(iconRefs.current[index], {
          y: bounceHeight,
          duration: 0.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          transformOrigin: 'bottom center'
        });
      } else {
        createBounceAnimation(iconRefs.current[index]!);
      }
    }
    
    onAppClick(appId);
  };

  // Calculate content width
  const contentWidth = currentPositions.length > 0 
    ? Math.max(...currentPositions.map((pos, index) => 
        pos + (baseIconSize * currentScales[index]) / 2
      ))
    : (apps.length * (baseIconSize + baseSpacing)) - baseSpacing;

  const padding = Math.max(8, baseIconSize * 0.12);

  // Prevent hydration mismatch by only rendering after client mount
  if (!isClient) {
    return (
      <div 
        className={`backdrop-blur-xl ${className}`}
        style={{
          width: `${(apps.length * (baseIconSize + baseSpacing)) - baseSpacing + padding * 2}px`,
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.15) 0%, 
              rgba(255, 255, 255, 0.05) 25%, 
              rgba(255, 255, 255, 0.02) 50%, 
              rgba(255, 255, 255, 0.05) 75%, 
              rgba(255, 255, 255, 0.1) 100%
            ),
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15), transparent 40%),
            rgba(255, 255, 255, 0.03)
          `,
          borderRadius: `${Math.max(12, baseIconSize * 0.4)}px`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 ${Math.max(4, baseIconSize * 0.1)}px ${Math.max(16, baseIconSize * 0.4)}px rgba(0, 0, 0, 0.3),
            0 ${Math.max(2, baseIconSize * 0.05)}px ${Math.max(8, baseIconSize * 0.2)}px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1),
            inset 1px 0 0 rgba(255, 255, 255, 0.2),
            inset -1px 0 0 rgba(255, 255, 255, 0.2)
          `,
          padding: `${padding}px`
        }}
      >
        <div 
          className="relative"
          style={{
            height: `${baseIconSize}px`,
            width: '100%'
          }}
        >
          {apps.map((app, index) => (
            <div
              key={app.id}
              className="absolute cursor-pointer flex flex-col items-center justify-end"
              title={app.name}
              style={{
                left: `${index * (baseIconSize + baseSpacing)}px`,
                bottom: '0px',
                width: `${baseIconSize}px`,
                height: `${baseIconSize}px`,
                transformOrigin: 'bottom center'
              }}
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={baseIconSize}
                height={baseIconSize}
                className="object-contain"
                style={{
                  filter: `drop-shadow(0 ${Math.max(1, baseIconSize * 0.03)}px ${Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,0.2))`
                }}
              />
              
              {/* App Indicator Dot */}
              {openApps.includes(app.id) && (
                <div 
                  className="absolute"
                  style={{
                    bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${Math.max(3, baseIconSize * 0.06)}px`,
                    height: `${Math.max(3, baseIconSize * 0.06)}px`,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dockRef}
      className={`backdrop-blur-xl ${className}`}
      style={{
        width: `${contentWidth + padding * 2}px`,
        background: `
          linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%, 
            rgba(255, 255, 255, 0.05) 25%, 
            rgba(255, 255, 255, 0.02) 50%, 
            rgba(255, 255, 255, 0.05) 75%, 
            rgba(255, 255, 255, 0.1) 100%
          ),
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.2), transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.15), transparent 40%),
          rgba(255, 255, 255, 0.03)
        `,
        borderRadius: `${Math.max(12, baseIconSize * 0.4)}px`,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: `
          0 ${Math.max(4, baseIconSize * 0.1)}px ${Math.max(16, baseIconSize * 0.4)}px rgba(0, 0, 0, 0.3),
          0 ${Math.max(2, baseIconSize * 0.05)}px ${Math.max(8, baseIconSize * 0.2)}px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1),
          inset 1px 0 0 rgba(255, 255, 255, 0.2),
          inset -1px 0 0 rgba(255, 255, 255, 0.2)
        `,
        padding: `${padding}px`
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="relative"
        style={{
          height: `${baseIconSize}px`,
          width: '100%'
        }}
      >
        {apps.map((app, index) => {
          const scale = currentScales[index];
          const position = currentPositions[index] || 0;
          const scaledSize = baseIconSize * scale;
          
          return (
            <div
              key={app.id}
              ref={(el) => { iconRefs.current[index] = el; }}
              className="absolute cursor-pointer flex flex-col items-center justify-end"
              title={app.name}
              onClick={() => handleAppClick(app.id, index)}
              style={{
                left: `${position - scaledSize / 2}px`,
                bottom: '0px',
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                transformOrigin: 'bottom center',
                zIndex: Math.round(scale * 10)
              }}
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={scaledSize}
                height={scaledSize}
                className="object-contain"
                style={{
                  filter: `drop-shadow(0 ${scale > 1.2 ? Math.max(2, baseIconSize * 0.05) : Math.max(1, baseIconSize * 0.03)}px ${scale > 1.2 ? Math.max(4, baseIconSize * 0.1) : Math.max(2, baseIconSize * 0.06)}px rgba(0,0,0,${0.2 + (scale - 1) * 0.15}))`
                }}
              />
              
              {/* App Indicator Dot */}
              {openApps.includes(app.id) && (
                <div 
                  className="absolute"
                  style={{
                    bottom: `${Math.max(-2, -baseIconSize * 0.05)}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: `${Math.max(3, baseIconSize * 0.06)}px`,
                    height: `${Math.max(3, baseIconSize * 0.06)}px`,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MacOSDock;