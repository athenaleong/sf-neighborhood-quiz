'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [currentOverlayIndex, setCurrentOverlayIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const baseImage = '/cropped/opener-base.png';
  const overlayImages = [
    '/cropped/opener-overlay-1.png',
    '/cropped/opener-overlay-2.png',
    '/cropped/opener-overlay-3.png',
    '/cropped/opener-overlay-4.png',
  ];

  // Preload all images to prevent white flashes
  useEffect(() => {
    const allImages = [baseImage, ...overlayImages];
    const imagePromises = allImages.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          // Force image to stay in cache
          resolve(img);
        };
        img.onerror = reject;
        // Use absolute URL for better caching
        const absoluteSrc = src.startsWith('/') ? `${window.location.origin}${src}` : src;
        img.src = absoluteSrc;
      });
    });

    Promise.all(imagePromises).then(() => {
      // Small delay to ensure images are fully cached
      setTimeout(() => {
        setImagesLoaded(true);
      }, 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loop through overlay images - only start after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentOverlayIndex((prev) => (prev + 1) % overlayImages.length);
    }, 500); // Change overlay every 1 second

    return () => clearInterval(interval);
  }, [overlayImages.length, imagesLoaded]);

  const handleStart = () => {
    router.push('/quiz');
  };

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden bg-white" 
      style={{ 
        margin: 0, 
        padding: 0, 
        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100dvh',
        position: 'fixed'
      }}
    >
      {/* Base image - always visible */}
      <div 
        className="absolute inset-0" 
        style={{ 
          margin: 0, 
          padding: 0, 
          left: 0, 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100dvh',
          minHeight: '100dvh',
          zIndex: 1
        }}
      >
        <Image
          src={baseImage}
          alt="Opener base"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ 
            margin: 0,
            padding: 0
          }}
        />
      </div>

      {/* Animated overlay images - cycle on top of base */}
      {imagesLoaded && (
        <div 
          className="absolute inset-0" 
        style={{ 
          margin: 0, 
          padding: 0, 
          left: 0, 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '100vw', 
          height: '100dvh',
          minHeight: '100dvh',
          zIndex: 2
        }}
        >
          {overlayImages.map((overlay, index) => (
            <div
              key={`overlay-${index}`}
              className="absolute inset-0"
              style={{ 
                pointerEvents: 'none', 
                margin: 0, 
                padding: 0, 
                left: 0, 
                right: 0, 
                top: 0, 
                bottom: 0,
                width: '100vw',
                height: '100dvh',
                minHeight: '100dvh',
                opacity: index === currentOverlayIndex ? 1 : 0,
                visibility: index === currentOverlayIndex ? 'visible' : 'hidden',
                transition: 'none'
              }}
            >
              <Image
                src={overlay}
                alt={`Opener overlay ${index + 1}`}
                fill
                className="object-cover"
                priority={index <= 1}
                sizes="100vw"
                unoptimized
                style={{ 
                  margin: 0,
                  padding: 0
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Start button - overlay on top */}
      <div 
        className="absolute left-0 right-0 z-10"
        style={{
          bottom: `calc(var(--sab) + 2rem)`,
          paddingLeft: `max(1.5rem, var(--sal))`,
          paddingRight: `max(1.5rem, var(--sar))`,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <button
          onClick={handleStart}
          className="w-full bg-black text-white rounded-lg px-6 py-4 text-lg font-medium transition-all duration-200 hover:bg-zinc-800 active:scale-95"
          style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
