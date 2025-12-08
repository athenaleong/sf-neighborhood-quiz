import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FontLoader from "./components/FontLoader";
import { PHProvider } from "./components/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Which SF neighborhood are you?",
  description: "Take the quiz to find out which area in San Francisco you embody, from the whimsical Haight-Ashbury to the lowkey rambunctious Tenderloin.",
  metadataBase: new URL('https://www.outernet.now'),
  openGraph: {
    title: "Which SF neighborhood are you?",
    description: "Take the quiz to find out which area in San Francisco you embody, from the whimsical Haight-Ashbury to the lowkey rambunctious Tenderloin.",
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SF Neighborhood Quiz",
    images: [
      {
        url: "/cropped/preview.png",
        width: 1200,
        height: 630,
        alt: "SF Neighborhood Quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which SF neighborhood are you?",
    description: "Take the quiz to find out which area in San Francisco you embody, from the whimsical Haight-Ashbury to the lowkey rambunctious Tenderloin.",
    images: ["/cropped/opener-base.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/FOT-RodinBokutoh Pro EB.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/FOT-Seurat Pro B.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PHProvider>
          <FontLoader />
          {children}
        </PHProvider>
      </body>
    </html>
  );
}