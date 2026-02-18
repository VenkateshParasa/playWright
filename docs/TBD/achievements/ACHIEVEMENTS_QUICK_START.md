# Achievements System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend Server

```bash
cd backend
npm install  # If not already installed
npm run dev
```

The server will start on `http://localhost:5000`

### Step 2: Start the Frontend

```bash
cd frontend
npm install  # If not already installed
npm run dev
```

The app will open on `http://localhost:5173`

### Step 3: Add the Achievements Route

In your main `App.tsx` or routing file, add:

```tsx
import Achievements from './pages/Achievements';

// In your router
<Route path="/achievements" element={<Achievements />} />
```

### Step 4: Test the System

1. Navigate to `/achievements` in your browser
2. You should see the achievements page with:
   - Stats overview (XP, Level, Streak, Achievements)
   - Level progress bar
   - Daily challenges
   - Achievement grid with filters

---

## 🎯 Quick Integration Examples

### Example 1: Track a Lesson Completion (2 minutes)

In your lesson completion component:

```tsx
import { useActivityTracker } from './lib/achievements/achievementEngine';

function LessonPage() {
  const { trackLessonCompleted } = useActivityTracker();

  const handleComplete = async () => {
    await trackLessonCompleted({ lessonId: 'lesson-123' });
    // Achievement unlocked! Notification will appear automatically
  };

  return <button onClick={handleComplete}>Complete Lesson</button>;
}
```

### Example 2: Show XP in Header (3 minutes)

Add to your header/navbar:

```tsx
import { useAchievementsStore } from './stores/achievementsStore';
import { XPBar } from './components/achievements';
import { getXPForNextLevel } from './data/achievements';
import { useEffect } from 'react';

function Header() {
  const { userProgress, fetchUserProgress } = useAchievementsStore();

  useEffect(() => {
    fetchUserProgress();
  }, []);

  if (!userProgress) return null;

  const xpInfo = getXPForNextLevel(userProgress.totalXP);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-bold">Level {userProgress.currentLevel}</span>
        <XPBar
          currentXP={xpInfo.current}
          requiredXP={xpInfo.required}
          size="small"
          showLabel={false}
        />
      </div>
    </div>
  );
}
```

### Example 3: Dashboard Widget (5 minutes)

Add recent achievements to your dashboard:

```tsx
import { useAchievementsStore } from './stores/achievementsStore';
import { AchievementBadge } from './components/achievements';
import { useEffect } from 'react';

function DashboardAchievements() {
  const { achievements, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const recent = achievements
    .filter(a => a.unlocked)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Recent Achievements</h3>
      <div className="flex gap-4">
        {recent.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="medium"
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🧪 Testing the System

### Manual Testing Steps

1. **Test Achievement Unlock**
   ```bash
   # Using curl or Postman
   POST http://localhost:5000/api/achievements/activity
   Headers: Cookie: <your-auth-cookie>
   Body: {
     "activityType": "lesson_completed",
     "data": { "lessonId": "test-lesson" }
   }
   ```

2. **Check User Progress**
   ```bash
   GET http://localhost:5000/api/achievements/progress
   Headers: Cookie: <your-auth-cookie>
   ```

3. **View All Achievements**
   ```bash
   GET http://localhost:5000/api/achievements/achievements
   Headers: Cookie: <your-auth-cookie>
   ```

4. **Get Leaderboard**
   ```bash
   GET http://localhost:5000/api/achievements/leaderboard?type=xp&limit=10
   Headers: Cookie: <your-auth-cookie>
   ```

### Test Achievement Unlocks

Run these commands in order to unlock achievements:

```javascript
// In browser console (must be logged in)
const tracker = useActivityTracker.getState();

// Unlock "First Steps" (complete 1 lesson)
await tracker.updateActivity('lesson_completed', { lessonId: '1' });

// Unlock "Quiz Taker" (pass 1 quiz)
await tracker.updateActivity('quiz_completed', {
  quizId: '1',
  score: 80,
  passed: true
});

