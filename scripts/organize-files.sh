#!/bin/bash

###############################################################################
# Folder Structure Organization Script
#
# Purpose: Create optimal folder structure for Playwright & Selenium Learning Platform
# Usage: ./organize-files.sh
# Note: This script ONLY creates folders, it does NOT move files
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Playwright & Selenium Learning Platform               ║${NC}"
echo -e "${BLUE}║   Folder Structure Organization Script                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to create directory with logging
create_dir() {
    local dir_path="$1"
    if [ ! -d "$dir_path" ]; then
        mkdir -p "$dir_path"
        echo -e "${GREEN}✓${NC} Created: $dir_path"
    else
        echo -e "${YELLOW}⊙${NC} Exists:  $dir_path"
    fi
}

# Function to create index.ts file
create_index_file() {
    local file_path="$1"
    local comment="$2"
    if [ ! -f "$file_path" ]; then
        echo "// $comment" > "$file_path"
        echo "export {};" >> "$file_path"
        echo -e "${GREEN}✓${NC} Created: $file_path"
    fi
}

echo -e "${BLUE}Creating Backend Folder Structure...${NC}"
echo ""

###############################################################################
# BACKEND STRUCTURE
###############################################################################

# Backend Models (Domain-Organized)
echo -e "${YELLOW}📁 Backend Models${NC}"
create_dir "$PROJECT_ROOT/backend/src/models/user"
create_dir "$PROJECT_ROOT/backend/src/models/learning"
create_dir "$PROJECT_ROOT/backend/src/models/gamification"
create_dir "$PROJECT_ROOT/backend/src/models/commerce"
create_dir "$PROJECT_ROOT/backend/src/models/enterprise"
create_dir "$PROJECT_ROOT/backend/src/models/community"
create_dir "$PROJECT_ROOT/backend/src/models/content"
create_dir "$PROJECT_ROOT/backend/src/models/marketing"
create_dir "$PROJECT_ROOT/backend/src/models/mentorship"
create_dir "$PROJECT_ROOT/backend/src/models/analytics"
create_dir "$PROJECT_ROOT/backend/src/models/shared"
echo ""

# Backend Controllers (Domain-Organized)
echo -e "${YELLOW}📁 Backend Controllers${NC}"
create_dir "$PROJECT_ROOT/backend/src/controllers/auth"
create_dir "$PROJECT_ROOT/backend/src/controllers/learning"
create_dir "$PROJECT_ROOT/backend/src/controllers/gamification"
create_dir "$PROJECT_ROOT/backend/src/controllers/admin"
create_dir "$PROJECT_ROOT/backend/src/controllers/api"
create_dir "$PROJECT_ROOT/backend/src/controllers/marketing"
create_dir "$PROJECT_ROOT/backend/src/controllers/community"
create_dir "$PROJECT_ROOT/backend/src/controllers/video"
create_dir "$PROJECT_ROOT/backend/src/controllers/ai"
create_dir "$PROJECT_ROOT/backend/src/controllers/analytics"
create_dir "$PROJECT_ROOT/backend/src/controllers/playground"
create_dir "$PROJECT_ROOT/backend/src/controllers/studio"
create_dir "$PROJECT_ROOT/backend/src/controllers/monetization"
create_dir "$PROJECT_ROOT/backend/src/controllers/live"
create_dir "$PROJECT_ROOT/backend/src/controllers/certificates"
create_dir "$PROJECT_ROOT/backend/src/controllers/integrations"
create_dir "$PROJECT_ROOT/backend/src/controllers/compliance"
create_dir "$PROJECT_ROOT/backend/src/controllers/mentorship"
echo ""

