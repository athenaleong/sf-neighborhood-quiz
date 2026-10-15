'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import scoringData from '../data/scoring.json';
import ImagePreloader from '../components/ImagePreloader';
import AppDownloadButtons from '../components/AppDownloadButtons';

const RESULT_PAGE_VERSION = 'app-downloads';

interface NeighborhoodData {
  name: string;
  image: string;
}

interface ScoringData {
  neighborhoods: Record<string, NeighborhoodData>;
}

function ResultContent() {
  const router = useRouter();
  const posthog = usePostHog();
  
  // Get neighborhood from localStorage only
  const storedNeighborhood = typeof window !== 'undefined' ? localStorage.getItem('quizResult') : null;
  
  // Redirect to home if no result exists
  useEffect(() => {
    if (typeof window !== 'undefined' && !storedNeighborhood) {
      router.push('/');
    }
  }, [storedNeighborhood, router]);
  
  const initialNeighborhood = storedNeighborhood || 'chinatown';
  
  const [neighborhood] = useState<string>(initialNeighborhood);
  
  // Validate neighborhood exists, fallback to chinatown if not
  const typedScoringData = scoringData as ScoringData;
  const neighborhoodData = useMemo(() => {
    const data = typedScoringData.neighborhoods[neighborhood] 
      ? typedScoringData.neighborhoods[neighborhood] 
      : typedScoringData.neighborhoods.chinatown;
    
    return data;
  }, [neighborhood, typedScoringData]);

  // Track result page view
  useEffect(() => {
    posthog?.capture('result_page_viewed', {
      result_page_version: RESULT_PAGE_VERSION,
      neighborhood: neighborhood,
      neighborhood_name: neighborhoodData.name,
    });
  }, [posthog, neighborhood, neighborhoodData.name]);

  const resultImage = neighborhoodData.image;
  // Keep the full-resolution PNG for saving and sharing.
  const displayResultImage = resultImage.replace(/\.png$/, '.webp');
  const resultName = neighborhoodData.name;

  const handleSave = useCallback(async () => {
    // Track save button click
    posthog?.capture('result_save_clicked', {
      neighborhood: neighborhood,
      result_page_version: RESULT_PAGE_VERSION,
    });

    try {
      // Fetch the image
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const file = new File([blob], `${neighborhood}-outernet.png`, { type: 'image/png' });
      
      // Check if Web Share API with files is supported (works on iOS and some Android browsers)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My SF Neighborhood Personality',
            text: 'Check out my personality type!'
          });
          
          // Track successful share
          posthog?.capture('result_shared', {
            neighborhood: neighborhood,
            method: 'web_share_api',
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
      link.download = `${neighborhood}-outernet.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      // Track download
      posthog?.capture('result_downloaded', {
        neighborhood: neighborhood,
        method: 'download',
      });
    } catch {
      // Final fallback: open image in new tab
      window.open(resultImage, '_blank');
      
      // Track fallback
      posthog?.capture('result_opened_new_tab', {
        neighborhood: neighborhood,
      });
    }
  }, [neighborhood, resultImage, posthog]);

  const handleAgain = useCallback(() => {
    // Track retry from results
    posthog?.capture('result_again_clicked', {
      neighborhood: neighborhood,
      result_page_version: RESULT_PAGE_VERSION,
    });

    // Clear localStorage and go back to starting screen
    localStorage.setItem('currentQuestion', '0');
    localStorage.setItem('answerArray', JSON.stringify(new Array(14).fill(-1)));
    localStorage.removeItem('quizResult');
    router.push('/');
  }, [neighborhood, posthog, router]);

  return (
    <div className="w-full bg-background" style={{ height: '100dvh' }}>
      <div
        className="w-full h-full mx-auto flex flex-col overflow-y-auto bg-background"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="mx-auto w-full max-w-xl shrink-0">
          <div className="w-full pt-2" />
          <div className="w-full shrink-0 flex justify-center px-6 pb-3">
            <div className="w-full max-w-[112px] md:max-w-[240px]">
              <Image
                src="/cropped/athena-danielle-names.png"
                alt="Athena and Danielle with arrows pointing to their names"
                width={459}
                height={387}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
          <div className="w-full px-4 flex flex-col gap-3 mb-4 md:px-6 md:gap-4">
            <p
              className="text-xs leading-[18px] text-center md:text-sm md:leading-5"
              style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA', fontWeight: 700 }}
            >
              we&apos;re building something to help you actually explore your city with friends. join our super cool app for sexy people only.
            </p>
            <AppDownloadButtons onAction={(event) => posthog?.capture(event, {
              neighborhood,
              result_page_version: RESULT_PAGE_VERSION,
            })} />
            <p
              className="text-xs leading-[18px] text-center md:text-sm md:leading-5"
              style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA', fontWeight: 700 }}
            >
              why have we done this?? our motives at{' '}
              <a
                href="https://www.outernetexplorer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600 transition-colors"
                style={{ color: '#4D6EAA' }}
                onClick={() => posthog?.capture('website_link_clicked', {
                  neighborhood,
                  result_page_version: RESULT_PAGE_VERSION,
                })}
              >
                outernetexplorer.com
              </a>
            </p>
          </div>
          <div className="w-full shrink-0 flex justify-center items-center gap-4 px-4 pb-2">
            <button
              onClick={handleSave}
              className="transition-all duration-200 active:scale-95 cursor-pointer w-[104px] min-h-11"
              aria-label="Save result"
            >
              <Image src="/cropped/save-button.png" alt="Save" width={200} height={100} className="w-full h-auto" priority />
            </button>
            <button
              onClick={handleAgain}
              className="transition-all duration-200 active:scale-95 cursor-pointer w-[104px] min-h-11"
              aria-label="Take quiz again"
            >
              <Image src="/cropped/again-button.png" alt="Again" width={200} height={100} className="w-full h-auto" priority />
            </button>
          </div>
          <div className="w-full shrink-0 px-3 pb-3">
            <div className="w-full">
              <div className="relative w-full overflow-hidden rounded-3xl">
                <Image
                  src={displayResultImage}
                  alt={`Your personality type: ${resultName}`}
                  width={1080}
                  height={1920}
                  className="w-full h-auto"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:pb-2" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }} />
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <ImagePreloader>
      <ResultContent />
    </ImagePreloader>
  );
}
