# PostHog A/B Test Setup Guide: Result Page Layout Experiment

## 🎯 Experiment Overview

**Test Name:** Result Page Layout Order  
**Feature Flag Key:** `result-layout-order`  
**Hypothesis:** Changing the order of elements on the result page will affect user engagement rates

### Variants:

1. **Control** (33%): Buttons → Result Picture → Email (current design)
2. **Variant A** (33%): Buttons → Email → Result Picture  
3. **Variant B** (34%): Email → Result Picture → Buttons

### Goal Metrics:

- **Primary:** `email_subscribed` (email conversion rate)
- **Secondary:**
  - `result_save_clicked` (save button clicks)
  - `result_again_clicked` (again button clicks)
  - `website_link_clicked` (website link clicks)

---

## 📋 Setup Steps in PostHog

### Step 1: Create the Experiment

1. **Log into PostHog** at https://app.posthog.com
2. Click **Experiments** in the left sidebar
3. Click **New Experiment**

### Step 2: Configure Basic Settings

```
Name: Result Page Layout Order
Feature flag key: result-layout-order
Description: Testing different element orders on result page to optimize engagement
```

### Step 3: Set Up Variants

Click **Add variant** to create three variants:

**Control:**
```
Name: Control (Buttons → Picture → Email)
Key: control
Rollout: 33%
```

**Variant A:**
```
Name: Variant A (Buttons → Email → Picture)
Key: variant-a
Rollout: 33%
```

**Variant B:**
```
Name: Variant B (Email → Picture → Buttons)
Key: variant-b
Rollout: 34%
```

### Step 4: Set Goal Metrics

**Primary Goal:**
```
Event name: email_subscribed
Type: Conversion rate
Description: Email signup conversion rate
```

**Secondary Goals** (click "+ Add goal metric"):

1. **Save Button:**
   ```
   Event name: result_save_clicked
   Type: Conversion rate
   ```

2. **Again Button:**
   ```
   Event name: result_again_clicked
   Type: Conversion rate
   ```

3. **Website Link:**
   ```
   Event name: website_link_clicked
   Type: Conversion rate
   ```

### Step 5: Set Participant Filters (Optional)

By default, all users will be included. You can optionally filter by:
- Device type (mobile vs desktop)
- Location
- Returning vs new users

**Recommended:** Start with all users (no filters)

### Step 6: Save as Draft

