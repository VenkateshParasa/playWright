# Achievements & Gamification System

A comprehensive gamification system for the Playwright & Selenium Learning Platform featuring achievements, XP/leveling, daily challenges, leaderboards, and streak tracking.

## 📋 Features Implemented

### 1. Achievement System (30+ Badges)
- **Learning Achievements**: First Steps, Novice Learner, Dedicated Student, Knowledge Seeker, Master Student
- **Quiz Achievements**: Quiz Taker, Test Champion, Perfect Score, Perfectionist
- **Exercise Achievements**: Code Warrior, Bug Squasher, Code Ninja
- **Flashcard Achievements**: Memory Builder, Recall Master, Memory Champion, Mastery Mind
- **Streak Achievements**: Consistent, Dedicated, Unstoppable, Legendary Streak
- **Daily Challenge Achievements**: Challenger, Daily Champion
- **Special Achievements**: Night Owl, Early Bird, Weekend Warrior, Speed Runner
- **Time-based Achievements**: Focused Learner, Time Master
- **Level Achievements**: Rising Star, Expert, Grandmaster

### 2. XP & Level System
- Progressive XP requirements (level² × 100)
- 50 levels with titles: Novice → Intermediate → Advanced → Expert → Master → Legend → Grandmaster
- Real-time XP tracking and level progression
- Visual XP bars with animations
- Level-based rewards and unlocks

### 3. Daily Challenges
- 3 daily challenges reset at midnight
- Challenge types: Lessons, Quizzes, Flashcards
- Progress tracking for each challenge
- Bonus XP for completing all challenges
- Dynamic generation based on date

### 4. Leaderboard
- Sort by XP, Level, or Streak
- Top 10 players display
- Current user highlighting
- Rank badges for top 3 (Gold, Silver, Bronze)
- Real-time updates

### 5. Streak Tracking
- Daily activity tracking
- Current streak and longest streak
- Streak achievements
- Integration with existing StreakCounter component

### 6. Achievement Notifications
- Animated achievement unlock notifications
- Confetti effects
- XP reward display
- Badge tier showcase
- Auto-dismiss or manual close

## 🗂️ File Structure

```
frontend/src/
├── pages/
│   └── Achievements.tsx                  # Main achievements page
├── components/achievements/
│   ├── AchievementBadge.tsx             # Badge component with tier styling
│   ├── AchievementList.tsx              # Grid view with filters
│   ├── AchievementNotification.tsx      # Unlock animation
│   ├── Leaderboard.tsx                  # Top players list
│   ├── DailyChallenge.tsx               # Daily challenge card
│   ├── LevelProgress.tsx                # Level progression display
│   ├── XPBar.tsx                        # XP progress bar
│   └── index.ts                         # Component exports
├── stores/
│   └── achievementsStore.ts             # Zustand store
├── data/
│   └── achievements.ts                   # Achievement definitions
└── lib/achievements/
    └── achievementEngine.ts              # Activity tracking utilities

backend/src/
├── models/
│   └── UserProgress.ts                   # MongoDB schema
├── controllers/
│   └── achievementsController.ts         # Business logic
├── routes/
│   └── achievements.ts                   # API endpoints
└── utils/
    └── achievements.ts                   # Shared utilities
```

## 🎮 Usage

### Frontend

#### Display Achievements Page
```tsx
import Achievements from './pages/Achievements';

function App() {
  return <Achievements />;
}
```

#### Track User Activities
```tsx
import { useActivityTracker } from './lib/achievements/achievementEngine';

function LessonPage() {
  const { trackLessonCompleted, trackStudySession } = useActivityTracker();

  const handleLessonComplete = async () => {
    await trackLessonCompleted({ lessonId: '123' });
    await trackStudySession({ duration: 30, activitiesCount: 1 });
  };

  return <button onClick={handleLessonComplete}>Complete Lesson</button>;
}
```

#### Display Achievement Badge
```tsx
import { AchievementBadge } from './components/achievements';

function MyComponent() {
  const achievement = {
    id: 'first_lesson',
    name: 'First Steps',
    icon: '🎓',
    unlocked: true,
    // ... other properties
  };

  return <AchievementBadge achievement={achievement} size="large" />;
}
```

#### Show Achievement Notifications
```tsx
import { AchievementNotification } from './components/achievements';

function App() {
  const [notification, setNotification] = useState(null);

  return (
    <AchievementNotification
      achievement={notification}
      onClose={() => setNotification(null)}
    />
  );
}
```

### Backend

#### API Endpoints

```
GET    /api/achievements/progress              # Get user progress
GET    /api/achievements/achievements          # Get all achievements
GET    /api/achievements/achievements/unseen   # Get unseen achievements
POST   /api/achievements/achievements/seen     # Mark achievements as seen
GET    /api/achievements/leaderboard           # Get leaderboard
GET    /api/achievements/daily-challenges      # Get daily challenges
POST   /api/achievements/xp/award             # Award XP
POST   /api/achievements/activity             # Update activity
```

