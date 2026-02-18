#!/bin/bash

###############################################################################
# Performance Testing Quick Start Script
# Quick validation of performance optimizations
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Performance Optimization Check       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

# Function to check command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 not found${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1 installed${NC}"
    return 0
}

# 1. Check prerequisites
print_section "Checking Prerequisites"
check_command node
check_command npm
check_command git

# 2. Check bundle size
print_section "Checking Bundle Size"
cd frontend
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    BUNDLE_BYTES=$(du -sb dist | cut -f1)
    MAX_BYTES=$((300 * 1024))

    echo "Bundle size: $BUNDLE_SIZE"

    if [ "$BUNDLE_BYTES" -lt "$MAX_BYTES" ]; then
        echo -e "${GREEN}✓ Bundle size within limits (<300KB)${NC}"
    else
        echo -e "${RED}✗ Bundle size exceeds 300KB limit${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No build found. Run 'npm run build' first${NC}"
fi

# 3. Check for optimization files
print_section "Checking Optimization Files"

FILES=(
    "src/utils/optimization/lazyLoad.tsx"
    "src/utils/optimization/debounceThrottle.ts"
    "src/utils/optimization/virtualScroll.tsx"
    "src/utils/optimization/imageOptimization.tsx"
    "src/utils/optimization/performanceMonitoring.ts"
    "src/utils/optimization/reactOptimization.tsx"
    "src/utils/optimization/index.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
    fi
done

# 4. Check vite config
print_section "Checking Vite Configuration"
if grep -q "compression" vite.config.ts; then
    echo -e "${GREEN}✓ Compression enabled${NC}"
else
    echo -e "${YELLOW}⚠ Compression not configured${NC}"
fi

if grep -q "manualChunks" vite.config.ts; then
    echo -e "${GREEN}✓ Code splitting configured${NC}"
else
    echo -e "${YELLOW}⚠ Code splitting not configured${NC}"
fi

if grep -q "terserOptions" vite.config.ts; then
    echo -e "${GREEN}✓ Minification configured${NC}"
else
    echo -e "${YELLOW}⚠ Minification not configured${NC}"
fi

# 5. Check backend optimization files
print_section "Checking Backend Optimization"
cd ../backend

BACKEND_FILES=(
    "src/middleware/cache.ts"
    "src/middleware/compression.ts"
    "src/config/database.ts"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
    fi
done

# 6. Check for large dependencies
print_section "Checking Dependencies"
cd ../frontend

if [ -f "package.json" ]; then
    echo "Analyzing dependencies..."

    # Check for large packages that should be lazy loaded
    if grep -q "monaco-editor" package.json; then
        echo -e "${GREEN}✓ Monaco editor present (should be lazy loaded)${NC}"
    fi

    if grep -q "recharts" package.json; then
        echo -e "${GREEN}✓ Recharts present (should be lazy loaded)${NC}"
    fi

    if grep -q "framer-motion" package.json; then
        echo -e "${GREEN}✓ Framer Motion present (should be lazy loaded)${NC}"
    fi
fi

# 7. Run quick tests
print_section "Running Quick Tests"

# Check if dev server is running
if nc -z localhost 3000 2>/dev/null; then
    echo -e "${GREEN}✓ Dev server running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Dev server not running${NC}"
    echo "  Start with: npm run dev"
fi

# 8. Performance recommendations
print_section "Recommendations"

echo ""
echo "📊 Performance Optimization Checklist:"
echo ""
echo "Frontend:"
echo "  □ Enable code splitting for large components"
echo "  □ Lazy load Monaco Editor, Charts, and heavy libraries"
echo "  □ Implement virtual scrolling for lists >100 items"
echo "  □ Optimize images (WebP, compression, lazy loading)"
echo "  □ Use React.memo for expensive components"
echo "  □ Implement service worker caching"
echo ""
echo "Backend:"
echo "  □ Add database indexes on frequently queried fields"
echo "  □ Enable caching layer (Redis or in-memory)"
echo "  □ Configure compression (Brotli + Gzip)"
echo "  □ Implement connection pooling"
echo "  □ Add rate limiting"
echo ""
echo "Testing:"
echo "  □ Run Lighthouse CI: npm run lighthouse"
echo "  □ Analyze bundle: npm run build:analyze"
echo "  □ Monitor Core Web Vitals"
echo "  □ Test on real devices and slow networks"
echo ""

# 9. Quick performance test
print_section "Quick Performance Test"

if [ -d "dist" ]; then
    echo "Running bundle analysis..."

    # Count JavaScript files
    JS_FILES=$(find dist -name "*.js" | wc -l)
    echo "JavaScript files: $JS_FILES"

    # Count chunks
    CHUNKS=$(find dist -name "*-*.js" | wc -l)
    echo "Code chunks: $CHUNKS"

    if [ "$CHUNKS" -gt 3 ]; then
        echo -e "${GREEN}✓ Code splitting implemented${NC}"
    else
        echo -e "${YELLOW}⚠ Consider more code splitting${NC}"
    fi

    # Check for compressed files
    COMPRESSED=$(find dist -name "*.br" -o -name "*.gz" | wc -l)
    if [ "$COMPRESSED" -gt 0 ]; then
        echo -e "${GREEN}✓ Compressed assets found${NC}"
        echo "Compressed files: $COMPRESSED"
    else
        echo -e "${YELLOW}⚠ No compressed assets found${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No build found${NC}"
fi

# 10. Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Summary                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

echo "Next Steps:"
echo ""
echo "1. Build the project:"
echo "   cd frontend && npm run build"
echo ""
echo "2. Analyze the bundle:"
echo "   npm run build:analyze"
echo ""
echo "3. Run Lighthouse audit:"
echo "   npm run lighthouse:ci"
echo ""
echo "4. Optimize images:"
echo "   npm run optimize:images"
echo ""
echo "5. Monitor performance:"
echo "   npm run perf:monitor"
echo ""
echo "6. Read the documentation:"
echo "   - PERFORMANCE_GUIDE.md"
echo "   - PERFORMANCE_BENCHMARKS.md"
echo ""

echo -e "${GREEN}✓ Performance check complete!${NC}"
