# HubEdu.ai — Full Product Enhancement Blueprint

**Goal:** Elevate the interactive lesson experience to world-class ed-tech standards, focusing on engagement, personalization, and measurable learning outcomes — without breaking the existing architecture.

---

## 1. Lesson Experience Overhaul (Structure First)

### Objective

Increase completion rate, reduce cognitive fatigue, and create a smoother, more cinematic lesson flow — like Netflix meets Khan Academy.

### Implementation Details

#### a. Lesson Segmentation

- Divide lessons into **3 clear chapters** (4–5 slides each).
- Add a **progress bar** (`1/3 → 2/3 → 3/3`) at the top and bottom.
- Introduce micro-pauses between chapters with an animation or “breathe screen.”
- Store user position in `localStorage` to resume exactly where they left off.
- Add `chapterId` and `elapsedTime` fields in analytics events.

✅ **Success Metric:** lesson completion rate ≥ **50%** (up from ~35–40%).

---

#### b. Narration by Default

- **TTS (Text-to-Speech)** should auto-start, but allow users to toggle off.
- Sync the text dynamically using **karaoke-style highlights** (via SSML `<mark>` timestamps).
- Include playback controls: `play/pause`, `±15s`, speed (`1x, 1.25x, 1.5x, 2x`), and voice selector.
- Persist preferences across lessons.
- Optimize latency: TTS should start <800 ms after load.

✅ **Success Metric:** ≥ 60% of sessions include audio playback for ≥ 3 min.

---

#### c. Mini-Quizzes for Engagement

- Add **3 mini-quizzes** distributed every 2–3 slides.
- Use a light component: 1 question (A–D options), immediate feedback, retry option.
- Record confidence level (1–5) for adaptive logic.
- Link each mini-quiz to the nearest paragraph or slide topic.

✅ **Success Metric:** bounce rate decreases by **15%**, average session duration + 20%.

---

#### d. Image Enrichment

- Each slide should feature **1–2 AI-generated or sourced images**.
- Create pipeline:
  1. Extract keywords →
  2. Generate prompt →
  3. Call DALL-E or Stable Diffusion →
  4. Cache via Vercel Blob.
- Maintain consistent style: “Flat educational vector + pastel background.”
- Add loading placeholder (`blur-up` effect).

✅ **Success Metric:** ≥ 90% of slides include a visual element under 1.5 s load time.

---

## 2. Engagement & Retention Layer

### a. Smart Summary

At the end of each lesson:

- Auto-generate **“3 key takeaways”** and **“next lesson suggestion.”**
- Display total reading time, TTS usage, quiz accuracy.
- Button: “Generate flashcards” (using extracted keywords + short answers).

✅ **Success Metric:** ≥ 5% share rate; ≥ 10% of users click “Next Lesson.”

---

### b. Achievement System

Implement **pedagogically-driven badges** — not gamified fluff:

- “Topic Master”: ≥ 80% quiz accuracy.
- “7-Day Streak”: 7 consecutive days with any activity.
- “Subject Expert”: 10 lessons in one subject.

Backend:

```ts
achievement {
  id
  type
  condition: { metric: string, threshold: number }
  earned_at
}
```

✅ **Success Metric:** D7 retention + 10 percentage points.

---

### c. Weekly Challenge (Optional)

Push “missions”: “Complete 3 Science lessons this week scoring ≥ 70%.”

- Track via user activity log.
- Rewards: XP points + achievement badge.

✅ **Success Metric:** +20% more lessons completed per active user.

---

## 3. Light Personalization Engine

### a. Adaptive Difficulty

If a student misses 2 questions in a row:

- Inject a **short recap slide** (auto-generated summary).

If they get 2 correct:

- **Skip a redundant example** slide.

Everything must happen locally (no complex ML).
State: `needReview = true` / `canSkip = true`.

✅ **Success Metric:** +8–12 p.p. quiz accuracy improvement.

---

### b. Lesson Recommendation System

Algorithm:

```
nextLesson = (weakSubject ∩ expressedInterest) ∩ curriculumPath
```

Sources:

- Past quiz accuracy
- Favorite subjects
- BNCC sequence

Display at end of lesson with “Start Now” CTA.

✅ **Success Metric:** ≥ 18% click-through rate on recommendations.

---

## 4. Accessibility & Focus Modes

### a. Focus Mode

- Hides navigation and chat.
- Enlarges font, increases line spacing.
- Ideal for exams or deep-learning sessions.

