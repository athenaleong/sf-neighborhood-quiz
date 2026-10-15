'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';

interface ImagePreloaderProps {
  children: React.ReactNode;
}

export default function ImagePreloader({ children }: ImagePreloaderProps) {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Get the user's result neighborhood from localStorage to prioritize loading
    const userNeighborhood = typeof window !== 'undefined' ? localStorage.getItem('quizResult') : null;
    
    const imagesToPreload = [
      // Question images
      '/cropped/story-opener-background.png',
      '/uncropped/1.png',
      '/cropped/2.png',
      '/uncropped/3.png',
      '/cropped/4-1.png',
      '/cropped/4-2.png',
      '/cropped/5-1.png',
      '/cropped/5-2.png',
      '/cropped/6-1.png',
      '/cropped/6-2.png',
      '/cropped/6-3.png',
      '/cropped/7-1.png',
      '/cropped/8-1.png',
      '/cropped/8-2.png',
      '/cropped/9.png',
      '/cropped/10-1.png',
      '/cropped/10-2.png',
      '/cropped/11.png',
      '/cropped/12.png',
      '/cropped/12-lightning-on.png',
      '/cropped/12-lightning-off.png',
      '/cropped/12-sun-left.png',
      '/cropped/12-sun-right.png',
      '/cropped/13-1.png',
      '/cropped/13-2.png',
      '/cropped/14-1.png',
      '/cropped/14-2.png',
      // UI images
      '/cropped/background.png',
      '/cropped/bread.png',
      '/cropped/back-button.png',
      '/cropped/retry-button.png',
      '/cropped/start-button.png',
      '/cropped/opener-base.png',
      '/cropped/opener-overlay-1.png',
      '/cropped/opener-overlay-2.png',
      '/cropped/opener-overlay-3.png',
      '/cropped/opener-overlay-4.png',
      '/cropped/save-button.png',
      '/cropped/again-button.png',
      // Compressed result images; original PNGs are fetched only when saving
      '/result/castro.webp',
      '/result/chinatown.webp',
      '/result/fidi.webp',
      '/result/haight.webp',
      '/result/marina.webp',
      '/result/mission.webp',
      '/result/northbeach.webp',
      '/result/presidio.webp',
      '/result/richmond.webp',
      '/result/tenderloin.webp'
    ];

    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve();
        };
        img.onerror = () => {
          resolve(); // Still resolve to continue loading other images
        };
        img.src = src;
      });
    };

    // If we're on the result page and have a user's neighborhood, prioritize loading that image first
    if (userNeighborhood) {
      const userResultImage = `/result/${userNeighborhood}.webp`;
      const resultUIImages = [
        '/cropped/save-button.png',
        '/cropped/again-button.png',
        '/cropped/background.png', // For the email form text
        '/cropped/bread.png' // In case user clicks "again" button
      ];
      
      // Load only the images needed for the result page
      Promise.all([
        loadImage(userResultImage),
        ...resultUIImages.map(img => loadImage(img))
      ]).then(() => {
        // Show content immediately after loading only the result page images
        setImagesLoaded(true);
      }).catch(() => {
        setImagesLoaded(true); // Show content anyway if there's an error
      });
    } else {
      // Normal loading for non-result pages
      Promise.all(imagesToPreload.map(loadImage))
        .then(() => {
          // Small delay to ensure everything is ready
          setTimeout(() => {
            setImagesLoaded(true);
          }, 300);
        })
        .catch(() => {
          setImagesLoaded(true); // Show content anyway if there's an error
        });
    }
  }, []);

  if (!imagesLoaded) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background">
        <NextImage
          src="/cropped/bridge-2.gif"
          alt="Loading"
          width={400}
          height={300}
          unoptimized
          priority
        />
      </div>
    );
  }

  return <>{children}</>;
}
