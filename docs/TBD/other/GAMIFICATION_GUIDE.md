# Gamification System Guide

## Overview

The Playwright & Selenium Learning Platform features a comprehensive gamification system designed to enhance user engagement through achievements, XP progression, quests, rewards, competitions, and social features.

## Table of Contents

1. [XP and Leveling System](#xp-and-leveling-system)
2. [Achievement System](#achievement-system)
3. [Quest System](#quest-system)
4. [Reward Shop](#reward-shop)
5. [Competition System](#competition-system)
6. [Leaderboards](#leaderboards)
7. [Streaks and Consistency](#streaks-and-consistency)
8. [Social Features](#social-features)
9. [API Reference](#api-reference)

## XP and Leveling System

### How XP Works

Experience Points (XP) are earned through various activities on the platform:

| Activity | XP Earned |
|----------|-----------|
| Complete a lesson | 100 XP |
| Pass a quiz | 150 XP |
| Perfect quiz score (100%) | 250 XP |
| Complete an exercise | 200 XP |
| Review a flashcard | 10 XP |
| Master a flashcard | 50 XP |
| Daily login | 25 XP |
| Maintain daily streak | 50 XP |
| Help another user | 50 XP |
| Forum post | 30 XP |

### Level Progression

- Levels range from 1 to 100
- XP required for each level increases exponentially: `100 * (level ^ 1.5)`
- Example progression:
  - Level 1: 100 XP
  - Level 2: 283 XP (cumulative: 383)
  - Level 5: 1,118 XP (cumulative: 2,283)
  - Level 10: 3,162 XP (cumulative: 19,263)
  - Level 50: 35,355 XP (cumulative: 588,349)

### XP Multipliers

- **Streak Multipliers**: Maintain daily streaks for bonus XP
- **Boosters**: Purchase XP boosters from the reward shop
  - Small Booster: 1.5x for 24 hours
  - Medium Booster: 2x for 24 hours
  - Large Booster: 3x for 24 hours
  - Mega Booster: 5x for 12 hours

### Level Titles

| Level Range | Title |
|-------------|-------|
| 1-4 | Beginner |
| 5-9 | Novice |
| 10-19 | Apprentice |
| 20-29 | Practitioner |
| 30-39 | Expert |
| 40-49 | Master |
| 50-74 | Grandmaster |
| 75-99 | Legend |
| 100 | Mythic |

### Prestige System

- Upon reaching Level 100, users can "prestige" to reset their level with special bonuses
- Prestige bonuses include:
  - Exclusive cosmetic items
  - Permanent XP multiplier increase
  - Special prestige badge
  - Access to prestige-only competitions

## Achievement System

### Achievement Categories

1. **Learning**: Completing lessons, courses, and topics
2. **SRS**: Flashcard reviews and mastery
3. **Speed**: Fast completion times
4. **Quality**: High scores and perfect attempts
5. **Consistency**: Daily streaks and regular study
6. **Social**: Helping others, forum participation
7. **Special**: Easter eggs, unique challenges

### Achievement Tiers

- **Bronze**: Entry-level achievements (500-1000 XP)
- **Silver**: Intermediate achievements (1000-2500 XP)
- **Gold**: Advanced achievements (2500-5000 XP)
- **Platinum**: Elite achievements (5000-10000 XP)

### Progressive Achievements

Some achievements have multiple levels:
- Level 1: Initial milestone
- Level 2: Increased requirement
- Level 3: Expert level
- Level 4: Master level

Example: "Code Ninja" achievement
- Level 1: Complete 25 exercises (Bronze)
- Level 2: Complete 50 exercises (Silver)
- Level 3: Complete 100 exercises (Gold)
- Level 4: Complete 250 exercises (Platinum)

### Secret Achievements

Secret achievements have hidden unlock conditions. Examples include:
- Easter Egg Hunter: Complete a lesson at midnight on a full moon
- Konami Master: Enter the Konami code on the dashboard
- The Chosen One: Complete specific combination of achievements

### Achievement Progress Tracking

- Real-time progress tracking for all achievements
- Progress bars show percentage completion
- Notifications when achievements are unlocked
- Achievement showcase on user profile

## Quest System

### Quest Types

1. **Daily Quests**: Reset every 24 hours (3 per day)
2. **Weekly Quests**: Reset every Monday (5 per week)
3. **Story Quests**: Narrative quest chains
4. **Tutorial Quests**: Onboarding for new users
5. **Seasonal Quests**: Limited-time event quests

### Quest Difficulties

- **Easy**: Simple tasks, small rewards
- **Medium**: Moderate challenges, decent rewards
- **Hard**: Challenging objectives, great rewards
- **Epic**: Long-term goals, exceptional rewards

### Quest Chains

Some quests have prerequisites and form chains:
- Complete earlier quests to unlock later ones
- Story-based progression
- Incremental difficulty increase

### Quest Rewards

- XP (50-5000+)
- Coins (10-1000+)
- Reward shop items (badges, boosters, cosmetics)
- Exclusive titles and badges

## Reward Shop

### Virtual Currency

**Coins** are earned through:
- Completing lessons (20 coins)
- Passing quizzes (30 coins)
- Perfect quiz scores (50 coins)
- Completing exercises (40 coins)
- Daily login (10 coins)
- Maintaining streaks (15 coins)
- Helping others (25 coins)

### Reward Categories

#### 1. Avatars
- Common: 200 coins
- Rare: 500 coins
- Epic: 800 coins
- Legendary: 2000 coins (requires level 50)

#### 2. Profile Frames
- Basic frames: 600 coins
- Premium frames: 1000-1500 coins
- Animated frames: 2000+ coins

#### 3. Badges
- Showcase on profile
- Multiple badge slots
- Collectible sets

#### 4. Titles
- Display above username
- Colored titles based on rarity
- Custom title text

#### 5. UI Themes
- Color scheme variations
- Dark/light mode themes
- Seasonal themes

#### 6. XP Boosters
- Small: 300 coins (1.5x for 24h)
- Medium: 600 coins (2x for 24h)
- Large: 1200 coins (3x for 24h)
- Mega: 2000 coins (5x for 12h)

#### 7. Utility Items
- Streak Freeze: 400 coins (protect streak for 1 day)
- Card Skip Pack: 200 coins (skip 10 difficult flashcards)

#### 8. Limited Edition Items
- Seasonal items (holidays, events)
- Limited stock
- Exclusive availability windows

### Purchase Requirements

Some items require:
- Minimum level
- Specific achievements unlocked
- Previous purchases in collection

## Competition System

### Competition Types

1. **Weekly Challenges**: Platform-wide weekly competitions
2. **Monthly Tournaments**: Larger scope, bigger prizes
3. **Head-to-Head**: 1v1 battles
4. **Team Competitions**: Collaborate with other users
5. **Speed Challenges**: Complete X in Y time
6. **Accuracy Challenges**: Maintain high scores
7. **Quiz Battles**: Real-time quiz competitions

### Joining Competitions

- Browse active competitions
- Check entry requirements (level, entry fee)
- Join before competition starts
- Track progress in real-time

### Competition Prizes

Prizes based on final rank:
- **1st Place**: 5000 XP, 2000 coins, exclusive badge
- **2nd Place**: 3000 XP, 1200 coins, badge
- **3rd Place**: 2000 XP, 800 coins, badge
- **Top 10**: 1000 XP, 400 coins
- **Participation**: 500 XP, 100 coins

### Leaderboard Updates

- Real-time score updates
- Rank calculations
- Historical data tracking

## Leaderboards

### Leaderboard Types

1. **Global Leaderboard**
   - All-time rankings
   - Total XP basis

2. **Time-Based Leaderboards**
   - Daily: Resets at midnight
   - Weekly: Resets Monday
   - Monthly: Resets 1st of month

3. **Category Leaderboards**
   - Lessons completed
   - Quiz scores
   - SRS reviews
   - Exercise completion

4. **Friend Leaderboards**
   - Compare with friends only
   - Private rankings

### Rank Indicators

- 🥇 1st Place
- 🥈 2nd Place
- 🥉 3rd Place
- Climbing/falling indicators
- Historical rank tracking

### Privacy Options

Users can opt-out of public leaderboards while still tracking personal progress.

## Streaks and Consistency

### Daily Streak System

- **Streak Counter**: Days of consecutive activity
- **Streak Milestones**: Achievements at 7, 30, 100 days
- **Streak Benefits**:
  - Bonus XP per day
  - Multiplier increases
  - Special badges

### Streak Protection

- **Streak Freeze**: Use to protect a missed day
- Purchase from reward shop (400 coins)
- Stack multiple freezes

### Streak Recovery

- **Comeback Kid Achievement**: Recover and reach 14 days again
- Grace period for technical issues

### Multi-Streak Tracking

- Lesson completion streak
- SRS review streak
- Exercise streak
- Login streak

## Social Features

### Helping Others

- Answer questions in forums
- Provide helpful feedback
- Earn "Helping Hand" badge
- XP and coin rewards

### Mentor System

- Experienced users mentor beginners
- Mentor-specific achievements
- Both parties earn rewards

### Study Buddies

- Connect with other learners
- Share progress
- Friendly competition
- Collaborative quests

### Content Creation

- Submit user-generated content
- Quality contributions rewarded
- Community champion title

### Achievement Sharing

- Share achievements to social media
- In-platform sharing
- Achievement showcase on profile

## API Reference

### Get User Progress
```
GET /api/gamification/progress
Response: { totalXP, currentLevel, xpToNextLevel, coins, streak, ... }
```

### Get Achievements
```
GET /api/gamification/achievements
Response: [ { id, name, description, unlocked, progress, ... } ]
```

### Track Activity
```
POST /api/gamification/activity
Body: { activityType, data }
Response: { xpAwarded, coinsAwarded, leveledUp, newAchievements }
```

### Get Quests
```
GET /api/gamification/quests
GET /api/gamification/quests/daily
```

### Start Quest
```
POST /api/gamification/quests/:questId/start
```

### Get Rewards
```
GET /api/gamification/rewards?type=&rarity=
```

### Purchase Reward
```
POST /api/gamification/rewards/:rewardId/purchase
```

### Get Leaderboard
```
GET /api/gamification/leaderboard?type=xp&limit=100&timeFrame=weekly
```

### Get Competitions
```
GET /api/gamification/competitions
GET /api/gamification/competitions/active
```

### Join Competition
```
POST /api/gamification/competitions/:competitionId/join
```

## Integration Examples

### Track Lesson Completion

```javascript
import { useGamificationStore } from '@/stores/gamificationStore';

const { trackActivity } = useGamificationStore();

// When lesson is completed
const result = await trackActivity('lesson_completed', {
  lessonId: '123',
  timeSpent: 300 // seconds
});

if (result.leveledUp) {
  // Show level up notification
}

if (result.newAchievements.length > 0) {
  // Show achievement unlocked modal
}
```

### Display XP Bar

```jsx
import { XPBar } from '@/components/gamification/XPBar';
import { useGamificationStore } from '@/stores/gamificationStore';

const { userProgress } = useGamificationStore();

<XPBar
  totalXP={userProgress.totalXP}
  showLevel
  showNumbers
  animate
/>
```

### Show Achievement Progress

```jsx
import { AchievementCard } from '@/components/gamification/AchievementCard';

<AchievementCard
  achievement={achievement}
  onClick={() => showAchievementDetails(achievement)}
/>
```

## Best Practices

1. **Track Everything**: Log all user activities for accurate XP/progress
2. **Show Progress**: Display progress bars, counters, and milestones
3. **Celebrate Wins**: Animations and notifications for achievements
4. **Balance Rewards**: Ensure fair XP/coin distribution
5. **Encourage Consistency**: Promote daily engagement through streaks
6. **Social Integration**: Enable sharing and community features
7. **Performance**: Cache gamification data, update in batches

## Troubleshooting

### XP Not Updating
- Check API connectivity
- Verify authentication token
- Ensure activity type is correct

### Achievements Not Unlocking
- Check requirement thresholds
- Verify backend achievement checks running
- Review achievement progress tracking

### Leaderboard Issues
- Confirm user opted-in to leaderboard
- Check time zone calculations
- Verify rank calculation logic

## Future Enhancements

- Clan/Guild system
- Trading system for items
- Achievement marketplace
- Custom competitions
- AI-powered quest generation
- Seasonal events
- Premium rewards tier

---

For complete achievement list, see [ACHIEVEMENT_LIST.md](./ACHIEVEMENT_LIST.md)
For quest details, see [QUEST_SYSTEM.md](./QUEST_SYSTEM.md)
For competition rules, see [COMPETITION_RULES.md](./COMPETITION_RULES.md)