### b. Podcast Mode

- Converts lesson narration into a continuous audio stream.
- Enables background play via **Media Session API**.
- Auto-plays next recommended lesson.

✅ **Success Metric:** average listening session ≥ 20 min.

---

## 5. Analytics and Data Visibility

### Event Schema

All major interactions must trigger tracked events:

| Event Name               | Description                | Attributes                        |
| ------------------------ | -------------------------- | --------------------------------- |
| `lesson_start`           | User begins a lesson       | `lessonId`, `subject`, `device`   |
| `slide_view`             | A slide rendered on screen | `slideIndex`, `elapsedMs`         |
| `tts_play` / `tts_pause` | Audio playback control     | `speed`, `voice`                  |
| `mini_quiz_answered`     | Question answered          | `correct`, `confidence`           |
| `quiz_completed`         | Full quiz finished         | `score`, `timeSpent`              |
| `chapter_completed`      | Section finished           | `chapterId`, `accuracy`           |
| `lesson_completed`       | Lesson finished            | `duration`, `accuracy`, `usedTTS` |
| `share_generated`        | User shared result         | `platform`                        |
| `bookmark_added`         | User saved lesson          | `lessonId`                        |

- **Batch events every 10 s**, debounce `slide_view` by 1 s.
- Respect **Do Not Track**.

### Dashboard KPIs

- Completion rate per lesson
- Average accuracy
- Avg. time / chapter
- TTS adoption rate
- Funnel: Start → Complete

✅ **Goal:** Dashboard decisions replace guesswork by Week 4.

---

## 6. Technical Roadmap (Three Sprints)

### Sprint 1 (7 days) — *UX Polish & Data Foundation*

1. Implement chapter segmentation + progress bar.
2. Enable default TTS with karaoke sync + persistent settings.
3. Add mini-quizzes + adaptive recap logic.
4. Integrate base analytics (events, batching, export CSV).

**KPIs:** completion ≥ 50%, TTS usage ≥ 50%, avg. session +15%.

---

### Sprint 2 (7 days) — *Visual & Feedback Layer*

1. Launch image generation pipeline (AI + cache).
2. Add smart summary + flashcards.
3. Implement achievement system + profile screen.
4. Enable shareable static cards (server-side render).

**KPIs:** share ≥ 5%, D2 retention +10 p.p., 90%+ slides with visuals.

---

### Sprint 3 (10 days) — *Personalization & Deep Focus*

1. Adaptive difficulty engine (rule-based).
2. Lesson recommendation system.
3. Focus / Podcast modes with Media Session support.

**KPIs:** next-lesson CTR ≥ 18%, D7 retention +10 p.p., accuracy +8 p.p.

---

## 7. New Components (Next.js / Tailwind / TypeScript)

- `ChapterProgress` — tracks progress across slides.
- `MiniQuiz` — lightweight quiz widget with instant feedback.
- `AudioControls` + `KaraokeText` — synchronized narration.
- `SummaryCard` + `FlashcardList` — auto-generated review tools.
- `AchievementBadge` — user profile gamification.
- `FocusToggle` — activates Focus or Podcast mode.

### Hooks / Services

- `useNarration()`
- `useChaptering()`
- `useAdaptiveFlow()`
- `useAnalytics()`
- `useFlashcards()`

### API Endpoints

- `POST /api/media/generate-image`
- `POST /api/flashcards`
- `POST /api/share-card`

---

## 8. Definition of Done (DoD)

- **Chapters:** reload resume within ±1 slide accuracy.
- **TTS:** sub-800 ms latency, stable speed/voice persistence.
- **Mini-Quiz:** live accuracy feedback updates adaptive state.
- **Summary:** includes 3 takeaways + 1 next-lesson CTA.
- **Images:** <1.5 s display; CDN cached; cost < R$ 6 / lesson.
- **Analytics:** 5 core metrics accessible in dashboard view.

---

## 9. Exclusions (Not in Scope for Now)

- Short-form “TikTok-style” video editor (phase 2).
- User-versus-user competition mechanics.
- ML-based personalization (manual rules cover 80% value).

---

## 10. Success Metrics After 14 Days

| Metric             | Target                    |
| ------------------ | ------------------------- |
| Lesson completion  | ≥ 50%                     |
| D7 retention       | ≥ 40%                     |
| Share rate         | ≥ 5%                      |
| Next-lesson CTR    | ≥ 18%                     |
| Avg. cost per user | Stable with image caching |

---