# Backend Services (Domain-Organized)
echo -e "${YELLOW}📁 Backend Services${NC}"
create_dir "$PROJECT_ROOT/backend/src/services/auth"
create_dir "$PROJECT_ROOT/backend/src/services/ai"
create_dir "$PROJECT_ROOT/backend/src/services/learning"
create_dir "$PROJECT_ROOT/backend/src/services/gamification"
create_dir "$PROJECT_ROOT/backend/src/services/video"
create_dir "$PROJECT_ROOT/backend/src/services/payment"
create_dir "$PROJECT_ROOT/backend/src/services/integration"
create_dir "$PROJECT_ROOT/backend/src/services/monitoring"
create_dir "$PROJECT_ROOT/backend/src/services/cache"
create_dir "$PROJECT_ROOT/backend/src/services/queue"
create_dir "$PROJECT_ROOT/backend/src/services/analytics"
create_dir "$PROJECT_ROOT/backend/src/services/email"
create_dir "$PROJECT_ROOT/backend/src/services/storage"
create_dir "$PROJECT_ROOT/backend/src/services/search"
create_dir "$PROJECT_ROOT/backend/src/services/notification"
create_dir "$PROJECT_ROOT/backend/src/services/compliance"
create_dir "$PROJECT_ROOT/backend/src/services/playground"
create_dir "$PROJECT_ROOT/backend/src/services/mentorship"
create_dir "$PROJECT_ROOT/backend/src/services/live"
create_dir "$PROJECT_ROOT/backend/src/services/certificates"
create_dir "$PROJECT_ROOT/backend/src/services/sync"
create_dir "$PROJECT_ROOT/backend/src/services/distributed"
create_dir "$PROJECT_ROOT/backend/src/services/marketing"
create_dir "$PROJECT_ROOT/backend/src/services/monetization"
create_dir "$PROJECT_ROOT/backend/src/services/webhooks"
create_dir "$PROJECT_ROOT/backend/src/services/xapi"
create_dir "$PROJECT_ROOT/backend/src/services/lti"
create_dir "$PROJECT_ROOT/backend/src/services/scorm"
create_dir "$PROJECT_ROOT/backend/src/services/sso"
echo ""

# Backend Routes
echo -e "${YELLOW}📁 Backend Routes${NC}"
create_dir "$PROJECT_ROOT/backend/src/routes/v1"
create_dir "$PROJECT_ROOT/backend/src/routes/api/v1"
create_dir "$PROJECT_ROOT/backend/src/routes/auth"
create_dir "$PROJECT_ROOT/backend/src/routes/learning"
create_dir "$PROJECT_ROOT/backend/src/routes/gamification"
create_dir "$PROJECT_ROOT/backend/src/routes/community"
create_dir "$PROJECT_ROOT/backend/src/routes/admin"
create_dir "$PROJECT_ROOT/backend/src/routes/ai"
echo ""

# Backend Other Folders
echo -e "${YELLOW}📁 Backend Infrastructure${NC}"
create_dir "$PROJECT_ROOT/backend/src/middleware"
create_dir "$PROJECT_ROOT/backend/src/utils"
create_dir "$PROJECT_ROOT/backend/src/types"
create_dir "$PROJECT_ROOT/backend/src/config"
create_dir "$PROJECT_ROOT/backend/src/workers"
create_dir "$PROJECT_ROOT/backend/src/data/seeds"
create_dir "$PROJECT_ROOT/backend/src/data/fixtures"
create_dir "$PROJECT_ROOT/backend/src/__tests__/unit"
create_dir "$PROJECT_ROOT/backend/src/__tests__/integration"
echo ""

###############################################################################
# FRONTEND STRUCTURE
###############################################################################

echo -e "${BLUE}Creating Frontend Folder Structure...${NC}"
echo ""

