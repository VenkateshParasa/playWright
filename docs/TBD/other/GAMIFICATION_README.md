# 🎮 Gamification System - Quick Start Guide

## Overview

Welcome to the comprehensive gamification system for the Playwright & Selenium Learning Platform! This system transforms learning into an engaging, rewarding experience through achievements, XP progression, quests, competitions, and social features.

## ✨ Features at a Glance

- 🏆 **50+ Achievements** across 7 categories
- 📊 **100 Levels** with exponential XP progression
- 🎯 **Quest System** with daily, weekly, story, and seasonal quests
- 🏅 **Competitions** including tournaments, head-to-head, and team events
- 🛍️ **Reward Shop** with 30+ cosmetic and utility items
- 📈 **Leaderboards** with multiple timeframes and categories
- 🔥 **Streak System** to encourage daily engagement
- 👥 **Social Features** for community engagement

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Import Gamification Data**
   ```bash
   # Import achievements
   mongoimport --db playwright --collection achievements --file src/data/achievements.json --jsonArray

   # Import quests
   mongoimport --db playwright --collection quests --file src/data/quests.json --jsonArray

   # Import rewards
   mongoimport --db playwright --collection rewards --file src/data/rewards.json --jsonArray
   ```

3. **Start Backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   ```bash
   # .env.local
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open browser: http://localhost:5173
   - Navigate to Achievements, Quests, Leaderboard, or Reward Shop

## 📚 Core Concepts

### XP and Leveling

**How to Earn XP:**
- Complete a lesson: 100 XP
- Pass a quiz: 150 XP (250 for perfect score)
- Complete an exercise: 200 XP
- Review flashcards: 10 XP each
- Maintain daily streak: 50 XP/day
- Help other users: 50 XP

**Level Progression:**
- Levels 1-100
- Formula: `100 * (level ^ 1.5)`
- Each level unlocks new features and rewards

### Achievements

**Categories:**
1. Learning - Lesson and course completion
2. SRS - Flashcard mastery
3. Speed - Fast completion times
4. Quality - High scores and accuracy
5. Consistency - Streaks and daily goals
6. Social - Helping others
7. Special - Unique challenges

**Tiers:**
- Bronze (500-1000 XP)
- Silver (1000-2500 XP)
- Gold (2500-5000 XP)
- Platinum (5000-10000 XP)

### Quests

**Types:**
- **Daily**: 3 quests/day, reset at midnight
- **Weekly**: 5 quests/week, reset Monday
- **Story**: Multi-chapter narratives
- **Tutorial**: Onboarding for new users
- **Seasonal**: Limited-time events

### Competitions

**Types:**
- Weekly Challenges
- Monthly Tournaments
- Head-to-Head (1v1)
- Team Competitions
- Speed Challenges
- Quiz Battles

### Reward Shop

**Items Available:**
- Avatars (200-2000 coins)
- Profile Frames (600-1500 coins)
- Badges (100-2000 coins)
- Titles (50-3000 coins)
- XP Boosters (300-2000 coins)
- Utility Items (Streak Freeze, Card Skips)

## 🔧 Integration

### Track User Activity

```typescript
import { useGamificationStore } from '@/stores/gamificationStore';

const { trackActivity } = useGamificationStore();

// After lesson completion
const result = await trackActivity('lesson_completed', {
  lessonId: '123',
  timeSpent: 300
});

// Check for level up
if (result.leveledUp) {
  showLevelUpModal(result.newLevel);
}

// Check for new achievements
if (result.newAchievements.length > 0) {
  showAchievementModal(result.newAchievements);
}
```

### Display XP Bar

```tsx
import { XPBar } from '@/components/gamification/XPBar';
import { useGamificationStore } from '@/stores/gamificationStore';

function Header() {
  const { userProgress } = useGamificationStore();

  return (
    <XPBar
      totalXP={userProgress?.totalXP || 0}
      showLevel
      showNumbers
      animate
    />
  );
}
```

### Show Achievements

```tsx
import { AchievementCard } from '@/components/gamification/AchievementCard';

