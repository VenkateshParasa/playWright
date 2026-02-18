# Quiz System Testing Checklist

## Pre-Testing Setup

- [ ] Install dependencies: `npm install react-syntax-highlighter @types/react-syntax-highlighter`
- [ ] Run development server: `npm run dev`
- [ ] Open browser at `http://localhost:5173` (or your configured port)
- [ ] Open browser DevTools (Console + Network tabs)
- [ ] Navigate to `/quiz` route

## Functional Testing

### Quiz Selection & Discovery

- [ ] Quiz cards display correctly with all information
- [ ] Search bar filters quizzes by title/description
- [ ] Difficulty filter works (Easy, Medium, Hard, All)
- [ ] Best scores display for attempted quizzes
- [ ] Attempt counts show correctly
- [ ] History toggle shows/hides recent attempts
- [ ] Start Quiz button launches quiz correctly
- [ ] Retake Quiz button works for attempted quizzes

### Quiz Start & Initialization

- [ ] Quiz starts with question 1
- [ ] Timer starts counting down (if time limit set)
- [ ] Quiz title and description display
- [ ] Question counter shows (1 of X)
- [ ] No answers are pre-selected
- [ ] Auto-save initializes (check localStorage)

### Question Display

- [ ] Question text renders correctly
- [ ] Question number displays (X of Y)
- [ ] Points display for each question
- [ ] Difficulty badge shows (Easy/Medium/Hard)
- [ ] Category badge displays (if present)
- [ ] Mark for Review button visible and functional

### Multiple Choice Questions (Single Answer)

- [ ] Options display in readable format
- [ ] Radio button indicator shows
- [ ] Clicking option selects it
- [ ] Only one option can be selected
- [ ] Previously selected option deselects when choosing new one
- [ ] Selected option has blue highlight
- [ ] "Answer saved" message appears after selection

### Multiple Choice Questions (Multiple Answers)

- [ ] Options display with checkboxes
- [ ] "Select all that apply" hint shows
- [ ] Multiple options can be selected
- [ ] Clicking selected option deselects it
- [ ] Selected options have blue highlight
- [ ] "Answer saved" message appears after selection

### True/False Questions

- [ ] Large True button displays with check icon
- [ ] Large False button displays with X icon
- [ ] Clicking True selects it
- [ ] Clicking False selects it
- [ ] Selected option has blue highlight
- [ ] "Answer saved" message appears after selection

### Code Snippet Questions

- [ ] Code displays with syntax highlighting
- [ ] Language label shows (JavaScript/TypeScript/Java/Python)
- [ ] Line numbers display
- [ ] Code is readable with proper formatting
- [ ] Options display below code
- [ ] Selection works like multiple choice

### Timer Functionality

- [ ] Timer counts down in MM:SS format
- [ ] Timer is green when > 50% time remains
- [ ] Timer turns yellow when 25-50% time remains
- [ ] Timer turns red when < 25% time remains
- [ ] Warning icon appears when time is low
- [ ] Progress bar decreases over time
- [ ] Pause button pauses countdown
- [ ] Resume button resumes countdown
- [ ] Timer stops at 0:00
- [ ] Quiz auto-submits when timer reaches 0:00
- [ ] "Time's Up!" modal appears on expiration

### Navigation

- [ ] Previous button works (when not on first question)
- [ ] Previous button disabled on first question
- [ ] Next button works (when not on last question)
- [ ] Next button disabled on last question
- [ ] Current question indicator shows correct number
- [ ] Grid toggle button opens question overview
- [ ] Question grid modal displays all questions
- [ ] Clicking question in grid navigates to it
- [ ] Grid shows status icons (answered, review, unanswered)
- [ ] Grid legend displays correctly
- [ ] Close button closes grid modal
- [ ] Status summary shows counts (answered, review, unanswered)

### Mark for Review