# Frontend Pages (Feature-Organized)
echo -e "${YELLOW}📁 Frontend Pages${NC}"
create_dir "$PROJECT_ROOT/frontend/src/pages/auth"
create_dir "$PROJECT_ROOT/frontend/src/pages/dashboard"
create_dir "$PROJECT_ROOT/frontend/src/pages/lessons"
create_dir "$PROJECT_ROOT/frontend/src/pages/courses"
create_dir "$PROJECT_ROOT/frontend/src/pages/quizzes"
create_dir "$PROJECT_ROOT/frontend/src/pages/flashcards"
create_dir "$PROJECT_ROOT/frontend/src/pages/exercises"
create_dir "$PROJECT_ROOT/frontend/src/pages/gamification"
create_dir "$PROJECT_ROOT/frontend/src/pages/community"
create_dir "$PROJECT_ROOT/frontend/src/pages/playground"
create_dir "$PROJECT_ROOT/frontend/src/pages/admin"
create_dir "$PROJECT_ROOT/frontend/src/pages/studio"
create_dir "$PROJECT_ROOT/frontend/src/pages/analytics"
create_dir "$PROJECT_ROOT/frontend/src/pages/live"
create_dir "$PROJECT_ROOT/frontend/src/pages/mentorship"
create_dir "$PROJECT_ROOT/frontend/src/pages/certificates"
create_dir "$PROJECT_ROOT/frontend/src/pages/pricing"
create_dir "$PROJECT_ROOT/frontend/src/pages/checkout"
create_dir "$PROJECT_ROOT/frontend/src/pages/instructor"
create_dir "$PROJECT_ROOT/frontend/src/pages/marketing"
create_dir "$PROJECT_ROOT/frontend/src/pages/compliance"
create_dir "$PROJECT_ROOT/frontend/src/pages/public"
create_dir "$PROJECT_ROOT/frontend/src/pages/settings"
create_dir "$PROJECT_ROOT/frontend/src/pages/errors"
echo ""

# Frontend Components (Domain-Organized)
echo -e "${YELLOW}📁 Frontend Components${NC}"
create_dir "$PROJECT_ROOT/frontend/src/components/common"
create_dir "$PROJECT_ROOT/frontend/src/components/layout"
create_dir "$PROJECT_ROOT/frontend/src/components/ui"
create_dir "$PROJECT_ROOT/frontend/src/components/ai"
create_dir "$PROJECT_ROOT/frontend/src/components/gamification"
create_dir "$PROJECT_ROOT/frontend/src/components/analytics"
create_dir "$PROJECT_ROOT/frontend/src/components/video"
create_dir "$PROJECT_ROOT/frontend/src/components/lessons"
create_dir "$PROJECT_ROOT/frontend/src/components/quiz"
create_dir "$PROJECT_ROOT/frontend/src/components/flashcards"
create_dir "$PROJECT_ROOT/frontend/src/components/exercises"
create_dir "$PROJECT_ROOT/frontend/src/components/dashboard"
create_dir "$PROJECT_ROOT/frontend/src/components/progress"
create_dir "$PROJECT_ROOT/frontend/src/components/notifications"
create_dir "$PROJECT_ROOT/frontend/src/components/search"
create_dir "$PROJECT_ROOT/frontend/src/components/settings"
create_dir "$PROJECT_ROOT/frontend/src/components/community"
create_dir "$PROJECT_ROOT/frontend/src/components/admin"
create_dir "$PROJECT_ROOT/frontend/src/components/code"
create_dir "$PROJECT_ROOT/frontend/src/components/playground"
create_dir "$PROJECT_ROOT/frontend/src/components/achievements"
create_dir "$PROJECT_ROOT/frontend/src/components/accessibility"
create_dir "$PROJECT_ROOT/frontend/src/components/routes"
echo ""

# Frontend Other Folders
echo -e "${YELLOW}📁 Frontend Infrastructure${NC}"
create_dir "$PROJECT_ROOT/frontend/src/stores"
create_dir "$PROJECT_ROOT/frontend/src/hooks"
create_dir "$PROJECT_ROOT/frontend/src/services"
create_dir "$PROJECT_ROOT/frontend/src/utils"
create_dir "$PROJECT_ROOT/frontend/src/utils/optimization"
create_dir "$PROJECT_ROOT/frontend/src/utils/security"
create_dir "$PROJECT_ROOT/frontend/src/types"
create_dir "$PROJECT_ROOT/frontend/src/constants"
create_dir "$PROJECT_ROOT/frontend/src/styles"
create_dir "$PROJECT_ROOT/frontend/src/routes"
create_dir "$PROJECT_ROOT/frontend/src/lib/srs"
create_dir "$PROJECT_ROOT/frontend/src/lib/db"
create_dir "$PROJECT_ROOT/frontend/src/lib/api"
create_dir "$PROJECT_ROOT/frontend/src/lib/sync"
create_dir "$PROJECT_ROOT/frontend/src/lib/analytics"
create_dir "$PROJECT_ROOT/frontend/src/lib/gamification"
create_dir "$PROJECT_ROOT/frontend/src/lib/notifications"
create_dir "$PROJECT_ROOT/frontend/src/lib/progress"
create_dir "$PROJECT_ROOT/frontend/src/lib/search"
create_dir "$PROJECT_ROOT/frontend/src/lib/validation"
create_dir "$PROJECT_ROOT/frontend/src/lib/cards"
create_dir "$PROJECT_ROOT/frontend/src/lib/codeExecution"
create_dir "$PROJECT_ROOT/frontend/src/lib/achievements"
create_dir "$PROJECT_ROOT/frontend/src/lib/store"
create_dir "$PROJECT_ROOT/frontend/src/lib/query"
create_dir "$PROJECT_ROOT/frontend/src/lib/types"
create_dir "$PROJECT_ROOT/frontend/src/lib/utils"
echo ""