// Unlock "Memory Builder" (review 25 flashcards)
await tracker.updateActivity('flashcard_reviewed', { count: 25 });
```

---

## 🎨 Customization

### Add New Achievements

Edit `frontend/src/data/achievements.ts` and `backend/src/utils/achievements.ts`:

```typescript
{
  id: 'custom_achievement',
  name: 'Custom Achievement',
  description: 'Do something custom',
  icon: '🎉',
  category: 'special',
  tier: 'gold',
  xpReward: 500,
  condition: {
    type: 'lessons_completed',  // or create a new type
    target: 10,
    description: 'Complete 10 custom lessons'
  }
}
```

Then add the checking logic in `backend/src/controllers/achievementsController.ts` in the `checkAchievements` function.

### Customize XP Rewards

Edit the XP amounts in the achievement definitions:

```typescript
xpReward: 1000  // Change from 500 to 1000
```

### Customize Level Titles

Edit `frontend/src/data/achievements.ts`:

```typescript
let title = 'Novice';
if (level >= 50) title = 'Your Custom Title';
// ... add more custom titles
```

### Change Colors/Styling

Tier colors are in `frontend/src/data/achievements.ts`:

```typescript
export const tierConfig = {
  bronze: {
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    // ... customize colors
  }
}
```

---

## 🔧 Troubleshooting

### Problem: Achievements not unlocking
**Solution:**
1. Check backend console for errors
2. Verify MongoDB is connected
3. Check that `updateActivity` is being called
4. Use browser dev tools to inspect API responses

### Problem: XP not updating
**Solution:**
1. Refresh the page to fetch latest data
2. Check that `fetchUserProgress()` is called
3. Verify database is saving progress
4. Check for API errors in network tab

### Problem: Notifications not showing
**Solution:**
1. Check that `fetchUnseenAchievements()` is called
2. Verify `AchievementNotification` component is rendered in your app layout
3. Check browser console for errors
4. Ensure you're not blocking the notification with CSS z-index

### Problem: Leaderboard empty
**Solution:**
1. Make sure multiple users have earned XP
2. Check that `fetchLeaderboard()` is called
3. Verify database has UserProgress entries
4. Check API endpoint returns data

---

## 📱 Mobile Responsive

The achievements system is fully responsive:
- Grid layouts adjust to screen size
- Touch-friendly buttons and badges
- Optimized for mobile, tablet, and desktop
- Swipe gestures work on mobile

---

## 🎯 Common Use Cases

### Use Case 1: Welcome New Users
Show the "First Steps" achievement when they complete their first lesson to encourage continued learning.

### Use Case 2: Encourage Daily Practice
Use the streak system and daily challenges to build a habit of daily learning.

### Use Case 3: Gamify Quizzes
Award achievements for perfect scores to motivate thorough learning.

### Use Case 4: Build Competition
Show the leaderboard prominently to create friendly competition.

### Use Case 5: Celebrate Milestones
Use level achievements (10, 25, 50) to celebrate major learning milestones.

---

## 📊 Analytics & Insights

Track these metrics for insights:
- Most unlocked achievements (popular activities)
- Average time to unlock achievements
- User retention by achievement count
- Leaderboard position changes
- Daily challenge completion rates

---

## 🚀 Production Deployment

### Environment Variables
```env
# Backend .env
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
PORT=5000

# Frontend .env
VITE_API_URL=https://your-api.com/api
```

### Database Indexes (Run once)
```javascript
// In MongoDB shell or script
db.userprogresses.createIndex({ userId: 1 });
db.userprogresses.createIndex({ totalXP: -1 });
db.userprogresses.createIndex({ currentLevel: -1 });
```

### Build Commands
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to your hosting
```

---

## 🎓 Learning Path

1. **Day 1**: Set up basic tracking (lessons, quizzes)
2. **Day 2**: Add achievement notifications to your app
3. **Day 3**: Integrate leaderboard into dashboard
4. **Day 4**: Add XP display to header/navbar
5. **Day 5**: Customize achievements and test thoroughly

---

## 💡 Tips & Best Practices

1. **Track everything**: More activity = more engagement
2. **Balance XP rewards**: Not too easy, not too hard
3. **Celebrate milestones**: Show notifications for big achievements
4. **Update regularly**: Add new achievements to keep it fresh
5. **Test on mobile**: Ensure smooth experience on all devices
6. **Monitor performance**: Check API response times
7. **Backup data**: Regularly backup UserProgress collection
8. **Version achievements**: Use IDs that won't change
9. **Communicate changes**: Tell users about new achievements
10. **Have fun**: Gamification should be enjoyable!

---

## 📚 Additional Resources

- Full Documentation: `ACHIEVEMENTS_README.md`
- Implementation Summary: `ACHIEVEMENTS_IMPLEMENTATION_SUMMARY.md`
- Integration Examples: `frontend/src/examples/achievementIntegration.tsx`
- Main Features Doc: `FEATURES_IMPLEMENTATION.md` (Section 6.2)

---

## ✅ Checklist for Going Live

- [ ] Backend server running and accessible
- [ ] MongoDB connected and indexed
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] Test all achievement unlocks
- [ ] Verify leaderboard displays correctly
- [ ] Check notifications appear properly
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Set up analytics tracking
- [ ] Document any custom achievements
- [ ] Train support team on features
- [ ] Announce new feature to users

---

## 🎉 You're Ready!

The achievements system is now fully functional. Start tracking activities and watch your users engage with the gamification features!

For support or questions, refer to the full documentation or check the implementation code.

**Happy coding! 🚀**
