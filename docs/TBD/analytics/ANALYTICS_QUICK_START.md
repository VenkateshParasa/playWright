# Analytics Dashboard - Quick Start Guide

## 🚀 Getting Started

### 1. Access the Dashboard

**URL**: `http://localhost:5173/admin/analytics`

**Requirements**:
- Must be logged in
- Must have `admin` role assigned

---

## 📊 Dashboard Overview

The Analytics Dashboard has 7 tabs:

1. **Overview** - Comprehensive view of all key metrics
2. **Users** - User growth, retention, and engagement
3. **Content** - Content performance and popularity
4. **Engagement** - Study time and activity patterns
5. **Progress** - Learning progress and stuck users
6. **SRS** - Flashcard and retention metrics
7. **Reports** - Generate and export custom reports

---

## 🎯 Common Tasks

### View Overall Platform Health

1. Click **Overview** tab
2. Check key metrics:
   - Total users and growth
   - Active users (DAU/MAU)
   - Retention rate (should be >40%)
   - Overall completion rate

### Identify Problem Content

1. Click **Content** tab
2. Scroll to "Least Completed Lessons"
3. Review completion rates
4. Click "Difficult Exercises" section
5. Take action on items with <30% completion

### Find Inactive Users

1. Click **Progress** tab
2. Scroll to "Users Needing Attention"
3. Review list of stuck users
4. Send re-engagement emails

### Check Daily Activity

1. Click **Engagement** tab
2. View "Daily Active Sessions"
3. Check "Peak Usage Times" chart
4. Plan content releases for peak hours

### Monitor SRS Performance

1. Click **SRS** tab
2. Check "Average Retention Rate" (should be >80%)
3. Review "Card Difficulty Distribution"
4. Identify hard cards needing revision

### Generate Monthly Report

1. Click **Reports** tab
2. Select all metrics checkboxes
3. Choose export format (JSON recommended)
4. Click "Download Report"
5. Save for records or analysis

---

## 📅 Date Range Filtering

### Apply Date Filter

1. Click **Calendar icon** (top-right)
2. Select **Start Date**
3. Select **End Date**
4. Click **Apply**

### Clear Date Filter

1. Click **Calendar icon**
2. Click **Clear** button
3. View all-time data

---

## 🔄 Refreshing Data

### Manual Refresh

Click the **Refresh** button (top-right) to update all metrics immediately.

### Last Updated

Check the "Last updated" timestamp below the header to see when data was last refreshed.

---

## 📈 Understanding Key Metrics

### Health Indicators

| Metric | Healthy Range | Action Needed If... |
|--------|--------------|-------------------|
| Retention Rate | >40% | <30% - Review onboarding |
| DAU/MAU Ratio | 20-30% | <15% - Increase engagement |
| Quiz Pass Rate | 70-85% | <60% - Content too hard |
| SRS Retention | >80% | <75% - Review card quality |
| Completion Rate | 30-50% | <25% - Simplify content |

### Traffic Light System

🟢 **Green** - Performing well, maintain current approach
🟡 **Yellow** - Needs attention, monitor closely
🔴 **Red** - Action required immediately

---

## 🎨 Chart Interactions

### All Charts Support:

- **Hover** - View detailed values
- **Tooltips** - Context for data points
- **Legends** - Click to show/hide series

### Interpreting Charts

**Line Charts** (Trends)
- Upward slope = Growth
- Downward slope = Decline
- Flat line = Stable

**Bar Charts** (Comparisons)
- Taller bars = Higher values
- Compare across categories

**Pie Charts** (Distributions)
- Larger slices = Higher proportion
- Review percentages in labels

**Heatmaps** (Patterns)
- Darker colors = More activity
- Find peak times/days

---

## 💡 Pro Tips

### Daily (5 minutes)
- ✅ Check active users today
- ✅ Review stuck user count
- ✅ Scan for errors or anomalies

### Weekly (30 minutes)
- ✅ Review user growth trends
- ✅ Check content completion rates
- ✅ Identify problem lessons
- ✅ Monitor engagement metrics

### Monthly (2 hours)
- ✅ Generate comprehensive report
- ✅ Analyze trends vs. previous month
- ✅ Plan content improvements
- ✅ Review SRS performance
- ✅ Update team on progress

---

## 🆘 Troubleshooting

### "No data available"
- Click **Refresh** button
- Check if backend is running
- Verify admin permissions

### "Metrics not loading"
- Check browser console for errors
- Clear browser cache
- Try incognito/private mode

### "Slow performance"
- Narrow date range
- Clear old browser data
- Check network connection

### "Export not working"
- Try different format (JSON → CSV)
- Check browser download settings
- Disable popup blockers

---

## 🔗 Related Documentation

- **ANALYTICS_DASHBOARD_GUIDE.md** - Complete metric interpretation
- **ANALYTICS_IMPLEMENTATION_SUMMARY.md** - Technical details
- **ANALYTICS_FILE_STRUCTURE.txt** - File organization

---

## 📞 Need Help?

1. Check the comprehensive guide: `ANALYTICS_DASHBOARD_GUIDE.md`
2. Review error messages in browser console
3. Verify backend logs for API errors
4. Contact development team with specific error details

---

**Version**: 1.0.0
**Last Updated**: February 2025