- [ ] Mark for Review button toggles state
- [ ] Button shows "Marked for Review" when active
- [ ] Button shows "Mark for Review" when inactive
- [ ] Orange highlight appears when marked
- [ ] Mark status shows in navigation grid
- [ ] Review count updates in status summary
- [ ] Mark status persists when navigating away and back

### Auto-Save

- [ ] Progress saves automatically after answering
- [ ] localStorage key created (`quiz-progress-{quizId}`)
- [ ] Answers persist after page refresh
- [ ] Timer state persists after page refresh
- [ ] Current question persists after page refresh
- [ ] Mark for review status persists

### Submit Quiz

- [ ] Submit button visible at bottom
- [ ] Answered count displays correctly
- [ ] Review count displays if > 0
- [ ] Warning shows for unanswered questions
- [ ] Clicking Submit with all answers submits immediately
- [ ] Clicking Submit with missing answers shows confirmation modal
- [ ] Confirmation modal shows unanswered count
- [ ] "Go Back" button closes modal
- [ ] "Submit Anyway" button submits quiz
- [ ] Timer stops on submission
- [ ] Results page displays after submission

### Quiz Results

#### Hero Section
- [ ] Pass/fail status displays correctly
- [ ] "Congratulations!" shows for pass
- [ ] "Keep Learning!" shows for fail
- [ ] Background color: green for pass, orange/red for fail
- [ ] Trophy icon for pass, trending up for fail
- [ ] Percentage displayed prominently
- [ ] Score/max score displays
- [ ] Correct/total questions displays
- [ ] Time spent displays
- [ ] Performance badge shows (Excellent/Great/Good/Needs Improvement)

#### Stats Cards
- [ ] Status card shows Pass/Fail
- [ ] Passing score requirement displays
- [ ] Score card shows points earned
- [ ] Max score displays
- [ ] Time card shows total time
- [ ] Average time per question displays
- [ ] Accuracy card shows percentage correct
- [ ] Question count displays

#### Action Buttons
- [ ] Retry Quiz button visible (if allowed)
- [ ] Review Answers button visible
- [ ] Download Results button works
- [ ] Exit button visible
- [ ] Retry starts new attempt
- [ ] Review scrolls to detailed review section
- [ ] Download creates JSON file

#### Detailed Review
- [ ] All questions display in order
- [ ] Each question shows:
  - [ ] Question text
  - [ ] User's answer
  - [ ] Correct answer (if wrong)
  - [ ] Correct/incorrect status
  - [ ] Points earned/total
  - [ ] Time spent
  - [ ] Explanation
- [ ] Green border for correct answers
- [ ] Red border for incorrect answers
- [ ] Explanations are readable

### Exit Functionality

- [ ] X button in top right corner
- [ ] Clicking X shows exit confirmation modal
- [ ] Modal explains progress will be saved
- [ ] Cancel button closes modal
- [ ] Exit button saves progress and returns to quiz list

### Anti-Cheating Measures

- [ ] Right-click disabled during quiz
- [ ] Right-click enabled after completion
- [ ] Copy disabled during quiz (Ctrl/Cmd+C)
- [ ] Paste disabled during quiz (Ctrl/Cmd+V)
- [ ] Browser warning on page close attempt
- [ ] Warning only shows during active quiz

### Quiz History

- [ ] History toggle shows/hides history section
- [ ] Recent attempts display (up to 10)
- [ ] Each attempt shows:
  - [ ] Quiz title
  - [ ] Date completed
  - [ ] Percentage score
  - [ ] Correct/total questions
  - [ ] Pass/fail icon
- [ ] Most recent attempts appear first
- [ ] History persists across sessions

### Error Handling

- [ ] No errors in browser console
- [ ] Quiz handles missing data gracefully
- [ ] Timer handles edge cases (0 time limit)
- [ ] Navigation handles boundary conditions
- [ ] No React warnings in development mode

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] Layout is readable and not stretched
- [ ] All components fit on screen
- [ ] Navigation is easy to use
- [ ] Timer is visible
- [ ] Results display properly

