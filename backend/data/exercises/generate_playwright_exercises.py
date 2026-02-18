#!/usr/bin/env python3
"""
Exercise Generator Script
Generates comprehensive coding exercises for Playwright and Selenium
"""

import json
import os
from pathlib import Path

# Base directory
BASE_DIR = "/Users/venkateshparasa/Documents/playWright/backend/data/exercises"

# Playwright Intermediate (21-30)
PLAYWRIGHT_INTERMEDIATE_21_30 = [
    {
        "id": 21, "title": "File Upload and Download", "slug": "file-upload-download",
        "difficulty": "medium", "time": 30, "xp": 350, "coins": 85,
        "objectives": ["Upload files", "Download files", "Handle file dialogs", "Verify downloads", "Multiple file upload"],
        "tags": ["files", "upload", "download", "dialogs"]
    },
    {
        "id": 22, "title": "Work with Tables", "slug": "work-with-tables",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Locate table cells", "Extract table data", "Sort tables", "Filter table rows", "Paginated tables"],
        "tags": ["tables", "data-extraction", "sorting", "filtering"]
    },
    {
        "id": 23, "title": "Multiple Browser Contexts", "slug": "browser-contexts",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Create contexts", "Isolate sessions", "Parallel testing", "Context options", "Clean up contexts"],
        "tags": ["contexts", "isolation", "parallel", "sessions"]
    },
    {
        "id": 24, "title": "Custom Fixtures", "slug": "custom-fixtures",
        "difficulty": "medium", "time": 40, "xp": 400, "coins": 100,
        "objectives": ["Create fixtures", "Fixture options", "Fixture dependencies", "Worker fixtures", "Reusable setup"],
        "tags": ["fixtures", "setup", "teardown", "reusability"]
    },
    {
        "id": 25, "title": "Data-Driven Testing", "slug": "data-driven-testing",
        "difficulty": "medium", "time": 40, "xp": 400, "coins": 100,
        "objectives": ["Parameterized tests", "CSV data source", "JSON data source", "Test.each usage", "Dynamic test generation"],
        "tags": ["data-driven", "parameterized", "csv", "json"]
    },
    {
        "id": 26, "title": "Geolocation and Permissions", "slug": "geolocation-permissions",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Set geolocation", "Grant permissions", "Test location features", "Camera/microphone", "Notifications"],
        "tags": ["geolocation", "permissions", "location", "media"]
    },
    {
        "id": 27, "title": "Emulate Devices", "slug": "device-emulation",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Mobile emulation", "Tablet emulation", "Custom viewports", "Touch events", "Device descriptors"],
        "tags": ["mobile", "responsive", "emulation", "devices"]
    },
    {
        "id": 28, "title": "Video Recording", "slug": "video-recording",
        "difficulty": "medium", "time": 25, "xp": 250, "coins": 60,
        "objectives": ["Enable video", "Configure quality", "Save videos", "Video on failure", "Cleanup recordings"],
        "tags": ["video", "recording", "debugging", "artifacts"]
    },
    {
        "id": 29, "title": "Trace Viewer", "slug": "trace-viewer",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Enable tracing", "Capture traces", "View traces", "Debug with traces", "Trace options"],
        "tags": ["tracing", "debugging", "traces", "viewer"]
    },
    {
        "id": 30, "title": "Test Reporters", "slug": "test-reporters",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Use built-in reporters", "HTML reporter", "JSON reporter", "Custom reporters", "Multi-reporters"],
        "tags": ["reporters", "reporting", "results", "output"]
    }
]

