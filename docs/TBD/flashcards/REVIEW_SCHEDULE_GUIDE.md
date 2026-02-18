# Review Schedule & Calendar Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Understanding the Interface](#understanding-the-interface)
5. [Best Practices](#best-practices)
6. [Understanding Retention](#understanding-retention)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Review Schedule & Calendar system helps you visualize, plan, and optimize your spaced repetition study schedule. It provides insights into your review patterns, retention rates, and study habits to maximize learning efficiency.

### Key Benefits

- **Visual Planning**: See upcoming reviews at a glance
- **Workload Forecasting**: Plan ahead for busy study days
- **Retention Tracking**: Monitor how well you're retaining information
- **Study Analytics**: Understand your study patterns and habits
- **Schedule Optimization**: Adjust settings for optimal learning

---

## Getting Started

### Accessing the Schedule

1. Navigate to the Review Schedule page from the main menu
2. You'll see the Overview tab by default with your calendar and heatmap

### Quick Navigation

The interface has 5 main tabs:
- **Overview**: Calendar view and activity heatmap
- **Forecast**: Upcoming review predictions
- **Retention**: Long-term memory retention analysis
- **Analytics**: Study time and productivity insights
- **Settings**: Customize your review schedule

---

## Features

### 1. Review Calendar

**What it shows**: A month-view calendar displaying the number of cards due each day.

**How to use**:
- Click on any day to see detailed breakdown of cards due
- Days are color-coded by review count (lighter = fewer, darker = more)
- Today is highlighted with a blue border
- Use arrow buttons to navigate between months
- Click "Today" to return to current month

**Color Legend**:
- White/Light gray: 0 cards
- Light green: 1-5 cards
- Medium green: 6-10 cards
- Dark green: 11-20 cards
- Darkest green: 21+ cards

### 2. Daily Breakdown

**What it shows**: Detailed list of all cards due on a selected day.

**Information provided**:
- Total card count
- Breakdown by card type (New, Learning, Review)
- Breakdown by category
- Average interval
- Estimated completion time

**Actions available**:
- Start review session directly
- View individual card details
- See card difficulty and type at a glance

### 3. Review Forecast

**What it shows**: Bar chart predicting reviews for the next 7-90 days.

**How to use**:
- Select forecast range (7, 14, 30, 60, or 90 days)
- View stacked bars showing New, Learning, and Review cards
- Export data as CSV for external analysis
- Identify peak days and plan accordingly

**Statistics shown**:
- Total reviews in the forecast period
- Average reviews per day
- Peak day (highest review count)

**Color coding**:
- Blue: New cards
- Yellow: Learning cards
- Green: Review cards

### 4. Review Heatmap

**What it shows**: GitHub-style activity heatmap for the past year.

**What you can learn**:
- Study consistency over time
- Current and longest study streaks
- Total reviews completed
- Active study days

**How to interpret**:
- Each square represents one day
- Darker colors = more cards reviewed
- Hover over squares for exact counts
- Use year selector to view past years

**Building streaks**:
- Study every day to maintain your streak
- Even 5-10 cards count toward your streak
- Streaks help build consistent study habits

### 5. Retention Graph

**What it shows**: Line graph showing how well you retain information over time.

**Key metrics**:
- Retention rate at different intervals (1 day, 1 week, 1 month, etc.)
- Average retention rate (shown as dashed line)
- Sample size for each data point

**How to interpret**:

**Excellent (90%+ retention)**:
- Your review schedule is optimal
- Cards are well-spaced for maximum retention
- Consider increasing daily card limit

**Very Good (80-90% retention)**:
- Solid performance
- Continue current study habits
- Small adjustments may yield improvements

**Good (70-80% retention)**:
- Acceptable but could improve
- Review more consistently
- Consider adjusting learning steps

**Fair (60-70% retention)**:
- Room for improvement
- Don't skip reviews when cards are due
- Reduce new card introduction rate

**Needs Improvement (<60% retention)**:
- Focus on reviews over new cards
- Study more consistently
- Cards may be too difficult - consider breaking them down

**Understanding the curve**:
- Natural to see declining retention over time
- Steep drops indicate need for more frequent reviews
- Flat curve suggests well-optimized intervals

### 6. Study Time Analytics

**What it shows**: Comprehensive view of your study patterns and time investment.

**Metrics tracked**:
- Total study time (all-time, weekly, monthly)
- Average session duration
- Time spent per category
- Study time by hour of day
- Current study streak
- Most productive hours

**How to use this data**:

**Optimize study timing**:
- Schedule reviews during your most productive hours
- Your analytics show when you perform best
- Consistency at the same time each day helps habit formation

**Track progress**:
- Monitor time investment in different topics
- Ensure balanced coverage across categories
- Identify areas needing more attention

**Improve efficiency**:
- Aim for 20-30 minute focused sessions
- Take breaks during longer study periods
- Quality over quantity - focused study beats marathon sessions

### 7. Schedule Settings

**Configurable parameters**:

**Daily Limits**:
- **Max New Cards per Day**: How many new cards to introduce (default: 20)
- **Max Reviews per Day**: Upper limit on daily reviews (default: 200)

**Learning Steps** (in minutes):
- Intervals for cards in learning phase
- Default: [1, 10, 60, 1440] = 1min, 10min, 1hr, 1day
- Shorter steps for quick repetition, longer for spacing

**Intervals**:
- **Graduating Interval**: Days until a card becomes a "review" card (default: 1)
- **Easy Interval Multiplier**: Bonus for rating cards as "Easy" (default: 1.3)
- **Maximum Interval**: Upper limit on review spacing (default: 36500 days / ~100 years)

**Review Order**:
- **Due Date**: Oldest cards first (recommended)
- **Random**: Randomized order
- **Difficulty**: Hardest cards first

**Recommended Settings by Level**:

**Beginner**:
- New cards: 10-15/day
- Max reviews: 100-150/day
- Focus on building foundations

**Intermediate**:
- New cards: 20-30/day
- Max reviews: 150-200/day
- Balanced learning and retention

**Advanced**:
- New cards: 30-50/day
- Max reviews: 200+/day
- High-volume sustainable learning

### 8. Manual Reschedule

**When to use**:
- Going on vacation
- Heavy workload period coming up
- Batch of cards becoming due at once
- Need to spread out reviews

**How to reschedule**:
1. Select cards to reschedule
2. Choose new due date
3. Optionally add reason for audit trail
4. Confirm reschedule

**Important warnings**:
- Overrides spaced repetition algorithm
- May reduce learning efficiency
- Use sparingly
- All changes are logged for audit purposes

---

## Best Practices

### Daily Routine

**Morning Review** (15-30 minutes):
1. Check calendar for today's due cards
2. Complete due reviews before new cards
3. Introduce new cards up to daily limit

**Evening Review** (10-15 minutes):
1. Complete any remaining learning cards
2. Review difficult cards again if needed
3. Plan tomorrow's study time

### Weekly Planning

**Sunday Evening**:
1. Check forecast for the upcoming week
2. Identify heavy review days
3. Adjust schedule or daily limits if needed
4. Review retention curve for trends

### Optimizing Your Schedule

**If reviews are piling up**:
- Reduce new card introduction rate
- Increase daily review limit temporarily
- Focus on due cards, skip new cards
- Consider suspending difficult cards

**If you're ahead of schedule**:
- Increase new card limit
- Introduce more challenging content
- Review ahead if time permits
- Maintain consistency to build streaks

**If retention is dropping**:
- Review more consistently
- Don't skip review days
- Consider shorter learning steps
- Break down difficult cards

**If retention is high (90%+)**:
- You're doing great!
- Consider increasing new card rate
- Keep current study habits
- Help others learn your techniques

### Building Sustainable Habits

**Start small**:
- Begin with 10 new cards/day
- Gradually increase as comfortable
- Consistency beats intensity

**Study at the same time**:
- Pick a consistent time each day
- Morning or evening work best for most
- Use analytics to find your productive hours

**Take breaks**:
- 20-30 minute sessions are optimal
- Rest between long study periods
- Don't push through fatigue

**Track your progress**:
- Check retention curve monthly
- Celebrate milestones and streaks
- Adjust based on data, not feelings

---

## Understanding Retention

### What is Retention?

Retention measures the percentage of cards you successfully recall at different time intervals after learning them. Higher retention means better long-term memory formation.

### The Forgetting Curve

Hermann Ebbinghaus discovered that we forget information exponentially over time:
- After 1 day: 50-80% retained
- After 1 week: 20-30% retained
- After 1 month: 10-20% retained

Spaced repetition combats this by timing reviews just before you'd forget.

### Optimal Retention Rates

**80-95% is ideal**:
- Too high (>95%): Reviewing too frequently, wasting time
- Too low (<70%): Intervals too long, not learning effectively
- Sweet spot: 85-90% retention

### Factors Affecting Retention

**Card difficulty**:
- Break down complex cards into simpler ones
- Use mnemonics and memory techniques
- Add context and examples

**Review consistency**:
- Daily reviews beat marathon sessions
- Don't skip reviews when cards are due
- Small daily effort compounds over time

**Sleep and health**:
- Sleep consolidates memories
- Stress impairs retention
- Good nutrition supports brain function

**Initial learning quality**:
- Understand deeply before memorizing
- Create meaningful connections
- Use active recall, not passive reading

### Interpreting Your Retention Curve

**Steep initial drop, then levels off**:
- Normal and expected
- Shows proper spacing effect
- Continue current schedule

**Gradual, steady decline**:
- Ideal retention pattern
- Well-optimized intervals
- Keep doing what you're doing

**Sharp drops at specific intervals**:
- Need more reviews at those times
- Adjust learning steps
- Add intermediate reviews

**Consistently flat high retention**:
- Reviewing too frequently
- Increase intervals
- Add more new cards

---

## Troubleshooting

### Calendar shows no data

**Possible causes**:
- No cards in database
- Cards not scheduled yet
- Date range issue

**Solutions**:
- Add some flashcards first
- Start reviewing existing cards
- Check date range selection

### Forecast shows empty days

**Normal behavior**:
- Some days naturally have fewer reviews
- New cards create review waves
- SRS algorithm spreads out reviews

**If concerning**:
- Check if daily limits are too restrictive
- Verify cards are being reviewed
- Ensure new cards are being added

### Retention data not showing

**Common reasons**:
- Not enough reviews completed yet
- Need at least 10 reviews per interval
- Multiple reviews needed over time

**Wait and**:
- Complete more reviews
- Review for several weeks
- Data will accumulate naturally

### Heatmap is mostly empty

**Reasons**:
- Recently started using the system
- Not reviewing consistently
- Checking wrong year

**Actions**:
- Build a daily review habit
- Start with small daily goals
- Check current year is selected

### Settings not saving

**Troubleshooting**:
- Check internet connection
- Try refreshing the page
- Verify changes before closing
- Look for error messages

### Study time seems wrong

**Possible issues**:
- Timer may have been paused
- App was left open idle
- Multiple tabs open

**To fix**:
- Close unused tabs
- Complete full sessions
- Data will normalize over time

---

## Advanced Tips

### Customizing Learning Steps

**For quick facts** (dates, vocabulary):
```
[1, 10, 1440]
```
- Rapid repetition
- Quick graduation

**For complex concepts** (formulas, processes):
```
[10, 60, 360, 1440, 4320]
```
- More learning steps
- Gradual progression

**For very difficult material**:
```
[10, 60, 360, 1440, 2880, 4320, 7200]
```
- Extended learning phase
- Extra reinforcement

### Using Forecast for Planning

**Before vacation**:
1. Check forecast for vacation dates
2. Complete extra reviews beforehand
3. Reduce new card introduction
4. Reschedule if necessary

**During exam period**:
1. Temporarily reduce new cards to 0
2. Focus on maintaining reviews
3. Increase daily review limit
4. Resume new cards after exams

**Starting new deck**:
1. Check current review load
2. Ensure capacity for new cards
3. Gradually increase new card rate
4. Monitor retention doesn't drop

### Exporting and Analyzing Data

**Available exports**:
- Forecast data (CSV)
- Retention curve (CSV)
- Review history (built into cards)

**External analysis**:
- Import into Excel/Google Sheets
- Create custom visualizations
- Track long-term trends
- Compare different study periods

---

## Keyboard Shortcuts

- `←/→`: Navigate calendar months
- `T`: Jump to today
- `1-5`: Select forecast range
- `R`: Refresh current view
- `S`: Open settings
- `Esc`: Close modals

---

## Mobile Usage

The schedule interface is fully responsive:
- Calendar adapts to screen size
- Charts remain interactive
- Swipe to navigate months
- Tap days for breakdown
- All features accessible

---

## Getting Help

**Common questions**:
- Check this guide first
- Review tooltips in the interface
- Hover over elements for more info

**Still need help**:
- Contact support
- Check FAQ section
- Join community forums

---

## Summary

The Review Schedule & Calendar system is a powerful tool for optimizing your learning. Key takeaways:

1. **Use the calendar** to plan your study time
2. **Monitor retention** to gauge effectiveness
3. **Adjust settings** based on data, not intuition
4. **Build streaks** for consistent habits
5. **Trust the algorithm** - it's scientifically proven
6. **Review consistently** - small daily effort compounds

Happy learning! 🎓