# Frontend i18n
echo -e "${YELLOW}📁 Frontend Internationalization${NC}"
create_dir "$PROJECT_ROOT/frontend/src/i18n"
create_dir "$PROJECT_ROOT/frontend/src/locales/en"
create_dir "$PROJECT_ROOT/frontend/src/locales/es"
create_dir "$PROJECT_ROOT/frontend/src/locales/fr"
create_dir "$PROJECT_ROOT/frontend/src/locales/de"
create_dir "$PROJECT_ROOT/frontend/src/locales/ja"
create_dir "$PROJECT_ROOT/frontend/src/locales/zh"
create_dir "$PROJECT_ROOT/frontend/src/locales/ar"
create_dir "$PROJECT_ROOT/frontend/src/locales/he"
echo ""

# Frontend Data
echo -e "${YELLOW}📁 Frontend Data${NC}"
create_dir "$PROJECT_ROOT/frontend/src/data/curriculum/30-day"
create_dir "$PROJECT_ROOT/frontend/src/data/curriculum/60-day"
create_dir "$PROJECT_ROOT/frontend/src/data/lessons"
create_dir "$PROJECT_ROOT/frontend/src/data/exercises"
create_dir "$PROJECT_ROOT/frontend/src/data/flashcards"
echo ""

###############################################################################
# DOCUMENTATION STRUCTURE
###############################################################################

echo -e "${BLUE}Creating Documentation Folder Structure...${NC}"
echo ""

echo -e "${YELLOW}📁 Documentation${NC}"
create_dir "$PROJECT_ROOT/docs/user/getting-started"
create_dir "$PROJECT_ROOT/docs/user/features"
create_dir "$PROJECT_ROOT/docs/user/guides"
create_dir "$PROJECT_ROOT/docs/developer/setup"
create_dir "$PROJECT_ROOT/docs/developer/architecture"
create_dir "$PROJECT_ROOT/docs/developer/architecture/diagrams"
create_dir "$PROJECT_ROOT/docs/developer/api"
create_dir "$PROJECT_ROOT/docs/developer/api/endpoints"
create_dir "$PROJECT_ROOT/docs/developer/contributing"
create_dir "$PROJECT_ROOT/docs/developer/guides"
create_dir "$PROJECT_ROOT/docs/developer/reference"
create_dir "$PROJECT_ROOT/docs/admin/getting-started"
create_dir "$PROJECT_ROOT/docs/admin/features"
create_dir "$PROJECT_ROOT/docs/admin/guides"
create_dir "$PROJECT_ROOT/docs/admin/reference"
create_dir "$PROJECT_ROOT/docs/deployment"
create_dir "$PROJECT_ROOT/docs/deployment/environments"
create_dir "$PROJECT_ROOT/docs/deployment/platforms"
create_dir "$PROJECT_ROOT/docs/deployment/ci-cd"
create_dir "$PROJECT_ROOT/docs/deployment/monitoring"
create_dir "$PROJECT_ROOT/docs/deployment/security"
create_dir "$PROJECT_ROOT/docs/compliance"
create_dir "$PROJECT_ROOT/docs/integrations/lms"
create_dir "$PROJECT_ROOT/docs/integrations/hr-systems"
create_dir "$PROJECT_ROOT/docs/integrations/communications"
create_dir "$PROJECT_ROOT/docs/integrations/crm"
create_dir "$PROJECT_ROOT/docs/integrations/sso"
create_dir "$PROJECT_ROOT/docs/integrations/payments"
create_dir "$PROJECT_ROOT/docs/features"
create_dir "$PROJECT_ROOT/docs/tutorials"
create_dir "$PROJECT_ROOT/docs/changelog"
create_dir "$PROJECT_ROOT/docs/reference"
echo ""