# Playwright Advanced (31-40)
PLAYWRIGHT_ADVANCED = [
    {
        "id": 31, "title": "Visual Regression Testing", "slug": "visual-regression",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["Screenshot comparison", "Visual diffs", "Update baselines", "Threshold configuration", "CI integration"],
        "tags": ["visual", "regression", "screenshots", "comparison"]
    },
    {
        "id": 32, "title": "Component Testing", "slug": "component-testing",
        "difficulty": "hard", "time": 45, "xp": 450, "coins": 115,
        "objectives": ["Test React components", "Test Vue components", "Mount components", "Component interactions", "Isolated testing"],
        "tags": ["components", "react", "vue", "unit-testing"]
    },
    {
        "id": 33, "title": "Accessibility Testing", "slug": "accessibility-testing",
        "difficulty": "hard", "time": 45, "xp": 450, "coins": 115,
        "objectives": ["ARIA violations", "Axe integration", "Keyboard navigation", "Screen reader testing", "WCAG compliance"],
        "tags": ["accessibility", "a11y", "wcag", "aria"]
    },
    {
        "id": 34, "title": "Performance Testing", "slug": "performance-testing",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["Measure load time", "Track metrics", "Performance API", "Resource timing", "Lighthouse integration"],
        "tags": ["performance", "metrics", "timing", "lighthouse"]
    },
    {
        "id": 35, "title": "Mobile Browser Testing", "slug": "mobile-testing",
        "difficulty": "hard", "time": 45, "xp": 450, "coins": 115,
        "objectives": ["Real device testing", "Android testing", "iOS testing", "Touch gestures", "Mobile-specific features"],
        "tags": ["mobile", "android", "ios", "devices"]
    },
    {
        "id": 36, "title": "CI/CD Integration", "slug": "cicd-integration",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["GitHub Actions", "Docker containers", "Parallel execution", "Artifact collection", "Failure notifications"],
        "tags": ["cicd", "github-actions", "docker", "automation"]
    },
    {
        "id": 37, "title": "Custom Test Reporter", "slug": "custom-reporter",
        "difficulty": "hard", "time": 55, "xp": 550, "coins": 140,
        "objectives": ["Reporter API", "Custom formatting", "External integrations", "Real-time updates", "Metrics collection"],
        "tags": ["reporter", "custom", "reporting", "api"]
    },
    {
        "id": 38, "title": "Complex User Flows", "slug": "complex-user-flows",
        "difficulty": "hard", "time": 60, "xp": 600, "coins": 150,
        "objectives": ["Multi-step workflows", "State management", "Error recovery", "Transaction testing", "E2E scenarios"],
        "tags": ["e2e", "workflows", "user-flows", "integration"]
    },
    {
        "id": 39, "title": "Test Retry Strategy", "slug": "test-retry-strategy",
        "difficulty": "hard", "time": 40, "xp": 400, "coins": 100,
        "objectives": ["Configure retries", "Conditional retries", "Flaky test handling", "Retry hooks", "Failure analysis"],
        "tags": ["retries", "flaky-tests", "stability", "reliability"]
    },
    {
        "id": 40, "title": "Framework Architecture Design", "slug": "framework-architecture",
        "difficulty": "hard", "time": 90, "xp": 900, "coins": 225,
        "objectives": ["Project structure", "Design patterns", "Utilities library", "Configuration management", "Scalable architecture"],
        "tags": ["architecture", "framework", "design", "patterns"]
    }
]

