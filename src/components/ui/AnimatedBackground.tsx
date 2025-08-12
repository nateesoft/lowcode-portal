'use client';

import React, { useEffect, useState } from 'react';

const AnimatedBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track scroll position for parallax effect with throttling
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Track mouse position for interactive elements with throttling
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        rafId = 0;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden will-change-transform">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950" />
      
      {/* Animated gradient meshes */}
      <div 
        className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02 - scrollY * 0.1}px, 0)`,
          animationDuration: '6s'
        }}
      />
      
      <div 
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02 + scrollY * 0.05}px, 0)`,
          animationDuration: '8s',
          animationDelay: '2s'
        }}
      />

      <div 
        className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-green-400/15 to-blue-500/15 rounded-full blur-2xl animate-pulse will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01 - scrollY * 0.15}px, 0)`,
          animationDuration: '10s',
          animationDelay: '4s'
        }}
      />

      {/* Floating geometric shapes */}
      <div 
        className="absolute top-20 right-20 w-8 h-8 bg-blue-500/30 rounded-full animate-bounce will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * 0.03}px, ${scrollY * -0.2}px, 0)`,
          animationDuration: '3s'
        }}
      />
      
      <div 
        className="absolute top-1/2 left-10 w-6 h-6 bg-purple-500/30 rotate-45 animate-bounce will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * -0.02}px, ${scrollY * -0.3}px, 0) rotate(45deg)`,
          animationDuration: '4s',
          animationDelay: '1s'
        }}
      />

      <div 
        className="absolute bottom-1/3 right-1/4 w-10 h-10 bg-pink-500/30 rounded-full animate-bounce will-change-transform"
        style={{
          transform: `translate3d(${mousePosition.x * 0.025}px, ${scrollY * -0.25}px, 0)`,
          animationDuration: '5s',
          animationDelay: '2s'
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `translate(${scrollY * -0.1}px, ${scrollY * -0.05}px)`
        }}
      />

      {/* Floating particles */}
      {isClient && [...Array(12)].map((_, i) => {
        const seed = i * 123.456;
        const pseudoRandom1 = (Math.sin(seed) + 1) / 2;
        const pseudoRandom2 = (Math.sin(seed * 2) + 1) / 2;
        const pseudoRandom3 = (Math.sin(seed * 3) + 1) / 2;
        const pseudoRandom4 = (Math.sin(seed * 4) + 1) / 2;
        const pseudoRandom5 = (Math.sin(seed * 5) + 1) / 2;
        
        return (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/20 rounded-full animate-pulse will-change-transform"
            style={{
              top: `${pseudoRandom1 * 100}%`,
              left: `${pseudoRandom2 * 100}%`,
              transform: `translate3d(${mousePosition.x * (0.01 + pseudoRandom3 * 0.02)}px, ${scrollY * -(0.1 + pseudoRandom4 * 0.2)}px, 0)`,
              animationDuration: `${3 + pseudoRandom5 * 4}s`,
              animationDelay: `${pseudoRandom1 * 3}s`
            }}
          />
        );
      })}

      {/* Additional flowing gradients for depth */}
      <div 
        className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-transparent via-blue-100/10 to-transparent dark:from-transparent dark:via-blue-900/10 dark:to-transparent will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.01}deg)`,
          transformOrigin: 'center'
        }}
      />

      <div 
        className="absolute bottom-0 right-1/4 w-full h-full bg-gradient-to-tl from-transparent via-purple-100/10 to-transparent dark:from-transparent dark:via-purple-900/10 dark:to-transparent will-change-transform"
        style={{
          transform: `translateY(${scrollY * -0.05}px) rotate(${scrollY * -0.005}deg)`,
          transformOrigin: 'center'
        }}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;