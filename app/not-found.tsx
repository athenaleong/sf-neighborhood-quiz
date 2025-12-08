'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.push('/');
  }, [router]);

  // Show loading animation while redirecting
  return (
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
  );
}