### Laptop (1366x768)
- [ ] Layout adapts appropriately
- [ ] No horizontal scrolling required
- [ ] All text is readable
- [ ] Buttons are accessible

### Tablet (768x1024)
- [ ] Grid layout adjusts to 2 columns
- [ ] Navigation remains usable
- [ ] Timer displays correctly
- [ ] Modal fits on screen

### Mobile (375x667)
- [ ] Single column layout
- [ ] Touch targets are large enough
- [ ] Navigation buttons stack appropriately
- [ ] Grid modal is scrollable
- [ ] Timer is visible and readable
- [ ] Results page scrolls smoothly

## Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Rendering is correct
- [ ] Performance is smooth

### Firefox
- [ ] All features work
- [ ] Rendering is correct
- [ ] Performance is smooth

### Safari
- [ ] All features work
- [ ] Rendering is correct
- [ ] Performance is smooth
- [ ] localStorage works

### Edge
- [ ] All features work
- [ ] Rendering is correct
- [ ] Performance is smooth

### Mobile Safari (iOS)
- [ ] Touch interactions work
- [ ] Layout is responsive
- [ ] Timer functions correctly

### Mobile Chrome (Android)
- [ ] Touch interactions work
- [ ] Layout is responsive
- [ ] Timer functions correctly

## Performance Testing

- [ ] Quiz loads in < 2 seconds
- [ ] Question navigation is instant
- [ ] Timer updates smoothly (no lag)
- [ ] Auto-save doesn't cause UI freezing
- [ ] Results calculate quickly (< 1 second)
- [ ] No memory leaks (check DevTools)
- [ ] localStorage writes don't block UI

## Accessibility Testing

- [ ] Keyboard navigation works (Tab/Shift+Tab)
- [ ] Enter key selects options
- [ ] Space bar works for buttons
- [ ] Screen reader announces question text
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards
- [ ] Alt text on icons (where applicable)
- [ ] ARIA labels present

## Edge Cases

- [ ] Quiz with 0 time limit (no timer shown)
- [ ] Quiz with 1 question
- [ ] Quiz with 100+ questions
- [ ] Extremely long question text
- [ ] Extremely long option text
- [ ] Questions with no explanation
- [ ] Multiple quizzes in rapid succession
- [ ] Browser back button during quiz
- [ ] Multiple tabs with same quiz
- [ ] Pause quiz, wait 10 minutes, resume

## Data Integrity

- [ ] Quiz history stores all attempts
- [ ] Best scores update correctly
- [ ] Retry resets progress properly
- [ ] Download contains all result data
- [ ] localStorage doesn't exceed quota
- [ ] Corrupted localStorage handled gracefully

## Security & Anti-Cheating

- [ ] Cannot access console during quiz (optional)
- [ ] Cannot inspect element during quiz (optional)
- [ ] Timer cannot be manipulated
- [ ] Answers cannot be pre-filled via URL
- [ ] Results cannot be faked
- [ ] LocalStorage is namespaced properly

## Clean Up Testing

- [ ] Completed quiz progress is cleared from localStorage
- [ ] Old quiz history doesn't bloat storage
- [ ] Exiting quiz saves state properly
- [ ] Re-entering quiz loads saved state
- [ ] Cache invalidation works correctly

## Integration Testing

- [ ] Quiz integrates with progress tracking
- [ ] Quiz history updates progress store
- [ ] Navigation to/from quiz works
- [ ] Breadcrumbs show correct path (if implemented)
- [ ] Auth state is respected

## Regression Testing

After any code changes:
- [ ] Run full test suite again
- [ ] Check all browsers
- [ ] Test on all devices
- [ ] Verify no existing features broke

## Sign-Off

- [ ] All critical tests pass
- [ ] All high-priority tests pass
- [ ] Known issues documented
- [ ] Ready for production

**Tester Name**: _______________
**Date**: _______________
**Build Version**: _______________

## Notes

Use this space to document any issues found:

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