###############################################################################
# INFRASTRUCTURE STRUCTURE
###############################################################################

echo -e "${BLUE}Creating Infrastructure Folder Structure...${NC}"
echo ""

echo -e "${YELLOW}📁 Infrastructure${NC}"
create_dir "$PROJECT_ROOT/infrastructure/docker/development"
create_dir "$PROJECT_ROOT/infrastructure/docker/production"
create_dir "$PROJECT_ROOT/infrastructure/docker/sandbox"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/base"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/overlays/development"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/overlays/staging"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/overlays/production"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/monitoring/prometheus"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/monitoring/grafana"
create_dir "$PROJECT_ROOT/infrastructure/kubernetes/monitoring/jaeger"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/vpc"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/eks"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/rds"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/elasticache"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/s3"
create_dir "$PROJECT_ROOT/infrastructure/terraform/modules/cloudfront"
create_dir "$PROJECT_ROOT/infrastructure/terraform/environments/development"
create_dir "$PROJECT_ROOT/infrastructure/terraform/environments/staging"
create_dir "$PROJECT_ROOT/infrastructure/terraform/environments/production"
create_dir "$PROJECT_ROOT/infrastructure/scripts/setup"
create_dir "$PROJECT_ROOT/infrastructure/scripts/deployment"
create_dir "$PROJECT_ROOT/infrastructure/scripts/maintenance"
create_dir "$PROJECT_ROOT/infrastructure/scripts/monitoring"
create_dir "$PROJECT_ROOT/infrastructure/monitoring/prometheus/alerts"
create_dir "$PROJECT_ROOT/infrastructure/monitoring/prometheus/rules"
create_dir "$PROJECT_ROOT/infrastructure/monitoring/grafana/dashboards"
create_dir "$PROJECT_ROOT/infrastructure/monitoring/grafana/datasources"
create_dir "$PROJECT_ROOT/infrastructure/monitoring/jaeger"
echo ""

###############################################################################
# TESTING STRUCTURE
###############################################################################

echo -e "${BLUE}Creating Testing Folder Structure...${NC}"
echo ""

echo -e "${YELLOW}📁 Tests${NC}"
create_dir "$PROJECT_ROOT/tests/e2e/playwright/fixtures"
create_dir "$PROJECT_ROOT/tests/e2e/playwright/pages"
create_dir "$PROJECT_ROOT/tests/e2e/playwright/tests"
create_dir "$PROJECT_ROOT/tests/e2e/playwright/utils"
create_dir "$PROJECT_ROOT/tests/e2e/selenium/java"
create_dir "$PROJECT_ROOT/tests/integration/api"
create_dir "$PROJECT_ROOT/tests/integration/services"
create_dir "$PROJECT_ROOT/tests/integration/database"
create_dir "$PROJECT_ROOT/tests/accessibility"
create_dir "$PROJECT_ROOT/tests/performance/load-testing/k6"
create_dir "$PROJECT_ROOT/tests/performance/load-testing/artillery"
create_dir "$PROJECT_ROOT/tests/performance/lighthouse"
create_dir "$PROJECT_ROOT/tests/performance/benchmarks"
create_dir "$PROJECT_ROOT/tests/security/penetration"
create_dir "$PROJECT_ROOT/tests/security/vulnerability-scanning"
create_dir "$PROJECT_ROOT/tests/i18n"
create_dir "$PROJECT_ROOT/tests/visual/screenshots"
create_dir "$PROJECT_ROOT/tests/fixtures"
echo ""

###############################################################################
# SCRIPTS STRUCTURE
###############################################################################