#### Track Activities
```typescript
// Lesson completed
await fetch('/api/achievements/activity', {
  method: 'POST',
  body: JSON.stringify({
    activityType: 'lesson_completed',
    data: { lessonId: '123' }
  })
});

// Quiz completed
await fetch('/api/achievements/activity', {
  method: 'POST',
  body: JSON.stringify({
    activityType: 'quiz_completed',
    data: { passed: true, score: 95 }
  })
});

// Flashcard reviewed
await fetch('/api/achievements/activity', {
  method: 'POST',
  body: JSON.stringify({
    activityType: 'flashcard_reviewed',
    data: { count: 10, mastered: true }
  })
});
```

## 🎨 Component Props

### AchievementBadge
```typescript
interface AchievementBadgeProps {
  achievement: Achievement & {
    unlocked?: boolean;
    progress?: number;
    percentage?: number;
  };
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  onClick?: () => void;
}
```

### AchievementList
```typescript
interface AchievementListProps {
  achievements: Achievement[];
  isLoading?: boolean;
}
```

### Leaderboard
```typescript
interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
}
```

### DailyChallenge
```typescript
interface DailyChallengeProps {
  challenges: DailyChallengeType[];
  allCompleted?: boolean;
  isLoading?: boolean;
}
```

### LevelProgress
```typescript
interface LevelProgressProps {
  currentLevel: number;
  totalXP: number;
  showDetails?: boolean;
}
```

### XPBar
```typescript
interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}
```

## 🔧 Configuration

### Achievement Tiers
- **Bronze**: Entry-level achievements
- **Silver**: Intermediate achievements
- **Gold**: Advanced achievements
- **Platinum**: Expert achievements
- **Diamond**: Legendary achievements

### XP Rewards by Tier
- Bronze: 50-100 XP
- Silver: 150-300 XP
- Gold: 400-750 XP
- Platinum: 800-1000 XP
- Diamond: 2000+ XP

### Level Formula
```
XP Required = level² × 100
Total XP = Σ(i² × 100) for i = 1 to level
```

### Daily Challenges
- Resets at midnight local time
- 3 challenges per day
- Bonus 150 XP for completing all challenges

## 🎯 Achievement Categories

1. **Learning**: Completing lessons and courses
2. **Practice**: Taking quizzes and exercises
3. **Mastery**: Achieving excellence and perfection
4. **Social**: Community engagement (future)
5. **Special**: Rare and unique achievements

## 🚀 Future Enhancements

- [ ] Social features (friend challenges, team achievements)
- [ ] Achievement collections and sets
- [ ] Seasonal/limited-time achievements
- [ ] Achievement point shop (rewards store)
- [ ] Custom badges and themes
- [ ] Achievement sharing on social media
- [ ] Weekly/monthly challenges
- [ ] Achievement milestones with special rewards
- [ ] Prestige system for max-level users
- [ ] Achievement statistics and analytics

## 📊 Database Schema

### UserProgress Model
```typescript
{
  userId: ObjectId,
  totalXP: Number,
  currentLevel: Number,
  unlockedAchievements: [{
    achievementId: String,
    unlockedAt: Date,
    notificationSeen: Boolean
  }],
  achievementProgress: Map<String, Number>,
  streak: {
    currentStreak: Number,
    longestStreak: Number,
    lastActivityDate: Date
  },
  dailyChallenges: [{
    date: String,
    challenges: Array,
    allCompleted: Boolean
  }],
  // Activity counters
  lessonsCompleted: Number,
  quizzesCompleted: Number,
  quizzesPassed: Number,
  perfectQuizzes: Number,
  exercisesCompleted: Number,
  flashcardsReviewed: Number,
  masteredFlashcards: Number,
  totalStudyTime: Number,
  // Special counters
  nightOwlCount: Number,
  earlyBirdCount: Number,
  weekendWarriorCount: Number,
  speedRunnerCount: Number
}
```

## 🔐 Authentication

All API endpoints require authentication. Include credentials in requests:
```typescript
fetch('/api/achievements/progress', {
  credentials: 'include'
});
```

## 🎨 Styling

The system uses Tailwind CSS with:
- Framer Motion for animations
- Lucide React for icons
- Custom gradient backgrounds
- Responsive design (mobile, tablet, desktop)
- Dark mode compatible (future)

## 📝 Notes

- Achievements are checked and unlocked automatically on activity updates
- XP is awarded immediately upon achievement unlock
- Level progression is calculated in real-time
- Streak tracking requires daily activity (any learning action)
- Daily challenges are seeded by date for consistency
- Leaderboard updates in near real-time
- Achievement progress is stored in MongoDB for persistence
- Frontend store uses Zustand with persistence

## 🐛 Troubleshooting

### Achievements not unlocking
- Check that activity tracking is being called
- Verify backend API is responding
- Check MongoDB connection
- Review achievement conditions in achievements.ts

### XP not updating
- Ensure `updateActivity` is called after actions
- Check that user progress is being saved
- Verify XP calculation in backend

### Notifications not showing
- Check `unseenAchievements` in store
- Verify `fetchUnseenAchievements` is called
- Ensure notification component is rendered

## 📄 License

Part of the Playwright & Selenium Learning Platform project.
