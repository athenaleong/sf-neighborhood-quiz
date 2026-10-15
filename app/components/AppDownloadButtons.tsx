'use client';

import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';

type AppAction = 'ios_app_store_clicked' | 'android_waitlist_opened' | 'android_waitlist_joined';

export default function AppDownloadButtons({ onAction }: { onAction: (action: AppAction) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const buttonClass = 'flex min-h-[38px] min-w-0 flex-1 items-center justify-center gap-1 rounded-full bg-[#ACDBFB] px-1.5 py-1.5 text-[13px] leading-5 font-bold text-[#00446c] shadow-sm transition-opacity @max-[329px]:text-xs @[343px]:gap-1.5 @[343px]:px-2 @[343px]:text-sm md:@[480px]:min-h-11 md:@[480px]:gap-2 md:@[480px]:px-4 md:@[480px]:py-2 md:@[480px]:text-base hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00446c]';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');

    try {
      const response = await fetch('/api/android-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) throw new Error('Waitlist signup failed');
      setStatus('success');
      setEmail('');
      onAction('android_waitlist_joined');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="@container" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <div className="mx-auto flex w-full max-w-[408px] items-center gap-2 md:max-w-lg md:gap-3">
        <a
          href="https://apps.apple.com/app/apple-store/id6757144052?pt=128855169&ct=sf_neighborhood_quiz&mt=8"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          onClick={() => onAction('ios_app_store_clicked')}
        >
          <Image src="/apple.svg" alt="" width={20} height={20} className="h-4 w-4 shrink-0 object-contain md:h-5 md:w-5" />
          <span className="whitespace-nowrap">Download iOS App</span>
        </a>
        <button
          type="button"
          className={`${buttonClass} cursor-pointer`}
          onClick={() => {
            dialogRef.current?.showModal();
            onAction('android_waitlist_opened');
          }}
        >
          <Image src="/google-play.png" alt="" width={20} height={20} className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
          <span className="whitespace-nowrap">Pre-order Android</span>
        </button>
      </div>

      <div
        className="mt-2.5 text-center md:mt-6"
        role="img"
        aria-label="4.9 out of 5 stars, loved by 25k+ adventurers"
      >
        <div className="flex items-center justify-center gap-[8.4px]">
          <span className="text-[21px] font-black leading-none text-[#86C9F2] md:text-3xl">4.9</span>
          <span className="relative inline-flex items-center text-[18.9px] leading-none tracking-[0.06em] text-[#F3B61F] md:text-[27px]" aria-hidden="true">
            <span className="inline-block">★★★★</span>
            <span className="relative inline-block">
              <span className="opacity-20">★</span>
              <span className="absolute inset-0" style={{ clipPath: 'inset(0 10% 0 0)' }}>★</span>
            </span>
            <span className="absolute top-0 left-[30%] text-[6.3px] leading-none text-[#FFF8D8]">✦</span>
            <span className="absolute top-[2.8px] right-[13%] text-[4.9px] leading-none text-[#FFF8D8]">✦</span>
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-4 font-medium tracking-[0.02em] text-[#00446c]/75 md:mt-1 md:text-sm md:leading-5">loved by 25k+ adventurers</p>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="android-waitlist-title"
        aria-describedby="android-waitlist-description"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-2xl bg-white p-8 text-center text-[#00446c] shadow-xl backdrop:bg-black/50"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
              dialogRef.current?.close();
            }
          }
        }}
      >
        <button
          type="button"
          aria-label="Close Android waitlist"
          onClick={() => dialogRef.current?.close()}
          className="absolute right-2 top-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-2xl text-gray-400 hover:text-gray-600 focus-visible:outline-2"
        >
          ×
        </button>
        <Image src="/google-play.png" alt="" width={48} height={48} className="mx-auto mb-4" />
        <h2 id="android-waitlist-title" className="mb-2 text-2xl font-bold">Pre-order Android</h2>
        <p id="android-waitlist-description" className="mb-6 text-sm">
          Be the first to know when Outernet<br />launches on Android!
        </p>
        {status === 'success' ? (
          <p role="status" className="text-sm text-green-700">you&apos;re in!</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="android-waitlist-email" className="sr-only">Email address</label>
            <input
              id="android-waitlist-email"
              type="email"
              autoComplete="email"
              placeholder="yourcoolemail@mail.com"
              required
              maxLength={254}
              value={email}
              disabled={status === 'loading'}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === 'error') setStatus('idle');
              }}
              className="mb-4 w-full rounded-full border border-gray-300 px-4 py-3 text-base text-[#00446c] outline-none placeholder:text-gray-400 focus:border-[#00446c] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full cursor-pointer rounded-full bg-[#00446c] py-3 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {status === 'loading' ? 'submitting...' : 'Join Waitlist'}
            </button>
            {status === 'error' && <p role="alert" className="mt-3 text-sm text-red-600">oops! please try again</p>}
          </form>
        )}
      </dialog>
    </div>
  );
}
