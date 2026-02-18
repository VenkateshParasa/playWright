# Flashcard Review Interface - Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Flashcards Page                               │
│                    (pages/Flashcards.tsx)                            │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Welcome Screen                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │   │
│  │  │  Stats   │  │Categories│  │ Features │                  │   │
│  │  │  Cards   │  │ Overview │  │Highlights│                  │   │
│  │  └──────────┘  └──────────┘  └──────────┘                  │   │
│  │         [Start Review Session Button]                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              OR                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   ReviewSession                              │   │
│  │           (components/flashcards/ReviewSession.tsx)          │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │            Session Header                            │    │   │
│  │  │  ┌──────────────┐  ┌────────┐  ┌────────────┐      │    │   │
│  │  │  │ ProgressBar  │  │ Timer  │  │  Controls  │      │    │   │
│  │  │  └──────────────┘  └────────┘  └────────────┘      │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                               │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐  │   │
│  │  │     Main Content        │  │       Sidebar           │  │   │
│  │  │  ┌─────────────────┐    │  │  ┌────────────────┐    │  │   │
│  │  │  │   FlashCard     │    │  │  │   CardDeck     │    │  │   │
│  │  │  │   (3D Flip)     │    │  │  │   (Preview)    │    │  │   │
│  │  │  └─────────────────┘    │  │  └────────────────┘    │  │   │
│  │  │  ┌─────────────────┐    │  │  ┌────────────────┐    │  │   │
│  │  │  │ QualityButtons  │    │  │  │ SessionStats   │    │  │   │
│  │  │  │   (0-5 Rating)  │    │  │  │  (Live Stats)  │    │  │   │
│  │  │  └─────────────────┘    │  │  └────────────────┘    │  │   │
│  │  └─────────────────────────┘  └─────────────────────────┘  │   │
│  │                                                               │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │        Keyboard Shortcuts Reference                  │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              OR                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Results Screen                             │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ Cards    │  │ Accuracy │  │   Time   │  │ Correct  │   │   │
│  │  │ Reviewed │  │    %     │  │  Spent   │  │ Answers  │   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────┐       │   │
│  │  │      Performance Breakdown (Rating Distribution) │       │   │
│  │  └─────────────────────────────────────────────────┘       │   │
│  │                                                              │   │
│  │      [Start New Session]  [Back to Dashboard]              │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Zustand Session Store                        │
│                   (stores/sessionStore.ts)                       │
│                                                                   │
│  State:                                                          │
│  ├── currentSession: ReviewSession | null                       │
│  ├── currentCardIndex: number                                   │
│  ├── isFlipped: boolean                                         │
│  ├── isPaused: boolean                                          │
│  ├── undoHistory: CardReview[]                                  │
│  ├── dueCards: FlashCard[]                                      │
│  └── cardStartTime: number                                      │
│                                                                   │
│  Actions:                                                        │
│  ├── startSession(cards)      ──→ Initialize session            │
│  ├── endSession()              ──→ Finalize & save              │
│  ├── flipCard()                ──→ Toggle isFlipped             │
│  ├── togglePause()             ──→ Toggle isPaused              │
│  ├── reviewCard(id, quality)  ──→ Record review & advance       │
│  ├── undoLastReview()          ──→ Revert last action           │
│  ├── skipCard()                ──→ Skip to next                 │
│  ├── nextCard()                ──→ Move forward                 │
│  └── resetSession()            ──→ Clear all state              │
│                                                                   │
│  Persistence: localStorage (auto-sync)                          │
└─────────────────────────────────────────────────────────────────┘
         ↑                                    ↓
         │                                    │
    Read State                          Update State
         │                                    │
         ↓                                    ↑
┌─────────────────────────────────────────────────────────────────┐
│                      React Components                            │
│                                                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐        │
│  │ FlashCard   │───→│ ReviewSession│←───│QualityButtons│       │
│  └─────────────┘    └──────────────┘    └─────────────┘        │
│                             ↕                                     │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐        │
│  │ ProgressBar │    │ SessionStats │    │  CardTimer  │        │
│  └─────────────┘    └──────────────┘    └─────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Card Review Process

```
1. User Starts Session
   │
   ├──→ Flashcards.tsx: handleStartSession()
   │
   ├──→ sessionStore.ts: startSession(mockFlashcards)
   │    └──→ Creates ReviewSession
   │    └──→ Sets dueCards
   │    └──→ Resets currentCardIndex to 0
   │
   └──→ Renders ReviewSession component

2. User Views Card (Front)
   │
   ├──→ FlashCard renders with isFlipped=false
   │
   ├──→ CardTimer starts counting
   │
   ├──→ User presses Space or clicks card
   │
   └──→ ReviewSession: flipCard()
        └──→ sessionStore: isFlipped = true

3. User Views Answer (Back)
   │
   ├──→ FlashCard flips to back side (600ms animation)
   │
   ├──→ QualityButtons become visible
   │
   ├──→ User presses 0-5 or clicks button
   │
   └──→ ReviewSession: handleRating(quality)
        │
        ├──→ sessionStore: reviewCard(cardId, quality)
        │    └──→ Records CardReview
        │    └──→ Updates session stats
        │    └──→ Adds to undoHistory
        │
        ├──→ If quality >= 4: Show motivational message
        │
        └──→ Move to next card or complete session

4. Session Complete
   │
   ├──→ ReviewSession: onComplete()
   │
   ├──→ sessionStore: endSession()
   │    └──→ Sets endTime
   │    └──→ Calculates final stats
   │
   └──→ Flashcards.tsx: Shows Results Screen
```

