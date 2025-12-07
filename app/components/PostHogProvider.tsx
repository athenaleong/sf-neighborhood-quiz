'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog on the client side
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
      
      if (apiKey) {
        posthog.init(apiKey, {
          api_host: host,
          // Enable session recordings
          session_recording: {
            recordCrossOriginIframes: true,
          },
          // Capture pageviews automatically
          capture_pageview: true,
          // Capture pageleave events for better funnel tracking
          capture_pageleave: true,
          // Useful for debugging
          loaded: () => {
            if (process.env.NODE_ENV === 'development') {
              console.log('PostHog loaded');
            }
          },
        });
      }
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

