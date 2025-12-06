'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, Suspense, useMemo, FormEvent } from 'react';
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
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
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

  // Image display settings per neighborhood
  const imageSettings = useMemo(() => {
    const settings: Record<string, { aspectRatio: string; objectPosition: string }> = {
      haight: { aspectRatio: '7/10', objectPosition: 'center 20%' },
      marina: { aspectRatio: '7/10', objectPosition: 'center 20%' },
      northbeach: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      castro: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      chinatown: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      tenderloin: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      richmond: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      fidi: { aspectRatio: '7/10', objectPosition: 'center 30%' },
      presidio: { aspectRatio: '5/7', objectPosition: 'center 30%' },
      mission: { aspectRatio: '7/10', objectPosition: 'center 30%' }, // default
    };
    return settings[neighborhood] || { aspectRatio: '7/10', objectPosition: 'center 30%' };
  }, [neighborhood]);

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

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          neighborhood: resultName,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#d7f0f7] md:bg-[#d7f0f7]">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div 
        className="w-full h-full max-w-xl mx-auto flex flex-col overflow-y-auto md:overflow-y-hidden" 
        style={{ 
          backgroundColor: '#a8d8ea',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE and Edge */
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        {/* Header with save and again buttons */}
        <div className="w-full flex justify-center items-center gap-6 px-6 pt-2 pb-2">
          <button
            onClick={handleSave}
            className="transition-all duration-200 active:scale-95 w-[40%] animate-bounce-subtle cursor-pointer"
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
            className="transition-all duration-200 active:scale-95 w-[40%] animate-bounce-subtle cursor-pointer"
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
            <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: imageSettings.aspectRatio }}>
              <Image
                src={resultImage}
                alt={`Your personality type: ${resultName}`}
                width={800}
                height={1200}
                className="w-full h-full"
                style={{ 
                  objectFit: 'cover',
                  objectPosition: imageSettings.objectPosition
                }}
                priority
                unoptimized
              />
            </div>
          </motion.div>
        </div>

        {/* Call to action at bottom */}
        <div className="w-full px-6 md:pb-6" style={{ paddingBottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' : '1.5rem' }}>
          <motion.p
            className="text-sm text-center mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA' }}
          >
            made by two friends helping people get outside more! join us :)
          </motion.p>
          
          <form onSubmit={handleEmailSubmit} className="space-y-2 mb-2 max-w-full mx-auto md:max-w-md">
            {submitStatus === 'success' ? (
              <motion.p
                className="text-green-600 text-sm text-center font-medium py-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ fontFamily: "'FOT-Seurat', sans-serif" }}
              >
                excited to have you!!
              </motion.p>
            ) : (
              <>
                <div className="flex flex-row gap-2 w-full max-w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    disabled={isSubmitting}
                    className="flex-1 min-w-0 px-4 py-1.5 text-sm rounded-lg border-2 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'FOT-Seurat', sans-serif", borderColor: '#4D6EAA' }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="flex-shrink-0 px-6 py-1.5 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 whitespace-nowrap"
                    style={{ fontFamily: "'FOT-Seurat', sans-serif" }}
                  >
                    {isSubmitting ? 'submitting...' : 'submit'}
                  </button>
                </div>
                {submitStatus === 'error' && (
                  <motion.p
                    className="text-red-600 text-xs text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontFamily: "'FOT-Seurat', sans-serif" }}
                  >
                    oops! please try again
                  </motion.p>
                )}
              </>
            )}
          </form>

          <motion.p
            className="text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA' }}
          >
            our story at{' '}
            <a 
              href="https://outernetexplorer.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 transition-colors"
              style={{ color: '#4D6EAA' }}
            >
              outernetexplorer.com
            </a>
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

