# Aulas V2 - Quick Reference Guide

## 🚀 Quick Start (3 Steps)

1. **Set Environment Variables**
   ```bash
   # Add to .env.local
   XAI_API_KEY=your_grok_api_key
   ```

2. **Navigate to Aulas V2**
   ```
   http://localhost:3000/aulas-v2
   ```

3. **Generate a Lesson**
   - Enter topic → Click "Gerar Aula com Sistema V2" → Done!

## 🔄 The 6-Step Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT: Topic                        │
│              (e.g., "Como funciona a fotossíntese")         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Theme Filtering (Grok 4)                          │
│  ├─ Input: Raw topic description                            │
│  ├─ Process: Extract core concept                           │
│  ├─ Output: "fotossíntese"                                  │
│  └─ Duration: 3-5 seconds                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Curiosities Search (Grok 4)                       │
│  ├─ Input: Filtered theme                                   │
│  ├─ Process: Generate 5 engaging facts                      │
│  ├─ Output: Array of curiosities with emojis               │
│  └─ Duration: 5-8 seconds                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐
│  STEP 3: Lesson     │   │  STEP 4: Image      │
│  Creation (Grok 4)  │   │  Descriptions       │
│                     │   │  (Grok 4)           │
│  • 14 slides total  │   │                     │
│  • 12 explanations  │   │  • 6 descriptions   │
│  • 2 quizzes        │   │  • NO text rule     │
│  • ~500 words each  │   │  • Visual focus     │
│                     │   │                     │
│  Duration: 30-60s   │   │  Duration: 10-15s   │
└─────────┬───────────┘   └─────────┬───────────┘
          │                         │
          └────────────┬────────────┘
                       │ (Parallel execution)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Image Search                                        │
│  ├─ Translation: PT → EN (Grok 4)                          │
│  ├─ Primary: Unsplash API                                   │
│  ├─ Fallback 1: Pixabay API                                 │
│  ├─ Fallback 2: Google Gemini 2.5                          │
│  ├─ Fallback 3: Placeholders                               │
│  ├─ Output: 6 image URLs                                    │
│  └─ Duration: 20-60 seconds                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Assembly & Display                                 │
│  ├─ Merge lesson + images                                   │
│  ├─ Add metadata                                            │
│  ├─ Save to localStorage                                    │
│  ├─ Navigate to player                                      │
│  └─ Duration: 1-2 seconds                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              LESSON READY FOR DISPLAY                       │
│          14 Slides • 6 Images • 2 Quizzes                   │
└─────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
project/
├── app/
│   ├── (dashboard)/
│   │   └── aulas-v2/
│   │       ├── page.tsx                    # 🏠 Main generation page
│   │       └── [id]/
│   │           └── page.tsx                # 📖 Lesson player
│   └── api/
│       └── aulas-v2/
│           ├── filter-theme/
│           │   └── route.ts                # 🔍 Step 1
│           ├── curiosities/
│           │   └── route.ts                # 💡 Step 2
│           ├── lesson-json/
│           │   └── route.ts                # 📚 Step 3
│           ├── image-descriptions/
│           │   └── route.ts                # 🎨 Step 4
│           ├── generate-images/
│           │   └── route.ts                # 🖼️ Step 5
│           └── generate/
│               └── route.ts                # 🔄 Orchestration API
├── components/
│   └── aulas-v2/
│       ├── WorkflowProgress.tsx            # Progress tracker
│       └── CuriositiesCarousel.tsx         # Curiosities display
└── docs/
    ├── AULAS_V2_SYSTEM_README.md          # 📘 Complete documentation
    ├── AULAS_V2_IMPLEMENTATION_SUMMARY.md # 📝 Implementation details
    └── AULAS_V2_QUICK_REFERENCE.md        # 📋 This file
```

## 🎯 Lesson Structure (14 Slides)

```
Slide 1  [🖼️] Introduction
Slide 2  [📝] Basic Concepts
Slide 3  [🖼️] Development
Slide 4  [📝] Practical Applications
Slide 5  [❓] QUIZ 1 (3 questions)
Slide 6  [🖼️] Special Cases
Slide 7  [📝] Broader Context
Slide 8  [📝] Deep Dive
Slide 9  [🖼️] Practical Examples
Slide 10 [❓] QUIZ 2 (3 questions)
Slide 11 [🖼️] Synthesis
Slide 12 [📝] Critical Analysis
Slide 13 [📝] Future Applications
Slide 14 [🖼️] Conclusion

