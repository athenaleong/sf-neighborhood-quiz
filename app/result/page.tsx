'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, Suspense, useMemo } from 'react';
import scoringData from '../data/scoring.json';
import ImagePreloader from '../components/ImagePreloader';

interface NeighborhoodData {
  name: string;
  image: string;
}

interface ScoringData {
  neighborhoods: {
    [key: string]: NeighborhoodData;
  };
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get neighborhood directly from URL params or localStorage
  const urlNeighborhood = searchParams.get('neighborhood');
  const storedNeighborhood = typeof window !== 'undefined' ? localStorage.getItem('quizResult') : null;
  const initialNeighborhood = urlNeighborhood || storedNeighborhood || 'chinatown';
  
  const [neighborhood] = useState<string>(initialNeighborhood);
  
  // Validate neighborhood exists, fallback to chinatown if not
  const typedScoringData = scoringData as ScoringData;
  const neighborhoodData = useMemo(() => {
    const data = typedScoringData.neighborhoods[neighborhood] 
      ? typedScoringData.neighborhoods[neighborhood] 
      : typedScoringData.neighborhoods.chinatown;
    
    return data;
  }, [neighborhood, typedScoringData]);
  
  const resultImage = neighborhoodData.image;
  const resultName = neighborhoodData.name;

  const handleSave = async () => {
    try {
      // Fetch the image
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], `${neighborhood}-personality-result.png`, { type: 'image/png' });
      
      // Check if Web Share API with files is supported (works on iOS and some Android browsers)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My SF Neighborhood Personality',
            text: 'Check out my personality type!'
          });
          return; // Successfully shared/saved
        } catch (shareError) {
          // User cancelled or share failed, fall through to download method
          if ((shareError as Error).name === 'AbortError') {
            return; // User cancelled, don't show error
          }
        }
      }
      
      // Fallback: Download method (works on desktop and Android)
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${neighborhood}-personality-result.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Final fallback: open image in new tab
      window.open(resultImage, '_blank');
    }
  };

  const handleAgain = () => {
    // Clear localStorage and go back to starting screen
    localStorage.setItem('currentQuestion', '0');
    localStorage.setItem('answerArray', JSON.stringify(new Array(14).fill(-1)));
    localStorage.removeItem('quizResult');
    router.push('/');
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#d7f0f7] md:bg-[#d7f0f7]">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div className="w-full h-full max-w-xl mx-auto flex flex-col overflow-y-auto" style={{ backgroundColor: '#a8d8ea' }}>
        {/* Header with save and again buttons */}
        <div className="w-full flex justify-center items-center gap-6 px-6 pt-2 pb-2">
          <button
            onClick={handleSave}
            className="transition-all duration-200 active:scale-95 w-[40%] animate-bounce-subtle"
            aria-label="Save result"
          >
            <Image
              src="/cropped/save-button.png"
              alt="Save"
              width={200}
              height={100}
              className="w-full h-auto"
              priority
            />
          </button>
          <button
            onClick={handleAgain}
            className="transition-all duration-200 active:scale-95 w-[40%] animate-bounce-subtle"
            aria-label="Take quiz again"
          >
            <Image
              src="/cropped/again-button.png"
              alt="Again"
              width={200}
              height={100}
              className="w-full h-auto"
              priority
            />
          </button>
        </div>

        {/* Result image */}
        <div className="flex-1 flex items-center justify-center px-4 pb-4">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative w-full" style={{ aspectRatio: 'auto' }}>
              <Image
                src={resultImage}
                alt={`Your personality type: ${resultName}`}
                width={800}
                height={1200}
                className="object-contain w-full h-auto"
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </div>

        {/* Call to action at bottom */}
        <div className="w-full px-6 pb-6 text-center">
          <motion.p
            className="text-black text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
          >
            made by 2 friends..
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <ImagePreloader>
      <Suspense fallback={
        <div className="w-full h-screen flex items-center justify-center bg-[#E6E1C9]">
          <div className="text-center text-black" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
            Loading...
          </div>
        </div>
      }>
        <ResultContent />
      </Suspense>
    </ImagePreloader>
  );
}

