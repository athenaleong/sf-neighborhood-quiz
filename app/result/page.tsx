'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, Suspense, useMemo, FormEvent, useEffect, useCallback, memo } from 'react';
import { usePostHog } from 'posthog-js/react';
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

// Separate memoized EmailSection to prevent remounting on parent re-renders
const EmailSection = memo(({ 
  email, 
  setEmail, 
  isSubmitting, 
  submitStatus,
  handleEmailSubmit,
  neighborhood,
  layoutVariant,
  posthog
}: {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  submitStatus: 'idle' | 'success' | 'error';
  handleEmailSubmit: (e: FormEvent<HTMLFormElement>) => void;
  neighborhood: string;
  layoutVariant: string | undefined;
  posthog: ReturnType<typeof usePostHog> | undefined;
}) => {
  // Determine copy text based on variant
  const getCopyText = () => {
    if (layoutVariant === 'variant-c') {
      return 'made by two friends bringing back the adventure in everyday life :) stay in the loop!';
    }
    if (layoutVariant === 'variant-e' || layoutVariant === 'variant-g') {
      return 'spend more time exploring your city and less time online! a new endeavor from creators behind Pursuit, Sit Club, and Mehran\'s Steakhouse :)';
    }
    if (layoutVariant === 'variant-f') {
      return 'here\'s your neighborhood vibe! wanna actually explore it instead of just reading about it?';
    }
    if (layoutVariant === 'variant-i') {
      return 'we\'re building something to help you actually explore your city with friends. join our super cool waitlist for sexy people only';
    }
    return 'made by two friends helping people get outside more! join us :)';
  };

  return (
    <div className="w-full px-6 flex flex-col gap-4 mb-4">
      <style jsx>{`
        input::placeholder {
          color: #4D6EAA;
          opacity: 0.6;
        }
      `}</style>
      <p
        className="text-sm text-center mb-2"
        style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA', fontWeight: 700 }}
      >
        {getCopyText()}
      </p>
    
    <div className="max-w-full mx-auto md:max-w-md flex flex-col gap-1 mb-2">
      <form onSubmit={handleEmailSubmit} className="space-y-2">
        {submitStatus === 'success' ? (
          <p
            className="text-green-600 text-sm text-center font-medium py-2"
            style={{ fontFamily: "'FOT-Seurat', sans-serif" }}
          >
            excited to have you!!
          </p>
        ) : (
          <>
            <div className="flex flex-row gap-2 w-full max-w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  disabled={isSubmitting}
                  className="flex-1 min-w-0 px-4 py-1.5 text-sm rounded-lg border-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'FOT-Seurat', sans-serif", borderColor: '#4D6EAA', color: '#4D6EAA', fontSize: '16px' }}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="shrink-0 px-6 py-2 text-sm rounded-full border-2 bg-white font-medium hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{ fontFamily: "'FOT-Seurat', sans-serif", borderColor: '#4D6EAA', color: '#4D6EAA' }}
                  >
                  {isSubmitting ? 'submitting...' : (
                    layoutVariant === 'variant-c' ? 'join' : 
                    layoutVariant === 'variant-e' || layoutVariant === 'variant-g' ? 'lemme in' :
                    layoutVariant === 'variant-f' ? 'hell yeah' :
                    layoutVariant === 'variant-i' ? 'lemme in >:)' :
                    'submit'
                  )}
                </button>
            </div>
            {submitStatus === 'error' && (
              <p
                className="text-red-600 text-xs text-center"
                style={{ fontFamily: "'FOT-Seurat', sans-serif" }}
              >
                oops! please try again
              </p>
            )}
          </>
        )}
      </form>

      <p
        className="text-center text-[10px] font-semibold"
        style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA' }}
      >
        no spam, just a heads-up when you're off the waitlist
      </p>
    </div>

      <p
        className="text-sm text-center"
        style={{ fontFamily: "'FOT-Seurat', sans-serif", color: '#4D6EAA', fontWeight: 700 }}
      >
        {layoutVariant === 'variant-h' ? (
          <>
            find recs based on your neighborhood personality:{' '}
            <a 
              href="https://www.outernetexplorer.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 transition-colors"
              style={{ color: '#4D6EAA' }}
              onClick={() => {
                posthog?.capture('website_link_clicked', {
                  neighborhood: neighborhood,
                  layout_variant: layoutVariant || 'control',
                });
              }}
            >
              outernetexplorer.com
            </a>
          </>
        ) : (
          <>
            our story at{' '}
            <a 
              href="https://www.outernetexplorer.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-600 transition-colors"
              style={{ color: '#4D6EAA' }}
              onClick={() => {
                posthog?.capture('website_link_clicked', {
                  neighborhood: neighborhood,
                  layout_variant: layoutVariant || 'control',
                });
              }}
            >
              outernetexplorer.com
            </a>
          </>
        )}
      </p>
    </div>
  );
});