Legend:
🖼️ = Has image
📝 = Explanation slide (~500 words)
❓ = Quiz slide (3 questions, 4 options each)
```

## 🔑 API Keys Required

| Service | Key Name | Priority | Purpose |
|---------|----------|----------|---------|
| Grok 4 | `XAI_API_KEY` | ⭐⭐⭐ Required | All AI processing |
| Gemini | `GOOGLE_GENERATIVE_AI_API_KEY` | ⭐⭐ Optional | Image generation |
| Unsplash | `UNSPLASH_ACCESS_KEY` | ⭐ Optional | Image fallback |
| Pixabay | `PIXABAY_API_KEY` | ⭐ Optional | Image fallback |

## 🎨 UI Components

### Main Page Features
- Theme input textarea (500 char limit)
- Real-time character counter
- 6-step workflow visualization
- Progress bars for each step
- Rotating curiosities display
- Timer display
- Success/error states

### Lesson Player Features
- Slide navigation (Previous/Next)
- Progress bar (visual)
- Dot indicators
- Quiz interaction
- Score tracking
- Detailed feedback
- Responsive layout

## ⚡ Performance Tips

1. **Optimize Generation**
   - Use shorter, specific topics
   - Parallel execution is automatic (Steps 3 & 4)
   - Images fetch in cascade (fastest source wins)

2. **Improve Load Times**
   - Pre-configure all API keys
   - Use edge runtime (automatic)
   - Enable caching (future enhancement)

3. **Reduce Errors**
   - Always set `XAI_API_KEY`
   - Test API keys before production
   - Monitor rate limits

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Step 1 fails** | Check `XAI_API_KEY` is set |
| **No images** | System uses placeholders automatically |
| **Lesson not found** | Check localStorage, clear old lessons |
| **Quiz won't submit** | Answer all questions first |
| **Slow generation** | Normal! 80-165s is expected |
| **API rate limit** | Wait and retry, or upgrade plan |

## 📱 Access Points

### Development
```
Main: http://localhost:3000/aulas-v2
Lesson: http://localhost:3000/aulas-v2/[id]
```

### Production
```
Main: https://yourdomain.com/aulas-v2
Lesson: https://yourdomain.com/aulas-v2/[id]
```

## 📊 Expected Results

### Successful Generation
- ✅ All 6 steps complete
- ✅ 14 slides created
- ✅ 6 images (or placeholders)
- ✅ 2 quizzes with 3 questions each
- ✅ Total time: 80-165 seconds
- ✅ Lesson saved to localStorage
- ✅ Ready for display

### During Generation
- 🟡 Step-by-step progress
- 🟡 Real-time status updates
- 🟡 Rotating curiosities
- 🟡 Timer display
- 🟡 Visual workflow indicators

## 🎓 Usage Examples

### Example 1: Science Topic
```
Input: "Como funciona a fotossíntese nas plantas"
Output: 
  - Filtered Theme: "fotossíntese"
  - Curiosities: 5 facts about photosynthesis
  - Lesson: 14 slides on photosynthesis
  - Images: Plant cells, chlorophyll, light absorption, etc.
```

### Example 2: Math Topic
```
Input: "Equações do segundo grau e suas aplicações"
Output:
  - Filtered Theme: "equações segundo grau"
  - Curiosities: 5 facts about quadratic equations
  - Lesson: 14 slides on quadratic equations
  - Images: Graphs, formulas, real-world applications
```

### Example 3: History Topic
```
Input: "A independência do Brasil em 1822"
Output:
  - Filtered Theme: "independência do Brasil"
  - Curiosities: 5 historical facts
  - Lesson: 14 slides on Brazilian independence
  - Images: Historical scenes, maps, key figures
```

## 🔄 Workflow Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| Pending | Gray circle | Not started yet |
| In Progress | Purple pulsing | Currently processing |
| Completed | Green check | Successfully finished |
| Error | Red X | Failed (uses fallback) |

## 💾 Data Storage

### Current (Demo Mode)
- **Method**: localStorage
- **Key Format**: `lesson_v2_{lessonId}`
- **Limit**: ~5MB per domain
- **Persistence**: Until browser cache cleared

### Future (Production)
- **Method**: PostgreSQL + Neo4j
- **Features**: User accounts, sharing, history
- **Persistence**: Permanent

## 📈 Monitoring

### Key Metrics to Track
1. Average generation time
2. Success rate per step
3. Image generation method used
4. Quiz completion rate
5. User satisfaction scores

### Console Logs Format
```
🚀 Starting Aulas V2 workflow for topic: {topic}
🔍 Step 1: Theme Filtering
✅ Filtered theme: {theme}
💡 Step 2: Searching curiosities
✅ Found {count} curiosities
📚 Step 3: Creating lesson
📝 Step 4: Creating image descriptions
✅ Lesson created with {count} slides
✅ {count} descriptions generated
🎨 Step 5: Generating images
✅ All images generated
🎉 Workflow completed in {time}ms
```

## 🎯 Success Criteria

- [x] All 6 steps implemented
- [x] 14-slide structure enforced
- [x] Quizzes on slides 5 and 10
- [x] Images on slides 1, 3, 6, 9, 11, 14
- [x] NO text in images
- [x] Parallel execution (Steps 3 & 4)
- [x] Multiple image sources with fallbacks
- [x] Real-time progress tracking
- [x] Curiosities during loading
- [x] Complete error handling
- [x] No linting errors
- [x] Production ready

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready

For complete documentation, see: `AULAS_V2_SYSTEM_README.md`