function AchievementsDisplay() {
  const { achievements } = useGamificationStore();

  return (
    <div className="grid grid-cols-4 gap-4">
      {achievements.map(achievement => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
        />
      ))}
    </div>
  );
}
```

## 📖 API Reference

### Achievement Endpoints

```
GET    /api/gamification/progress
GET    /api/gamification/achievements
GET    /api/gamification/achievements/unseen
POST   /api/gamification/achievements/seen
POST   /api/gamification/activity
```

### Quest Endpoints

```
GET    /api/gamification/quests
GET    /api/gamification/quests/daily
POST   /api/gamification/quests/:questId/start
```

### Reward Endpoints

```
GET    /api/gamification/rewards
POST   /api/gamification/rewards/:rewardId/purchase
GET    /api/gamification/inventory
POST   /api/gamification/inventory/equip
```

### Competition Endpoints

```
GET    /api/gamification/competitions
GET    /api/gamification/competitions/active
POST   /api/gamification/competitions/:competitionId/join
```

### Leaderboard Endpoints

```
GET    /api/gamification/leaderboard?type=xp&limit=100&timeFrame=weekly
GET    /api/gamification/leaderboard/rank
```

## 🎯 Usage Examples

### Complete Daily Quests

1. Navigate to Quests page
2. View 3 daily quests
3. Complete activities listed
4. Progress tracked automatically
5. Rewards granted on completion

### Climb the Leaderboard

1. Navigate to Leaderboard page
2. Select leaderboard type (XP, Level, Streak)
3. Choose timeframe (All-time, Monthly, Weekly, Daily)
4. View your rank and top 100
5. Compete to climb higher

### Purchase Rewards

1. Navigate to Reward Shop
2. Browse items by type/rarity
3. Check your coin balance
4. Purchase desired items
5. Equip items in inventory

### Join a Competition

1. Navigate to Competitions page
2. Browse active/upcoming competitions
3. Check entry requirements
4. Join competition
5. Complete activities to score points
6. View real-time leaderboard

## 🎨 Customization

### XP Values

Edit `backend/src/services/gamificationService.ts`:

```typescript
export const XP_VALUES = {
  LESSON_COMPLETED: 100,
  QUIZ_PASSED: 150,
  // Modify values as needed
};
```

### Achievement Definitions

Edit `backend/src/data/achievements.json`:

```json
{
  "achievementId": "custom_achievement",
  "name": "Custom Achievement",
  "description": "Your description",
  "category": "learning",
  "tier": "gold",
  "xpReward": 2500,
  "coinReward": 500,
  "requirement": {
    "type": "lessons_completed",
    "value": 50
  }
}
```

### Quest Definitions

Edit `backend/src/data/quests.json`:

```json
{
  "questId": "custom_quest",
  "name": "Custom Quest",
  "type": "daily",
  "difficulty": "medium",
  "requirements": [
    {
      "type": "complete_lessons",
      "value": 5,
      "description": "Complete 5 lessons"
    }
  ],
  "rewards": {
    "xp": 500,
    "coins": 100
  }
}
```

## 🐛 Troubleshooting

### XP Not Updating

**Problem**: XP doesn't increase after activities

**Solution**:
1. Check `trackActivity` is called after each activity
2. Verify API connectivity
3. Check browser console for errors
4. Ensure user is authenticated

### Achievements Not Unlocking

**Problem**: Achievements don't unlock when requirements met

**Solution**:
1. Verify achievement requirements in database
2. Check `checkAchievements` logic in service
3. Ensure user stats are updating correctly
4. Review backend logs

### Leaderboard Not Loading

**Problem**: Leaderboard shows empty or errors

**Solution**:
1. Check database connection
2. Verify indexes exist on UserGamification
3. Ensure users have opted-in to leaderboard
4. Check API endpoint response

## 📊 Analytics

Track key metrics:

```typescript
// Monitor engagement
- Daily active users with gamification
- Average XP per user
- Achievement unlock rate
- Quest completion rate
- Competition participation rate
- Reward shop conversion rate
- Streak retention rate

// Use analytics to:
- Identify popular features
- Optimize XP/coin values
- Balance difficulty
- Create new content
```

## 🔐 Security

### Best Practices

1. **Validate on Backend**: Always validate XP/coin awards server-side
2. **Prevent Cheating**: Rate limit activity tracking endpoints
3. **Sanitize Input**: Validate all user inputs
4. **Secure Transactions**: Use transactions for coin purchases
5. **Audit Logs**: Log all gamification events

### Anti-Cheat Measures

```typescript
// Rate limiting example
app.use('/api/gamification/activity', rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // max 100 requests per minute
}));
```

## 📈 Performance

### Optimization Tips

1. **Cache User Data**: Cache gamification data in store
2. **Batch Updates**: Update leaderboards every 5-15 minutes
3. **Lazy Load**: Load achievements/quests on demand
4. **Indexes**: Ensure proper database indexes
5. **CDN**: Serve static assets from CDN

### Database Indexes

```javascript
// Required indexes
UserGamification: { userId: 1 } (unique)
UserGamification: { totalXP: -1 }
UserGamification: { currentLevel: -1 }
UserGamification: { currentStreak: -1 }
Achievement: { achievementId: 1 } (unique)
Competition: { competitionId: 1 } (unique)
Competition: { status: 1, startDate: 1 }
```

## 📚 Documentation

Full documentation available:

- [GAMIFICATION_GUIDE.md](./docs/GAMIFICATION_GUIDE.md) - Complete feature guide
- [ACHIEVEMENT_LIST.md](./docs/ACHIEVEMENT_LIST.md) - All 50+ achievements
- [QUEST_SYSTEM.md](./docs/QUEST_SYSTEM.md) - Quest system details
- [COMPETITION_RULES.md](./docs/COMPETITION_RULES.md) - Competition guidelines
- [GAMIFICATION_IMPLEMENTATION.md](./GAMIFICATION_IMPLEMENTATION.md) - Implementation details

## 🤝 Support

Need help?

1. Check documentation
2. Review code examples
3. Test in development
4. Check backend logs
5. Open an issue

## 🎉 Success Metrics

Track your gamification success:

- **Engagement**: Daily active users increase
- **Retention**: Streak maintenance rates
- **Completion**: Course completion increase
- **Community**: Social feature usage
- **Monetization**: Premium feature adoption

## 🚀 Next Steps

1. Complete backend/frontend setup
2. Import sample data
3. Test core features
4. Customize for your needs
5. Monitor user engagement
6. Iterate and improve

---

**Version**: 1.0.0
**Last Updated**: February 2026
**Status**: Production Ready ✅

Happy Gamifying! 🎮