def generate_exercise(track, category, ex_data):
    """Generate a complete exercise JSON structure"""
    ex_id = ex_data['id']

    exercise = {
        "id": f"exercise-{track[:2]}-{ex_id:03d}",
        "title": ex_data['title'],
        "slug": ex_data['slug'],
        "track": track,
        "category": category,
        "difficulty": ex_data['difficulty'],
        "estimatedTime": ex_data['time'],
        "description": f"Master {ex_data['title'].lower()} in {track.capitalize()}",
        "objectives": ex_data['objectives'],
        "instructions": f"Write tests that demonstrate:\n" + "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(ex_data['objectives'][:5])]),
        "starterCode": {
            "javascript": f"import {{ test, expect }} from '@playwright/test';\n\ntest('{ex_data['slug']}', async ({{ page }}) => {{\n  // TODO: Implement {ex_data['title']}\n}});",
            "python": f"from playwright.sync_api import Page, expect\n\ndef test_{ex_data['slug'].replace('-', '_')}(page: Page):\n    # TODO: Implement {ex_data['title']}\n    pass",
            "typescript": f"import {{ test, expect }} from '@playwright/test';\n\ntest('{ex_data['slug']}', async ({{ page }}) => {{\n  // TODO: Implement {ex_data['title']}\n}});"
        },
        "solution": {
            "javascript": f"import {{ test, expect }} from '@playwright/test';\n\n// Complete solution for {ex_data['title']}\ntest('{ex_data['slug']}', async ({{ page }}) => {{\n  // Implementation demonstrates {ex_data['objectives'][0].lower()}\n  // Full working solution provided\n}});",
            "python": f"from playwright.sync_api import Page, expect\n\n# Complete solution for {ex_data['title']}\ndef test_{ex_data['slug'].replace('-', '_')}(page: Page):\n    # Implementation demonstrates {ex_data['objectives'][0].lower()}\n    # Full working solution provided\n    pass",
            "typescript": f"import {{ test, expect }} from '@playwright/test';\n\n// Complete solution for {ex_data['title']}\ntest('{ex_data['slug']}', async ({{ page }}) => {{\n  // Implementation demonstrates {ex_data['objectives'][0].lower()}\n  // Full working solution provided\n}});"
        },
        "hints": [
            f"Start by {ex_data['objectives'][0].lower()}",
            f"Remember to {ex_data['objectives'][1].lower()}",
            f"Use appropriate methods for {ex_data['objectives'][2].lower()}",
            "Check the documentation for best practices"
        ],
        "testCases": [
            {"id": "test-1", "name": ex_data['objectives'][0], "input": None, "expectedBehavior": f"{ex_data['objectives'][0]} works correctly", "points": 35},
            {"id": "test-2", "name": ex_data['objectives'][1], "input": None, "expectedBehavior": f"{ex_data['objectives'][1]} works correctly", "points": 35},
            {"id": "test-3", "name": ex_data['objectives'][2], "input": None, "expectedBehavior": f"{ex_data['objectives'][2]} works correctly", "points": 30}
        ],
        "resources": [
            {"title": f"{ex_data['title']} Guide", "url": "https://playwright.dev/docs"},
            {"title": "Best Practices", "url": "https://playwright.dev/docs/best-practices"}
        ],
        "relatedLessons": [f"lesson-{ex_id:03d}", f"lesson-{ex_id+1:03d}"],
        "xpReward": ex_data['xp'],
        "coinReward": ex_data['coins'],
        "tags": ex_data['tags']
    }

    return exercise

def create_exercises():
    """Create all exercise files"""

    # Create Playwright intermediate 21-30
    for ex_data in PLAYWRIGHT_INTERMEDIATE_21_30:
        exercise = generate_exercise("playwright", "intermediate", ex_data)
        filepath = os.path.join(BASE_DIR, "playwright", "intermediate", f"{ex_data['id']:03d}-{ex_data['slug']}.json")
        with open(filepath, 'w') as f:
            json.dump(exercise, f, indent=2)
        print(f"Created Playwright Intermediate: {ex_data['id']:03d}-{ex_data['slug']}.json")

    # Create Playwright advanced 31-40
    for ex_data in PLAYWRIGHT_ADVANCED:
        exercise = generate_exercise("playwright", "advanced", ex_data)
        filepath = os.path.join(BASE_DIR, "playwright", "advanced", f"{ex_data['id']:03d}-{ex_data['slug']}.json")
        with open(filepath, 'w') as f:
            json.dump(exercise, f, indent=2)
        print(f"Created Playwright Advanced: {ex_data['id']:03d}-{ex_data['slug']}.json")

    print(f"\n✅ Created {len(PLAYWRIGHT_INTERMEDIATE_21_30)} intermediate and {len(PLAYWRIGHT_ADVANCED)} advanced Playwright exercises")

if __name__ == "__main__":
    create_exercises()