Click **Save as draft** (don't start yet!)

---

## 🧪 Testing Locally Before Launch

### 1. Test in Development

Make sure your `.env.local` has PostHog configured:
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Manually Test Each Variant

Open your browser console and manually set the feature flag:

**Test Control (default):**
```javascript
// In browser console:
window.posthog.featureFlags.override({'result-layout-order': 'control'})
// Then complete a quiz and check result page layout
```

**Test Variant A:**
```javascript
window.posthog.featureFlags.override({'result-layout-order': 'variant-a'})
// Complete quiz - should see: Buttons → Email → Picture
```

**Test Variant B:**
```javascript
window.posthog.featureFlags.override({'result-layout-order': 'variant-b'})
// Complete quiz - should see: Email → Picture → Buttons
```

**Clear override:**
```javascript
window.posthog.featureFlags.override({})
```

### 3. Verify Events Are Tracked

1. Complete the quiz with each variant
2. In PostHog, go to **Live Events**
3. Verify you see:
   - `experiment_viewed` with `variant` property
   - `result_save_clicked` with `layout_variant` property
   - `email_subscribed` with `layout_variant` property
   - `result_again_clicked` with `layout_variant` property
   - `website_link_clicked` with `layout_variant` property

---

## 🚀 Launch the Experiment

### Once Testing Looks Good:

1. Go back to **Experiments** in PostHog
2. Find your "Result Page Layout Order" experiment
3. Click **Launch**
4. PostHog will start:
   - Randomly assigning users to variants
   - Tracking conversions
   - Calculating statistical significance

---

## 📊 Monitoring Results

### Where to Check Results:

1. **Experiments Dashboard:**
   - Go to **Experiments** → "Result Page Layout Order"
   - View conversion rates for each variant
   - Check statistical significance

2. **What You'll See:**

```
┌───────────────────────────────────────────────────┐
│ Result Page Layout Order                          │
├───────────────────────────────────────────────────┤
│ Status: Running (X days)                          │
│ Participants: XXX                                 │
├───────────────────────────────────────────────────┤
│ PRIMARY GOAL: email_subscribed                    │
│                                                   │
│ Control     XXX users → XX converted = XX%        │
│ Variant A   XXX users → XX converted = XX%        │
│ Variant B   XXX users → XX converted = XX%        │
│                                                   │
│ Winner: TBD (need more data / XX% confident)     │
├───────────────────────────────────────────────────┤
│ SECONDARY GOALS:                                  │
│ result_save_clicked                               │
│   Control: XX%  Variant A: XX%  Variant B: XX%   │
│ result_again_clicked                              │
│   Control: XX%  Variant A: XX%  Variant B: XX%   │
│ website_link_clicked                              │
│   Control: XX%  Variant A: XX%  Variant B: XX%   │
└───────────────────────────────────────────────────┘
```

### Checking Progress:

Visit daily/weekly to see:
- **Participant count:** How many users have been enrolled
- **Conversion rates:** % of users who completed each goal
- **Statistical significance:** Are results reliable?
- **Confidence level:** How confident PostHog is in the winner

---

## ⏱️ How Long to Run?

### Minimum Requirements:
- **At least 100 conversions** per variant for primary goal
- **At least 1 week** to capture weekly patterns
- **95%+ statistical significance** before making a decision

### Example Timeline:

If you get 50 quiz completions per day:
- **Day 1-2:** Not enough data yet
- **Day 3-5:** Early trends emerging
- **Week 1:** Patterns becoming clearer
- **Week 2-3:** Likely have enough data for decision

**Don't peek too early!** Wait for statistical significance.

---

## 🎉 After the Experiment Concludes

### Scenario 1: Clear Winner

If one variant has:
- ✅ 95%+ confidence
- ✅ Meaningful improvement (e.g., +10% email signups)

**Action:**
1. In PostHog → Experiments → "Result Page Layout Order"
2. Click **Roll out** on the winning variant
3. This sets the feature flag to 100% for that variant
4. All users now see the winning layout!

### Scenario 2: No Clear Winner

If after 2-3 weeks:
- No variant reaches 95% confidence
- Differences are minimal (< 5%)

**Action:**
1. **Stop the experiment**
2. Keep the control (original design)
3. Try testing a different hypothesis

### Scenario 3: Surprising Result

If Variant B (Email first) performs worst:
- This tells you users want to see/share result before email signup
- Insight: Prioritize result visibility
- Future test: Maybe test call-to-action wording instead

---

## 🔍 Deep Dive Analysis

### Beyond the Dashboard:

1. **Segment by Neighborhood:**
   ```
   Question: Does layout preference vary by result?
   - Filter events by neighborhood property
   - See if Castro users behave differently than Mission users
   ```

2. **Device Analysis:**
   ```
   Question: Do mobile users behave differently?
   - Break down by device type
   - Mobile might prefer email-first (less scrolling)
   ```

3. **Session Recordings:**
   ```
   - Watch recordings filtered by each variant
   - See how users actually interact with each layout
   - Spot unexpected behaviors
   ```

### Creating Custom Insights:

**Email Conversion by Variant:**
```
Insight Type: Trends
Event: email_subscribed
Breakdown: $feature/result-layout-order
Chart: Bar chart
```

**Save Button Clicks by Variant:**
```
Insight Type: Trends  
Event: result_save_clicked
Breakdown: layout_variant
Chart: Bar chart
```

---

## 🛠️ Troubleshooting

### Problem: No users being enrolled

**Check:**
1. Is experiment status "Running" (not "Draft")?
2. Do you have PostHog API key in `.env.local`?
3. Is your site deployed/accessible to users?
4. Check browser console for PostHog errors

### Problem: Events not showing variant info

**Check:**
1. Are users seeing the result page? (Check `result_page_viewed` count)
2. Is `experiment_viewed` firing? (Check Live Events)
3. Feature flag working? Test with console override

### Problem: One variant has way more users

**Check:**
- Rollout percentages (should be 33%/33%/34%)
- If very uneven after 100+ users, might be a bug
- Try resetting the experiment

---

## 💡 Pro Tips

### 1. Don't Stop Early
Even if you see a trend on Day 2, wait for significance. Early data can be misleading.

### 2. Watch Multiple Metrics
Email signups might increase but save button clicks decrease. Consider the full picture.

### 3. Segment Analysis
Different user types might prefer different layouts. Use PostHog's breakdown features.

### 4. Session Recordings
Watch 10-20 recordings per variant to understand *why* one performs better.

### 5. Document Learnings
Whether you win or lose, document what you learned for future tests.

---

## 📝 Experiment Checklist

### Before Launch:
- [ ] Experiment created in PostHog
- [ ] Three variants configured (33%/33%/34%)
- [ ] Goal metrics set (primary + secondary)
- [ ] Tested all variants locally
- [ ] Verified events are tracked with variant info
- [ ] Confirmed code is deployed to production

### During Experiment:
- [ ] Check results daily (but don't make decisions yet!)
- [ ] Monitor for any technical issues
- [ ] Watch session recordings
- [ ] Wait for 95%+ significance

### After Experiment:
- [ ] Document results
- [ ] Roll out winner (or keep control)
- [ ] Share learnings with team
- [ ] Plan next experiment

---

## 🎓 What You'll Learn

This experiment will tell you:

1. **When do users want to sign up?**
   - Before seeing their result? (Variant B)
   - After engaging with result? (Control/Variant A)

2. **Does CTA position matter?**
   - Email at bottom (control) vs middle (Variant A) vs top (Variant B)

3. **What's the priority for users?**
   - Share first, then email?
   - Email first, then share?

4. **Mobile vs Desktop differences?**
   - Do mobile users prefer less scrolling (email first)?

---

## 🚀 Ready to Launch?

### Quick Checklist:
1. ✅ PostHog experiment configured
2. ✅ Tested all three variants locally
3. ✅ Events tracking properly
4. ✅ Code deployed to production
5. ✅ Click "Launch" in PostHog!

### Expected Timeline:
- **Week 1:** Early data
- **Week 2-3:** Actionable results
- **End of Week 3:** Make decision

Good luck with your experiment! 🎉

---

## 📞 Need Help?

- **PostHog Docs:** https://posthog.com/docs/experiments
- **PostHog Community:** https://posthog.com/community
- **Your experiment view:** https://app.posthog.com/experiments

Remember: Even "failed" experiments teach you something valuable! 🧪

