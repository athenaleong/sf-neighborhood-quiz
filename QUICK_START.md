# 🚀 PostHog Analytics - Quick Start Checklist

## ✅ Setup Steps (5 minutes)

### Step 1: Create PostHog Account
- [ ] Go to https://posthog.com
- [ ] Sign up (free tier: 1M events/month)
- [ ] Create a project (or use default)

### Step 2: Get Your API Key
- [ ] In PostHog, click **Project Settings** (gear icon)
- [ ] Copy your **Project API Key** (starts with `phc_...`)

### Step 3: Configure Environment
```bash
# In your terminal:
cd /Users/athenaleong/Desktop/outernet/sf-neighborhood-quiz

# Copy the example file:
cp env.example .env.local

# Edit .env.local and paste your key:
# NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
```

- [ ] Create `.env.local` file
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY=phc_...`
- [ ] Add `NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com`

### Step 4: Restart Server
```bash
npm run dev
```

- [ ] Stop current dev server (Ctrl+C)
- [ ] Start it again with `npm run dev`

### Step 5: Test It!
- [ ] Go to http://localhost:3000
- [ ] Click "Start" button
- [ ] Go to PostHog → **Live Events**
- [ ] See `start_button_clicked` event appear 🎉

---

## 📊 What's Already Implemented

### ✅ Complete Event Tracking
- [x] Home page start button
- [x] Quiz start
- [x] Every answer selection (with question & option text)
- [x] Question progression (for funnels)
- [x] Quiz completion (with all scores)
- [x] Result page views
- [x] Save/share actions
- [x] Email subscriptions
- [x] Back/retry actions

### ✅ Session Recordings
- [x] Automatically enabled
- [x] Records full user journey
- [x] Privacy-compliant (input masking)

### ✅ Funnel Support
- [x] Progress tracking at each question
- [x] Drop-off analysis ready
- [x] Conversion tracking enabled

**Total:** 11 event types tracking ~30 events per user

---

## 🎯 First Steps in PostHog

### 1. View Live Events (Immediate)
```
PostHog Dashboard → Live Events
```
- [ ] Take the quiz yourself
- [ ] Watch events appear in real-time
- [ ] Verify all event types are working

### 2. Create Your First Funnel (5 min)
```
PostHog → Insights → New Insight → Funnel
```

**Quiz Completion Funnel:**
1. Event: `quiz_started`
2. Event: `quiz_completed`

- [ ] Create the funnel
- [ ] Save as "Quiz Completion Rate"
- [ ] Add to a new dashboard

### 3. Watch Session Recording (Immediate)
```
PostHog → Session Recordings → [Pick any recording]
```
- [ ] Watch yourself (or a user) take the quiz
- [ ] See clicks, scrolls, and navigation
- [ ] Note any UX friction

### 4. Analyze Popular Answers (5 min)
```
PostHog → Insights → New Insight → Trends
```

**Question 5 Answer Distribution:**
- Event: `quiz_answer_selected`
- Filter: `question_number = 5`
- Breakdown: `option_text`
- Chart: Bar chart

- [ ] Create the trend
- [ ] Change question number to analyze different questions
- [ ] Save insights you find interesting

### 5. Check Neighborhood Distribution (5 min)
```
PostHog → Insights → New Insight → Trends
```

**Result Distribution:**
- Event: `quiz_completed`
- Breakdown: `result_neighborhood`
- Chart: Pie chart

- [ ] See which neighborhoods are most common
- [ ] Check if distribution is balanced
- [ ] Save as "Neighborhood Results"

---

## 📈 Recommended Dashboards

### Dashboard 1: "Quiz Overview" (10 min to build)

Create a new dashboard with these widgets:

1. **Total Completions** (Number)
   - Event: `quiz_completed`
   - Show: Total count

2. **Completion Rate** (Funnel %)
   - Funnel: `quiz_started` → `quiz_completed`

3. **Most Popular Result** (Pie)
   - Event: `quiz_completed`
   - Breakdown: `result_neighborhood`

4. **Email Signups** (Number)
   - Event: `email_subscribed`
   - Show: Total count

- [ ] Create "Quiz Overview" dashboard
- [ ] Add these 4 widgets
- [ ] Pin to your favorites

### Dashboard 2: "Drop-off Analysis" (15 min to build)

1. **Question Funnel** (Funnel)
   - Steps: `quiz_question_reached` for Q1, Q5, Q10, Q14

2. **Back Button Usage** (Trend)
   - Event: `quiz_back_clicked`
   - Breakdown: `from_question`

3. **Retry Rate** (Number)
   - Event: `quiz_retry_clicked`

- [ ] Create "Drop-off Analysis" dashboard
- [ ] Add these widgets
- [ ] Review weekly

---

## 🎬 Your First Analysis Session

### Recommended Workflow:

1. **Collect Data** (Wait 24-48 hours)
   - Share quiz with 10-20 people
   - Let them complete it naturally
   - Don't tell them it's being tracked (natural behavior)

2. **Watch Recordings** (30 min)
   - Watch 5-10 session recordings
   - Note: Where do users hesitate?
   - Note: Any confusing questions?
   - Note: UI elements they click accidentally?

3. **Analyze Funnels** (15 min)
   - Check completion rate
   - Find biggest drop-off points
   - Identify problematic questions

4. **Study Answer Patterns** (20 min)
   - For each question, check option distribution
   - Are some options never chosen?
   - Do certain questions have very skewed answers?

5. **Review Results** (10 min)
   - Is result distribution balanced?
   - Any neighborhoods that never/rarely appear?
   - Do email signup rates vary by neighborhood?

6. **Make Improvements** (Based on findings)
   - Reword confusing questions
   - Adjust scoring for balance
   - Improve UI based on recordings

7. **Measure Impact** (Next week)
   - Compare metrics before/after changes
   - Did completion rate improve?
   - Did email signups increase?

---

## 💡 Pro Tips

### For Development
- [x] Check browser console for "PostHog loaded" message
- [x] Use PostHog Live Events to test locally
- [x] Test in incognito mode to simulate new users

### For Production
- [ ] Set up alerts for key metrics (completion rate drops)
- [ ] Review dashboards weekly
- [ ] Watch 5-10 session recordings per week
- [ ] Export data monthly for backup

### For Analysis
- [ ] Compare weekday vs weekend behavior
- [ ] Track metrics over time (not just snapshots)
- [ ] Segment by device type (mobile vs desktop)
- [ ] Look for patterns in users who complete vs drop off

---

## 🐛 Troubleshooting

### Events Not Showing Up?

**Check 1: Environment Variable**
```bash
# In terminal:
echo $NEXT_PUBLIC_POSTHOG_KEY
```
Should show your API key. If empty, restart terminal and dev server.

**Check 2: Browser Console**
- Open DevTools → Console
- Should see "PostHog loaded"
- If you see errors, check API key is correct

**Check 3: API Key**
- Make sure it starts with `phc_`
- No extra spaces or quotes in `.env.local`
- File is named exactly `.env.local` (not `.env.local.txt`)

**Check 4: Restart Everything**
```bash
# Kill dev server
# Close terminal
# Open new terminal
cd /Users/athenaleong/Desktop/outernet/sf-neighborhood-quiz
npm run dev
```

### Session Recordings Not Appearing?

- Wait 1-2 minutes (they're processed async)
- Check PostHog: Project Settings → Recordings → Enabled
- Ensure you took actual actions (clicks, scrolls) during session

### Can't Find Event in PostHog?

- Check spelling (case-sensitive)
- Use "Live Events" not "Insights" for real-time view
- Verify event fired in browser console:
  ```javascript
  window.posthog.capture('test', {test: true})
  ```

---

## 📚 Documentation

- **Full Setup Guide:** `POSTHOG_SETUP.md`
- **Implementation Summary:** `ANALYTICS_SUMMARY.md`
- **Event Flow Diagram:** `EVENT_FLOW.md`
- **PostHog Docs:** https://posthog.com/docs

---

## ✨ You're All Set!

Once you complete this checklist, you'll have:
- ✅ Full analytics tracking
- ✅ Session recordings
- ✅ Conversion funnels
- ✅ Custom dashboards
- ✅ Data to make informed decisions

**Next:** Share your quiz with users and start collecting data! 🚀

---

## 📞 Need Help?

1. Check `POSTHOG_SETUP.md` for detailed troubleshooting
2. PostHog Community: https://posthog.com/community
3. PostHog Docs: https://posthog.com/docs
4. PostHog Support: support@posthog.com

Good luck with your quiz! 🎉

