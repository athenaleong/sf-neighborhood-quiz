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
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
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
        height: '100vh',
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
          height: '100vh',
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
            height: '100vh',
            zIndex: 2
          }}
        >
          <div
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
              height: '100vh'
            }}
          >
            <Image
              src={overlayImages[currentOverlayIndex]}
              alt={`Opener overlay ${currentOverlayIndex + 1}`}
              fill
              className="object-cover"
              priority={currentOverlayIndex <= 1}
              sizes="100vw"
              style={{ 
                margin: 0,
                padding: 0
              }}
            />
          </div>
        </div>
      )}

      {/* Start button - overlay on top */}
      <div className="absolute bottom-0 left-0 right-0 w-full px-6 pb-8 z-10">
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