echo -e "${BLUE}Creating Scripts Folder Structure...${NC}"
echo ""

echo -e "${YELLOW}📁 Scripts${NC}"
create_dir "$PROJECT_ROOT/scripts/setup"
create_dir "$PROJECT_ROOT/scripts/deployment"
create_dir "$PROJECT_ROOT/scripts/maintenance"
create_dir "$PROJECT_ROOT/scripts/migration"
create_dir "$PROJECT_ROOT/scripts/data"
create_dir "$PROJECT_ROOT/scripts/testing"
create_dir "$PROJECT_ROOT/scripts/ci"
echo ""

###############################################################################
# CREATE INDEX FILES
###############################################################################

echo -e "${BLUE}Creating Barrel Export Files (index.ts)...${NC}"
echo ""

# Backend barrel exports
create_index_file "$PROJECT_ROOT/backend/src/models/user/index.ts" "User domain models barrel export"
create_index_file "$PROJECT_ROOT/backend/src/models/learning/index.ts" "Learning domain models barrel export"
create_index_file "$PROJECT_ROOT/backend/src/models/gamification/index.ts" "Gamification domain models barrel export"
create_index_file "$PROJECT_ROOT/backend/src/models/commerce/index.ts" "Commerce domain models barrel export"
create_index_file "$PROJECT_ROOT/backend/src/models/enterprise/index.ts" "Enterprise domain models barrel export"
create_index_file "$PROJECT_ROOT/backend/src/models/index.ts" "Models master barrel export"

create_index_file "$PROJECT_ROOT/backend/src/controllers/auth/index.ts" "Auth controllers barrel export"
create_index_file "$PROJECT_ROOT/backend/src/controllers/learning/index.ts" "Learning controllers barrel export"
create_index_file "$PROJECT_ROOT/backend/src/controllers/index.ts" "Controllers master barrel export"

create_index_file "$PROJECT_ROOT/backend/src/services/auth/index.ts" "Auth services barrel export"
create_index_file "$PROJECT_ROOT/backend/src/services/ai/index.ts" "AI services barrel export"
create_index_file "$PROJECT_ROOT/backend/src/services/learning/index.ts" "Learning services barrel export"
create_index_file "$PROJECT_ROOT/backend/src/services/index.ts" "Services master barrel export"

# Frontend barrel exports
create_index_file "$PROJECT_ROOT/frontend/src/pages/auth/index.ts" "Auth pages barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/pages/dashboard/index.ts" "Dashboard pages barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/pages/lessons/index.ts" "Lessons pages barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/pages/index.ts" "Pages master barrel export"

create_index_file "$PROJECT_ROOT/frontend/src/components/common/index.ts" "Common components barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/components/layout/index.ts" "Layout components barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/components/ui/index.ts" "UI components barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/components/lessons/index.ts" "Lessons components barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/components/index.ts" "Components master barrel export"

create_index_file "$PROJECT_ROOT/frontend/src/stores/index.ts" "Stores barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/hooks/index.ts" "Hooks barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/services/index.ts" "Services barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/utils/index.ts" "Utils barrel export"
create_index_file "$PROJECT_ROOT/frontend/src/types/index.ts" "Types barrel export"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Folder Structure Created Successfully! ✓              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the created folder structure"
echo "2. Check file-mapping.json for file relocation guide"
echo "3. Follow REFACTORING_GUIDE.md for migration steps"
echo "4. Configure path aliases in tsconfig.json"
echo "5. Create barrel exports (index.ts files)"
echo "6. Begin gradual file migration"
echo ""
echo -e "${YELLOW}⚠️  Remember: This script only creates folders. Files are NOT moved.${NC}"
echo -e "${YELLOW}   Use the file mapping guide to manually move files.${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- FOLDER_STRUCTURE.md     - Complete structure reference"
echo "- REFACTORING_GUIDE.md    - Step-by-step migration guide"
echo "- file-mapping.json       - File relocation mapping"
echo "- tsconfig.paths.json     - Path aliases configuration"
echo ""
echo -e "${GREEN}Done! Happy refactoring! 🚀${NC}"
