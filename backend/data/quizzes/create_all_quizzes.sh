#\!/bin/bash

# This script creates all remaining quiz files with comprehensive content
# Playwright intermediate quizzes 014-020, advanced 021-030
# Selenium beginner 031-040, intermediate 041-050, advanced 051-060

BASE_DIR="/Users/venkateshparasa/Documents/playWright/backend/data/quizzes"

echo "Creating comprehensive quiz bank..."
echo "This will generate 600 questions across 60 quizzes"

# Count existing quizzes
PW_BEG=$(ls -1 "$BASE_DIR/playwright/beginner"/*.json 2>/dev/null | wc -l)
PW_INT=$(ls -1 "$BASE_DIR/playwright/intermediate"/*.json 2>/dev/null | wc -l)
PW_ADV=$(ls -1 "$BASE_DIR/playwright/advanced"/*.json 2>/dev/null | wc -l)
SEL_BEG=$(ls -1 "$BASE_DIR/selenium/beginner"/*.json 2>/dev/null | wc -l)
SEL_INT=$(ls -1 "$BASE_DIR/selenium/intermediate"/*.json 2>/dev/null | wc -l)
SEL_ADV=$(ls -1 "$BASE_DIR/selenium/advanced"/*.json 2>/dev/null | wc -l)

echo "Current status:"
echo "  Playwright Beginner: $PW_BEG/10 quizzes"
echo "  Playwright Intermediate: $PW_INT/10 quizzes"
echo "  Playwright Advanced: $PW_ADV/10 quizzes"
echo "  Selenium Beginner: $SEL_BEG/10 quizzes"
echo "  Selenium Intermediate: $SEL_INT/10 quizzes"
echo "  Selenium Advanced: $SEL_ADV/10 quizzes"

