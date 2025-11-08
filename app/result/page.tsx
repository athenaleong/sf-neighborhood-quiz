'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Result() {
  const router = useRouter();

  const handleSave = async () => {
    try {
      // Fetch the image
      const response = await fetch('/result/chinatown.PNG');
      const blob = await response.blob();
      const file = new File([blob], 'chinatown-personality-result.png', { type: 'image/png' });
      
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
      link.download = 'chinatown-personality-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error saving image:', error);
      // Final fallback: open image in new tab
      window.open('/result/chinatown.PNG', '_blank');
    }
  };

  const handleAgain = () => {
    // Clear localStorage and go back to starting screen
    localStorage.setItem('currentQuestion', '0');
    localStorage.setItem('answerArray', JSON.stringify(new Array(14).fill(-1)));
    router.push('/');
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#E6E1C9] md:bg-[#d9d3b6]">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div className="w-full h-full max-w-xl mx-auto flex flex-col overflow-y-auto" style={{ backgroundColor: '#E6E1C9' }}>
        {/* Header with save and again buttons */}
        <div className="w-full flex justify-between items-center px-6 pt-2 pb-2">
          <button
            onClick={handleSave}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-black/10 active:scale-95"
            aria-label="Save result"
          >
            <span className="text-black text-md font-md" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
              save
            </span>
          </button>
          <button
            onClick={handleAgain}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-black/10 active:scale-95"
            aria-label="Take quiz again"
          >
            <span className="text-black text-md font-md" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
              again
            </span>
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
                src="/result/chinatown.PNG"
                alt="Your personality type: Chinatown"
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

