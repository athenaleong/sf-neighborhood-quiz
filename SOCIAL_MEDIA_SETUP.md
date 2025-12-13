# Social Media Metadata Setup

This document explains the social media preview setup for the SF Neighborhood Quiz.

## What's Been Configured

### Open Graph Tags (Facebook, LinkedIn, iMessage, WhatsApp)
- **Title**: "Which SF neighborhood are you?"
- **Description**: "Take the quiz to find out which area in San Francisco you embody, from the whimsical Haight-Ashbury to the lowkey rambunctious Tenderloin."
- **Type**: website
- **Image**: `/cropped/opener-base.png` (1200x630px recommended)
- **Locale**: en_US

### Twitter Card Tags
- **Card Type**: summary_large_image (displays large preview image)
- **Title**: Same as Open Graph
- **Description**: Same as Open Graph
- **Image**: Same as Open Graph

### Meta Description
Standard meta description for SEO and other platforms that don't support Open Graph.

## Environment Setup

You need to set the `NEXT_PUBLIC_BASE_URL` environment variable:

1. Create a `.env.local` file in the root directory (if you haven't already)
2. Add the following line:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-actual-domain.com
   ```

### For Different Environments:

**Local Development:**
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Production (e.g., Vercel):**
```
NEXT_PUBLIC_BASE_URL=https://sf-neighborhood-quiz.vercel.app
```
(Replace with your actual domain)

## How to Test Social Media Previews

### 1. Facebook & LinkedIn Debugger
- Go to: https://developers.facebook.com/tools/debug/
- Enter your URL and click "Debug"
- Click "Scrape Again" if you've made changes

### 2. Twitter Card Validator
- Go to: https://cards-dev.twitter.com/validator
- Enter your URL to see the preview

### 3. iMessage & WhatsApp
- Just paste the link in the app
- The preview should appear automatically
- Note: These apps cache aggressively, so it may take time to update

### 4. General Testing Tool
- https://www.opengraph.xyz/
- Shows previews for multiple platforms at once

## Image Specifications

### Current Setup
- **Image**: `/cropped/opener-base.png`
- **Recommended Size**: 1200x630px (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **Max File Size**: < 8MB (< 1MB recommended for faster loading)

### Platform-Specific Requirements:

**Facebook/LinkedIn:**
- Minimum: 600x315px
- Recommended: 1200x630px
- Max file size: 8MB

**Twitter:**
- Minimum: 300x157px
- Recommended: 1200x628px (summary_large_image)
- Max file size: 5MB

**iMessage/WhatsApp:**
- Use Open Graph tags (same as Facebook)
- Minimum: 600x315px

## Important Notes

1. **Image Path**: The image path `/cropped/opener-base.png` is relative to the `public` folder
2. **Caching**: Social media platforms cache previews aggressively. Use their debug tools to force a refresh
3. **HTTPS**: For production, make sure your site is served over HTTPS
4. **Image Content**: Ensure the image has important content in the center (some platforms crop differently)

## Troubleshooting

### Preview not showing?
1. Check that `NEXT_PUBLIC_BASE_URL` is set correctly
2. Make sure the image exists at `/public/cropped/opener-base.png`
3. Verify the image is accessible by visiting `your-domain.com/cropped/opener-base.png`
4. Use the debug tools above to force a refresh

### Preview shows old content?
1. Clear cache using platform-specific debug tools
2. Wait 24-48 hours for caches to expire naturally
3. Try adding a query parameter to your URL (e.g., `?v=2`)

### Different image on different platforms?
1. Some platforms crop images differently
2. Consider creating a safe zone in the center of your image
3. Test on all platforms before finalizing

## Customizing for Result Pages

If you want custom previews for individual result pages (e.g., when someone shares their result), you can add metadata to those pages as well. For example, in `/app/result/page.tsx`, you could generate dynamic metadata based on the neighborhood result.



