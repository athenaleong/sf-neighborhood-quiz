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
      // Result images (matching scoring.json - all uppercase .PNG)
      '/result/castro.PNG',
      '/result/chinatown.PNG',
      '/result/fidi.PNG',
      '/result/haight.PNG',
      '/result/marina.PNG',
      '/result/mission.PNG',
      '/result/northbeach.PNG',
      '/result/presidio.PNG',
      '/result/richmond.PNG',
      '/result/tenderloin.PNG'
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
      const userResultImage = `/result/${userNeighborhood}.PNG`;
      loadImage(userResultImage).then(() => {
        // After loading the user's result image, load the rest
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
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#A8D8EA]">
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

