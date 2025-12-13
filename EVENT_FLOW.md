# PostHog Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY & EVENTS                         │
└─────────────────────────────────────────────────────────────────────┘

📱 HOME PAGE (/)
│
│  [User sees animated home screen]
│
└──► 🔘 Click "Start" button
     │
     └──► EVENT: start_button_clicked
          • page: "home"


📝 QUIZ PAGE (/quiz)
│
└──► EVENT: quiz_started
     • total_questions: 14
     
     
┌─── Question 0 (Story Opener) ───┐
│  [User reads intro story]        │
│  └─► Select option               │
│      └─► Proceed to Q1           │
└──────────────────────────────────┘


┌─── Question 1-14 ────────────────┐
│                                   │
│  [User reads question]            │
│  └─► Select option                │
│      │                            │
│      └──► EVENT: quiz_answer_selected
│           • question_number: 1-14
│           • question_text: "..."
│           • option_index: 0-2
│           • option_text: "..."
│           • progress: "5/14"
│      │                            │
│      └──► EVENT: quiz_question_reached
│           • question_number: 2-15
│           • progress: "6/14"
│      │                            │
│      └─► [Repeat for next Q]     │
│                                   │
│  Optional actions:                │
│  • 🔙 Click Back                 │
│    └──► EVENT: quiz_back_clicked
│         • from_question: 5
│         • to_question: 4
│                                   │
│  • 🔄 Click Retry                │
│    └──► EVENT: quiz_retry_clicked
│         • at_question: 5
│         • progress: "5/14"
│                                   │
└───────────────────────────────────┘


[After Q14 answered]
│
└──► EVENT: quiz_completed
     • result_neighborhood: "castro"
     • total_score: 42
     • all_scores: { castro: 42, mission: 38, ... }
     • tied_neighborhoods: ["castro", "mission"] (if tie)
     • answers: [0, 2, 1, 3, ...]


🎯 RESULT PAGE (/result?neighborhood=castro)
│
└──► EVENT: result_page_viewed
     • neighborhood: "castro"
     • neighborhood_name: "Castro"
     
     
┌─── Result Actions ──────────────┐
│                                  │
│  💾 Click "Save" button          │
│  └──► EVENT: result_save_clicked
│       • neighborhood: "castro"
│       │                          │
│       └─► [Share/Download]       │
│           ├─► EVENT: result_shared
│           │   • neighborhood: "castro"
│           │   • method: "web_share_api"
│           │                      │
│           ├─► EVENT: result_downloaded
│           │   • neighborhood: "castro"
│           │   • method: "download"
│           │                      │
│           └─► EVENT: result_opened_new_tab
│               • neighborhood: "castro"
│                                  │
│  🔄 Click "Play Again"           │
│  └──► EVENT: result_again_clicked
│       • neighborhood: "castro"
│       └─► [Navigate to home]     │
│                                  │
│  📧 Submit Email                 │
│  └──► EVENT: email_subscribed
│       • neighborhood: "castro"
│       • neighborhood_name: "Castro"
│                                  │
└──────────────────────────────────┘


═══════════════════════════════════════════════════════════════════

📊 EVENT SUMMARY

Total Event Types: 11

1.  start_button_clicked       - User initiates quiz
2.  quiz_started               - Quiz page loaded
3.  quiz_answer_selected       - Every answer (14x per user)
4.  quiz_question_reached      - Progress tracking (14x per user)
5.  quiz_completed             - Full quiz finished
6.  result_page_viewed         - Result displayed
7.  result_save_clicked        - Save initiated
8.  result_shared              - Shared via Web Share API
9.  result_downloaded          - Downloaded as image
10. result_opened_new_tab      - Opened in new tab (fallback)
11. email_subscribed           - Email captured
12. quiz_back_clicked          - Back navigation (optional)
13. quiz_retry_clicked         - Quiz abandoned (optional)
14. result_again_clicked       - Replay intent

═══════════════════════════════════════════════════════════════════

🔥 EXAMPLE: Full Happy Path

1. start_button_clicked         [Home]
2. quiz_started                 [Quiz Start]
3. quiz_answer_selected × 14    [Each question]
4. quiz_question_reached × 14   [Progress tracking]
5. quiz_completed               [Finish]
6. result_page_viewed           [See result]
7. result_save_clicked          [Try to save]
8. result_shared                [Successfully shared]
9. email_subscribed             [Sign up]
10. result_again_clicked        [Play again]

Total events per user: ~30 events (happy path)

═══════════════════════════════════════════════════════════════════

📈 FUNNEL EXAMPLES

┌─ Quiz Completion Funnel ──────────┐
│                                    │
│  1. quiz_started          100%     │
│     ↓                               │
│  2. quiz_question_reached   90%    │
│     (question_number = 7)          │
│     ↓                               │
│  3. quiz_completed           75%   │
│                                    │
│  Insight: 25% drop-off rate        │
└────────────────────────────────────┘

┌─ Email Conversion Funnel ─────────┐
│                                    │
│  1. result_page_viewed     100%    │
│     ↓                               │
│  2. email_subscribed        15%    │
│                                    │
│  Insight: 15% email capture rate   │
└────────────────────────────────────┘

┌─ Full Journey Funnel ─────────────┐
│                                    │
│  1. start_button_clicked   100%    │
│     ↓                               │
│  2. quiz_started            95%    │
│     ↓                               │
│  3. quiz_completed          70%    │
│     ↓                               │
│  4. result_page_viewed      68%    │
│     ↓                               │
│  5. email_subscribed        10%    │
│                                    │
│  End-to-end conversion: 10%        │
└────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

🎬 SESSION RECORDINGS

PostHog automatically records:
• ✅ Mouse movements
• ✅ Clicks and taps
• ✅ Scrolling behavior  
• ✅ Page navigations
• ✅ Element interactions
• ✅ Rage clicks (frustration)
• ✅ Form interactions (masked)

View in: PostHog Dashboard → Session Recordings

═══════════════════════════════════════════════════════════════════

🎯 KEY METRICS TO MONITOR

1. Completion Rate
   quiz_started → quiz_completed
   Target: >70%

2. Question Drop-off
   quiz_question_reached by question_number
   Identify: Which questions lose users?

3. Popular Answers
   quiz_answer_selected breakdown by option_text
   Insight: What do users choose?

4. Result Distribution
   quiz_completed breakdown by result_neighborhood
   Insight: Balanced results?

5. Email Capture
   result_page_viewed → email_subscribed
   Target: >15%

6. Retry/Abandon Rate
   quiz_retry_clicked count
   Lower is better

7. Share Rate
   result_page_viewed → (result_shared OR result_downloaded)
   Target: >20%

═══════════════════════════════════════════════════════════════════
```



