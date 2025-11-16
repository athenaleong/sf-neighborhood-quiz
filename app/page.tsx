'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [currentOverlayIndex, setCurrentOverlayIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const baseImage = '/cropped/opener-base.png';
  const questionImage = '/cropped/question.png';
  const startButtonImage = '/cropped/start-button.png';
  const overlayImages = [
    '/cropped/opener-overlay-1.png',
    '/cropped/opener-overlay-2.png',
    '/cropped/opener-overlay-3.png',
    '/cropped/opener-overlay-4.png',
  ];

  // Preload all images to prevent white flashes
  useEffect(() => {
    const allImages = [baseImage, questionImage, startButtonImage, ...overlayImages];
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
      className="absolute inset-0 w-full h-full overflow-hidden bg-white flex justify-center" 
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
      {/* Content container with max-width constraint - includes everything */}
      <div className="w-full h-full max-w-xl mx-auto relative bg-white">
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
            width: '100%', 
            height: '100%',
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
            sizes="(max-width: 640px) 100vw, 576px"
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
              width: '100%', 
              height: '100%',
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
                  width: '100%',
                  height: '100%',
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
                  sizes="(max-width: 640px) 100vw, 576px"
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

        {/* Question image - positioned 10% from top */}
        {imagesLoaded && (
          <motion.div 
            className="absolute left-0 right-0 flex justify-center"
            style={{
              top: '5%',
              zIndex: 3,
              width: '100%',
              paddingLeft: `max(1.5rem, var(--sal))`,
              paddingRight: `max(1.5rem, var(--sar))`,
              boxSizing: 'border-box'
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              rotate: [0, -2, 2, -2, 0]
            }}
            transition={{
              opacity: {
                duration: 1,
                ease: 'easeOut'
              },
              rotate: {
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 0.5
              }
            }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                maxWidth: '90%',
                aspectRatio: 'auto'
              }}
            >
              <Image
                src={questionImage}
                alt="What SF neighborhood are you?"
                width={800}
                height={200}
                className="object-contain w-full h-auto"
                priority
                unoptimized
                style={{
                  margin: 0,
                  padding: 0
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Start button - overlay on top */}
        {imagesLoaded && (
          <motion.div 
            className="absolute left-0 right-0 z-10 flex justify-center"
            style={{
              bottom: `calc(5dvh + var(--sab))`,
              paddingLeft: `max(1.5rem, var(--sal))`,
              paddingRight: `max(1.5rem, var(--sar))`,
              width: '100%',
              boxSizing: 'border-box'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              ease: 'easeOut',
              delay: 0.5
            }}
          >
            <button
              onClick={handleStart}
              className="relative transition-all duration-200 active:scale-95 cursor-pointer"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0
              }}
            >
              <Image
                src={startButtonImage}
                alt="Start"
                width={200}
                height={200}
                className="object-contain"
                priority
                unoptimized
                style={{
                  margin: 0,
                  padding: 0,
                  display: 'block'
                }}
              />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
