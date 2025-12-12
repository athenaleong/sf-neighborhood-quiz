# PostHog Analytics Setup Guide

This guide will help you set up PostHog analytics and understand what's being tracked in your SF Neighborhood Quiz.

## Quick Start

### 1. Create a PostHog Account

1. Go to [https://posthog.com](https://posthog.com)
2. Sign up for a free account (1M events/month free)
3. Create a new project or use the default one

### 2. Get Your API Key

1. In PostHog dashboard, go to **Project Settings** (gear icon in left sidebar)
2. Copy your **Project API Key** (starts with `phc_...`)

### 3. Configure Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your PostHog API key:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_api_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### 4. Restart Your Development Server

```bash
npm run dev
```

That's it! PostHog is now tracking events.

---

## What's Being Tracked

### 📊 Quiz Flow Events

#### 1. **Quiz Started**
- **Event:** `quiz_started`
- **When:** User lands on `/quiz` page
- **Properties:**
  - `total_questions`: 14

#### 2. **Answer Selected**
- **Event:** `quiz_answer_selected`
- **When:** User selects an option for any question
- **Properties:**
  - `question_number`: 1-14
  - `question_text`: Full question text
  - `option_index`: 0-based index of selected option
  - `option_text`: Full text of selected option
  - `progress`: e.g., "5/14"

#### 3. **Question Reached**
- **Event:** `quiz_question_reached`
- **When:** User progresses to next question
- **Properties:**
  - `question_number`: 1-15 (15 is final)
  - `progress`: e.g., "6/14"

#### 4. **Quiz Completed**
- **Event:** `quiz_completed`
- **When:** User answers all 14 questions
- **Properties:**
  - `result_neighborhood`: Final result (e.g., "castro", "mission")
  - `total_score`: Winning neighborhood's score
  - `all_scores`: Object with all neighborhood scores
  - `tied_neighborhoods`: Array if there was a tie
  - `answers`: Array of all answer indices [0-14]

### 🏠 Home Page Events

#### 5. **Start Button Clicked**
- **Event:** `start_button_clicked`
- **When:** User clicks "Start" button on home page
- **Properties:**
  - `page`: "home"

### 🎯 Result Page Events

#### 6. **Result Page Viewed**
- **Event:** `result_page_viewed`
- **When:** User lands on result page
- **Properties:**
  - `neighborhood`: Result neighborhood key
  - `neighborhood_name`: Full neighborhood name

#### 7. **Result Saved/Shared**
- **Event:** `result_save_clicked`, `result_shared`, `result_downloaded`, `result_opened_new_tab`
- **When:** User clicks save/share button
- **Properties:**
  - `neighborhood`: Result neighborhood
  - `method`: "web_share_api" | "download" | "new_tab"

#### 8. **Play Again Clicked**
- **Event:** `result_again_clicked`
- **When:** User clicks "Play Again" on results
- **Properties:**
  - `neighborhood`: Current result

#### 9. **Email Subscribed**
- **Event:** `email_subscribed`
- **When:** User successfully subscribes to email list
- **Properties:**
  - `neighborhood`: Result neighborhood key
  - `neighborhood_name`: Full neighborhood name

### 🔄 Navigation Events

#### 10. **Back Button Clicked**
- **Event:** `quiz_back_clicked`
- **When:** User clicks back button during quiz
- **Properties:**
  - `from_question`: Current question number
  - `to_question`: Previous question number

#### 11. **Retry Clicked**
- **Event:** `quiz_retry_clicked`
- **When:** User clicks retry button during quiz
- **Properties:**
  - `at_question`: Question where retry was clicked
  - `progress`: e.g., "8/14"

---

## Viewing Your Data in PostHog

### Session Recordings 🎥

Session recordings are **automatically enabled**. To view them:

1. Go to **Session Recordings** in PostHog sidebar
2. Click any recording to watch user interactions
3. See mouse movements, clicks, and page navigations

**Privacy Note:** Session recordings respect user privacy and mask sensitive input by default.

### Creating Funnels 📉

Track drop-off rates through the quiz:

1. Go to **Insights** → **New Insight** → **Funnel**
2. Create a funnel with these steps:
   ```
   1. start_button_clicked
   2. quiz_started
   3. quiz_question_reached (question_number = 7)  // Halfway point
   4. quiz_completed
   5. result_page_viewed
   ```
3. Save and view conversion rates

Example funnel use cases:
- **Quiz completion rate:** `quiz_started` → `quiz_completed`
- **Full journey:** `start_button_clicked` → `quiz_completed` → `result_page_viewed`
- **Email conversion:** `result_page_viewed` → `email_subscribed`

### Analyzing Answer Patterns 📊

Create insights to see which answers are most popular:

1. Go to **Insights** → **New Insight** → **Trends**
2. Select event: `quiz_answer_selected`
3. Filter by: `question_number = 5` (or any question)
4. Breakdown by: `option_text`
5. See which options are chosen most frequently

### Neighborhood Distribution 🗺️

See which neighborhoods users get most often:

1. **Insights** → **Trends**
2. Event: `quiz_completed`
3. Breakdown by: `result_neighborhood`
4. View as pie chart

---

## Advanced: Custom Dashboards

Create a custom dashboard with these widgets:

### Dashboard: "Quiz Health"

1. **Total Completions** (Trend)
   - Event: `quiz_completed`
   - Show: Total count over time

2. **Completion Rate** (Funnel)
   - Steps: `quiz_started` → `quiz_completed`
   - Show: Conversion %

3. **Average Time to Complete** (Property)
   - Event: `quiz_completed`
   - Calculate session duration

4. **Drop-off Points** (Funnel)
   - Track each question: `quiz_question_reached` for Q1-Q14

5. **Most Popular Results** (Trend)
   - Event: `quiz_completed`
   - Breakdown: `result_neighborhood`

6. **Email Signup Rate** (Funnel)
   - `result_page_viewed` → `email_subscribed`

---

## Troubleshooting

### Events Not Showing Up?

1. **Check environment variable:**
   ```bash
   echo $NEXT_PUBLIC_POSTHOG_KEY
   ```
   Should show your API key starting with `phc_`

2. **Check browser console:**
   - Open DevTools → Console
   - Look for "PostHog loaded" message (in development)
   - Check for any errors

3. **Verify in PostHog:**
   - Go to **Live Events** in PostHog
   - Should see events appearing in real-time

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Session Recordings Not Working?

- Session recordings may take 1-2 minutes to appear
- Check your PostHog plan includes recordings (free tier includes it)
- Verify in PostHog: **Project Settings** → **Recordings** → Enable

### Testing Events Locally

```javascript
// In browser console, test PostHog:
window.posthog.capture('test_event', { test: true })
```

Then check **Live Events** in PostHog dashboard.

---

## Privacy & GDPR Compliance

PostHog is GDPR-compliant by default:

1. **Data location:** EU cloud available
2. **Cookie consent:** Implement if required for your region
3. **User anonymization:** PostHog generates anonymous user IDs
4. **Data deletion:** Users can request deletion via PostHog API

### Disabling for Specific Users

To respect Do Not Track or cookie preferences:

```typescript
// Add to PostHogProvider.tsx
if (navigator.doNotTrack === '1') {
  posthog.opt_out_capturing();
}
```

---

## Self-Hosting (Optional)

If you prefer to self-host PostHog:

1. Follow [PostHog self-hosting guide](https://posthog.com/docs/self-host)
2. Update `.env.local`:
   ```
   NEXT_PUBLIC_POSTHOG_HOST=https://your-posthog-instance.com
   ```

---

## Next Steps

1. ✅ Set up PostHog (you're done!)
2. 📊 Create your first funnel
3. 🎥 Watch session recordings
4. 📈 Build a custom dashboard
5. 🔔 Set up alerts for key metrics

## Support

- **PostHog Docs:** https://posthog.com/docs
- **PostHog Community:** https://posthog.com/community
- **PostHog Support:** support@posthog.com