EmailSection.displayName = 'EmailSection';

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

  // Track result page view
  useEffect(() => {
    posthog?.capture('result_page_viewed', {
      neighborhood: neighborhood,
      neighborhood_name: neighborhoodData.name,
    });
  }, [posthog, neighborhood, neighborhoodData.name]);

  // Get experiment variant for layout order
  const layoutVariant = posthog?.getFeatureFlag('result-layout-order-v5') as string | undefined;
  // const layoutVariant = 'variant-i' as string | undefined;  // Force variant A
  // Track experiment exposure
  useEffect(() => {
    if (layoutVariant) {
      posthog?.capture('experiment_viewed', {
        experiment: 'result-layout-order-v5',
        variant: layoutVariant,
        neighborhood: neighborhood,
      });
    }
  }, [posthog, layoutVariant, neighborhood]);
  
  const resultImage = neighborhoodData.image;
  const resultName = neighborhoodData.name;

  // Memoize bottom padding to avoid re-calculations on every render
  const bottomPadding = useMemo(() => {
    if (typeof window === 'undefined') return '1.5rem';
    return window.innerWidth < 768 
      ? 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' 
      : '1.5rem';
  }, []);

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

  const handleSave = useCallback(async () => {
    // Track save button click
    posthog?.capture('result_save_clicked', {
      neighborhood: neighborhood,
      layout_variant: layoutVariant || 'control',
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
  }, [neighborhood, layoutVariant, resultImage, posthog]);

  const handleAgain = useCallback(() => {
    // Track retry from results
    posthog?.capture('result_again_clicked', {
      neighborhood: neighborhood,
      layout_variant: layoutVariant || 'control',
    });

    // Clear localStorage and go back to starting screen
    localStorage.setItem('currentQuestion', '0');
    localStorage.setItem('answerArray', JSON.stringify(new Array(14).fill(-1)));
    localStorage.removeItem('quizResult');
    router.push('/');
  }, [neighborhood, layoutVariant, posthog, router]);

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
        
        // Track successful email submission
        posthog?.capture('email_subscribed', {
          neighborhood: neighborhood,
          neighborhood_name: resultName,
          layout_variant: layoutVariant || 'control',
        });
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

  // Define reusable component sections
  const TopSpacer = () => (
    <div className="w-full pt-2" />
  );

  const ButtonsSection = () => (
    <div className="w-full flex justify-center items-center gap-6 px-6 pb-2">
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
  );

  const ResultImageSection = () => (
    <div className="flex-1 flex items-center justify-center px-4 pb-4">
      <div
        className="w-full"
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
      </div>
    </div>
  );

  const FriendsPhotoSection = () => (
    <div className="w-full flex justify-center px-6 pb-4">
      <div className="w-full max-w-[200px]">
        <Image
          src="/cropped/athena-danielle-on-the-phone.png"
          alt="Athena and Danielle"
          width={200}
          height={200}
          className="w-full h-auto rounded-2xl"
          priority
        />
      </div>
    </div>
  );

  // Render layout based on experiment variant
  const renderLayout = () => {
    const emailSection = (
      <EmailSection
        email={email}
        setEmail={setEmail}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
        handleEmailSubmit={handleEmailSubmit}
        neighborhood={neighborhood}
        layoutVariant={layoutVariant}
        posthog={posthog}
      />
    );

    // Variant A: Email → Buttons → Result Picture
    if (layoutVariant === 'variant-a') {
      return (
        <>
          <TopSpacer />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant B: Buttons → Email → Result Picture
    if (layoutVariant === 'variant-b') {
      return (
        <>
          <TopSpacer />
          <ButtonsSection />
          {emailSection}
          <ResultImageSection />
        </>
      );
    }
    
    // Variant C: Email → Buttons → Result Picture (with new copy)
    if (layoutVariant === 'variant-c') {
      return (
        <>
          <TopSpacer />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant D: Friends Photo → Email → Buttons → Result Picture
    if (layoutVariant === 'variant-d') {
      return (
        <>
          <TopSpacer />
          <FriendsPhotoSection />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant E: Email → Buttons → Result Picture
    if (layoutVariant === 'variant-e') {
      return (
        <>
          <TopSpacer />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant F: Email → Buttons → Result Picture
    if (layoutVariant === 'variant-f') {
      return (
        <>
          <TopSpacer />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant G: Friends Photo → Email → Buttons → Result Picture (same copy as variant-e)
    if (layoutVariant === 'variant-g') {
      return (
        <>
          <TopSpacer />
          <FriendsPhotoSection />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant H: Friends Photo → Email → Buttons → Result Picture (same as variant-d but different bottom text)
    if (layoutVariant === 'variant-h') {
      return (
        <>
          <TopSpacer />
          <FriendsPhotoSection />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Variant I: Friends Photo → Email → Buttons → Result Picture (same as variant-e but different copy and button)
    if (layoutVariant === 'variant-i') {
      return (
        <>
          <TopSpacer />
          <FriendsPhotoSection />
          {emailSection}
          <ButtonsSection />
          <ResultImageSection />
        </>
      );
    }
    
    // Control: Email → Buttons → Result Picture (current/default)
    return (
      <>
        <TopSpacer />
        {emailSection}
        <ButtonsSection />
        <ResultImageSection />
      </>
    );
  };

  // Bottom spacer for safe area insets
  const BottomSpacer = () => (
    <div 
      className="w-full md:pb-2" 
      style={{ paddingBottom: bottomPadding }}
    />
  );

  return (
    <div className="w-full bg-[#d7f0f7] md:bg-[#d7f0f7]" style={{ height: '100dvh' }}>
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div 
        className="w-full h-full max-w-xl mx-auto flex flex-col overflow-y-auto" 
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
        {/* Render layout based on experiment variant */}
        {renderLayout()}
        {/* Bottom spacer for safe area insets */}
        <BottomSpacer />
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <ImagePreloader>
      <Suspense fallback={
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#A8D8EA]">
          <Image
            src="/cropped/bridge-2.gif"
            alt="Loading"
            width={400}
            height={300}
            unoptimized
            priority
          />
        </div>
      }>
        <ResultContent />
      </Suspense>
    </ImagePreloader>
  );
}