## Keyboard Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│            User Keyboard Input                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│   ReviewSession: useEffect keyboard listener                 │
│                                                               │
│   handleKeyPress(event)                                      │
│   │                                                           │
│   ├── event.code === 'Space'                                │
│   │   └──→ flipCard()                                       │
│   │                                                           │
│   ├── event.key in ['0','1','2','3','4','5']               │
│   │   └──→ handleRating(parseInt(event.key))               │
│   │                                                           │
│   ├── event.code === 'ArrowRight'                           │
│   │   └──→ skipCard()                                       │
│   │                                                           │
│   └── (Ctrl/Cmd + Z)                                        │
│       └──→ handleUndo()                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          Session Store Action Executed                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          Component Re-renders with New State                 │
└─────────────────────────────────────────────────────────────┘
```

## Component Dependencies

```
FlashCard
├── Props: card, isFlipped, onFlip
├── Dependencies: framer-motion
└── Renders: Card with 3D flip animation

QualityButtons
├── Props: onRate, disabled
├── Dependencies: framer-motion
└── Renders: 6 rating buttons (0-5)

ProgressBar
├── Props: current, total
├── Dependencies: framer-motion
└── Renders: Animated progress bar

CardTimer
├── Props: isPaused, onReset
├── Dependencies: useState, useEffect
└── Renders: Counting timer with color coding

SessionStats
├── Props: session, currentTime
├── Dependencies: framer-motion
└── Renders: 6 stat cards

CardDeck
├── Props: cards, currentIndex
├── Dependencies: none
└── Renders: Deck preview and breakdown

ReviewSession
├── Props: onComplete
├── Dependencies: ALL above components + sessionStore
└── Orchestrates: Complete review flow
```

## File Size Breakdown

```
Component Files:
├── FlashCard.tsx          ~3.0 KB
├── QualityButtons.tsx     ~2.1 KB
├── ProgressBar.tsx        ~0.9 KB
├── CardTimer.tsx          ~1.4 KB
├── SessionStats.tsx       ~3.0 KB
├── CardDeck.tsx           ~3.6 KB
└── ReviewSession.tsx      ~7.1 KB
                          ─────────
                    Total: ~21.1 KB

Supporting Files:
├── Flashcards.tsx        ~10.2 KB
├── Flashcards.css        ~27.0 KB
├── sessionStore.ts        ~4.5 KB
├── flashcard.types.ts     ~1.5 KB
└── mockFlashcards.ts      ~5.8 KB
                          ─────────
                    Total: ~49.0 KB

Total Implementation: ~70 KB (uncompressed)
Estimated Gzipped: ~20 KB
```

## Animation Timeline

```
Card Flip Animation:
┌───────────────────────────────────────────────────────┐
│ Duration: 600ms                                        │
│ Type: Spring                                           │
│ Stiffness: 100                                         │
│                                                        │
│ 0ms    ──→  Front face visible, rotateY = 0°         │
│ 300ms  ──→  Card at 90°, transition point            │
│ 600ms  ──→  Back face visible, rotateY = 180°        │
└───────────────────────────────────────────────────────┘

Progress Bar Animation:
┌───────────────────────────────────────────────────────┐
│ Duration: 300ms                                        │
│ Easing: ease-out                                       │
│                                                        │
│ 0ms    ──→  Previous width                            │
│ 300ms  ──→  New width (animated)                      │
└───────────────────────────────────────────────────────┘

Motivational Overlay:
┌───────────────────────────────────────────────────────┐
│ Entrance: 300ms (scale 0.8 → 1.0)                    │
│ Display: 2000ms                                        │
│ Exit: 300ms (scale 1.0 → 0.8)                        │
│                                                        │
│ Total: 2600ms                                          │
└───────────────────────────────────────────────────────┘
```

## Memory Management

```
Session Store (Zustand):
├── Persisted State (localStorage)
│   ├── currentSession
│   ├── currentCardIndex
│   ├── undoHistory
│   └── dueCards
│
├── Runtime Only
│   ├── isFlipped
│   ├── isPaused
│   └── cardStartTime
│
└── Cleanup on resetSession()

Component Lifecycle:
├── Mount: Subscribe to store
├── Update: Re-render on state change
└── Unmount: Cleanup listeners
```

---

This architecture provides:
- Clear separation of concerns
- Predictable state flow
- Easy debugging
- Maintainable codebase
- Excellent performance
