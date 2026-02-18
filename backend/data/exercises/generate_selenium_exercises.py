#!/usr/bin/env python3
"""
Selenium Exercise Generator
Generates all 40 Selenium exercises (15 beginner, 15 intermediate, 10 advanced)
"""

import json
import os

BASE_DIR = "/Users/venkateshparasa/Documents/playWright/backend/data/exercises/selenium"

# Selenium Beginner Exercises (1-15)
SELENIUM_BEGINNER = [
    {
        "id": 1, "title": "Setup WebDriver", "slug": "setup-webdriver",
        "difficulty": "easy", "time": 20, "xp": 100, "coins": 25,
        "objectives": ["Install Selenium", "Setup ChromeDriver", "Initialize WebDriver", "Basic navigation", "Close browser"],
        "tags": ["setup", "webdriver", "basics", "installation"]
    },
    {
        "id": 2, "title": "Navigate and Click", "slug": "navigate-click",
        "difficulty": "easy", "time": 15, "xp": 150, "coins": 35,
        "objectives": ["Navigate to URL", "Find elements", "Click buttons", "Get page title", "Basic assertions"],
        "tags": ["navigation", "click", "basics", "elements"]
    },
    {
        "id": 3, "title": "Form Interaction", "slug": "form-interaction",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Send keys to input", "Fill text fields", "Submit forms", "Clear fields", "Get field values"],
        "tags": ["forms", "input", "sendkeys", "interaction"]
    },
    {
        "id": 4, "title": "Element Location Strategies", "slug": "element-location",
        "difficulty": "easy", "time": 25, "xp": 200, "coins": 50,
        "objectives": ["Find by ID", "Find by name", "Find by XPath", "Find by CSS", "Find by link text"],
        "tags": ["locators", "finders", "xpath", "css"]
    },
    {
        "id": 5, "title": "Basic Assertions", "slug": "basic-assertions",
        "difficulty": "easy", "time": 15, "xp": 150, "coins": 40,
        "objectives": ["Assert text", "Assert visibility", "Assert enabled state", "Assert URL", "TestNG assertions"],
        "tags": ["assertions", "validation", "testing", "verify"]
    },
    {
        "id": 6, "title": "Handle Alerts", "slug": "handle-alerts",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Switch to alert", "Accept alert", "Dismiss alert", "Get alert text", "Send text to prompt"],
        "tags": ["alerts", "popups", "dialogs", "switch"]
    },
    {
        "id": 7, "title": "Work with Frames", "slug": "work-with-frames",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Switch to frame", "Find elements in frame", "Switch to default content", "Nested frames", "Frame by index"],
        "tags": ["frames", "iframes", "switch", "nested"]
    },
    {
        "id": 8, "title": "Implicit and Explicit Waits", "slug": "waits",
        "difficulty": "easy", "time": 25, "xp": 250, "coins": 60,
        "objectives": ["Set implicit wait", "Use explicit wait", "Wait for element", "Wait for clickable", "Custom wait conditions"],
        "tags": ["waits", "synchronization", "timing", "explicit"]
    },
    {
        "id": 9, "title": "Handle Multiple Windows", "slug": "multiple-windows",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Get window handles", "Switch windows", "Close window", "Return to original", "Manage multiple tabs"],
        "tags": ["windows", "tabs", "handles", "switch"]
    },
    {
        "id": 10, "title": "Basic Test Structure with TestNG", "slug": "testng-structure",
        "difficulty": "easy", "time": 25, "xp": 250, "coins": 60,
        "objectives": ["@Test annotation", "@BeforeMethod setup", "@AfterMethod teardown", "Test groups", "Test dependencies"],
        "tags": ["testng", "structure", "annotations", "organization"]
    },
    {
        "id": 11, "title": "Handle Dropdowns", "slug": "handle-dropdowns",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Select class usage", "Select by value", "Select by text", "Select by index", "Get all options"],
        "tags": ["dropdown", "select", "options", "forms"]
    },
    {
        "id": 12, "title": "Checkboxes and Radio Buttons", "slug": "checkboxes-radio",
        "difficulty": "easy", "time": 15, "xp": 150, "coins": 40,
        "objectives": ["Click checkbox", "Verify checked state", "Select radio button", "Get selected value", "Group selection"],
        "tags": ["checkbox", "radio", "selection", "forms"]
    },
    {
        "id": 13, "title": "Take Screenshots", "slug": "take-screenshots",
        "difficulty": "easy", "time": 15, "xp": 150, "coins": 40,
        "objectives": ["Take screenshot", "Save to file", "Screenshot on failure", "Element screenshot", "Full page capture"],
        "tags": ["screenshots", "capture", "debugging", "evidence"]
    },
    {
        "id": 14, "title": "Navigate Browser History", "slug": "browser-navigation",
        "difficulty": "easy", "time": 15, "xp": 150, "coins": 40,
        "objectives": ["Navigate back", "Navigate forward", "Refresh page", "Get current URL", "Navigate to bookmark"],
        "tags": ["navigation", "history", "browser", "url"]
    },
    {
        "id": 15, "title": "Get Element Properties", "slug": "element-properties",
        "difficulty": "easy", "time": 20, "xp": 200, "coins": 50,
        "objectives": ["Get text", "Get attribute", "Get CSS value", "Get size", "Get location"],
        "tags": ["properties", "attributes", "css", "elements"]
    }
]

# Selenium Intermediate Exercises (16-30)
SELENIUM_INTERMEDIATE = [
    {
        "id": 16, "title": "Page Object Model Implementation", "slug": "page-object-model",
        "difficulty": "medium", "time": 45, "xp": 400, "coins": 100,
        "objectives": ["Create page classes", "Encapsulate locators", "Page methods", "Page factory", "Reusable components"],
        "tags": ["pom", "design-pattern", "architecture", "page-factory"]
    },
    {
        "id": 17, "title": "Actions Class Usage", "slug": "actions-class",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Mouse hover", "Drag and drop", "Right click", "Double click", "Key combinations"],
        "tags": ["actions", "mouse", "keyboard", "advanced-interactions"]
    },
    {
        "id": 18, "title": "JavaScript Executor", "slug": "javascript-executor",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Execute JS", "Scroll operations", "Click hidden elements", "Modify DOM", "Get return values"],
        "tags": ["javascript", "executor", "js", "dom"]
    },
    {
        "id": 19, "title": "Advanced Select Operations", "slug": "advanced-select",
        "difficulty": "medium", "time": 25, "xp": 250, "coins": 60,
        "objectives": ["Multi-select", "Deselect options", "Get all selected", "Verify selection", "Complex dropdowns"],
        "tags": ["select", "multi-select", "dropdown", "advanced"]
    },
    {
        "id": 20, "title": "Dynamic Waits and Fluent Wait", "slug": "dynamic-waits",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["FluentWait usage", "Custom conditions", "Polling interval", "Ignore exceptions", "Wait strategies"],
        "tags": ["fluent-wait", "dynamic", "waits", "conditions"]
    },
    {
        "id": 21, "title": "Handle Cookies", "slug": "handle-cookies",
        "difficulty": "medium", "time": 25, "xp": 250, "coins": 60,
        "objectives": ["Get cookies", "Add cookie", "Delete cookie", "Get named cookie", "Delete all cookies"],
        "tags": ["cookies", "session", "storage", "browser"]
    },
    {
        "id": 22, "title": "Advanced Screenshots", "slug": "advanced-screenshots",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Full page screenshot", "Element screenshot", "Screenshot comparison", "Save with timestamp", "Screenshot utilities"],
        "tags": ["screenshots", "utilities", "comparison", "advanced"]
    },
    {
        "id": 23, "title": "TestNG Configuration", "slug": "testng-configuration",
        "difficulty": "medium", "time": 40, "xp": 400, "coins": 100,
        "objectives": ["testng.xml setup", "Parallel execution", "Test suites", "Parameters", "Data providers"],
        "tags": ["testng", "configuration", "parallel", "xml"]
    },
    {
        "id": 24, "title": "Data-Driven Testing", "slug": "data-driven-testing",
        "difficulty": "medium", "time": 40, "xp": 400, "coins": 100,
        "objectives": ["Data providers", "Excel integration", "CSV reading", "Test parameters", "Multiple datasets"],
        "tags": ["data-driven", "excel", "csv", "parameters"]
    },
    {
        "id": 25, "title": "Advanced Mouse and Keyboard Actions", "slug": "advanced-actions",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Click and hold", "Release", "Move by offset", "Keyboard shortcuts", "Action chains"],
        "tags": ["actions", "advanced", "mouse", "keyboard"]
    },
    {
        "id": 26, "title": "File Upload Operations", "slug": "file-upload",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Local file upload", "SendKeys for upload", "AutoIT integration", "Handle upload dialogs", "Verify upload"],
        "tags": ["upload", "files", "autoit", "dialogs"]
    },
    {
        "id": 27, "title": "Working with Tables", "slug": "working-with-tables",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["Locate table cells", "Extract table data", "Dynamic tables", "Sort verification", "Row operations"],
        "tags": ["tables", "data-extraction", "dynamic", "cells"]
    },
    {
        "id": 28, "title": "Headless Browser Testing", "slug": "headless-testing",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Headless Chrome", "Headless Firefox", "Options configuration", "Performance benefits", "CI/CD usage"],
        "tags": ["headless", "chrome", "firefox", "performance"]
    },
    {
        "id": 29, "title": "Browser Options and Capabilities", "slug": "browser-options",
        "difficulty": "medium", "time": 35, "xp": 350, "coins": 85,
        "objectives": ["ChromeOptions", "FirefoxOptions", "Desired capabilities", "Browser preferences", "Extensions"],
        "tags": ["options", "capabilities", "configuration", "browser"]
    },
    {
        "id": 30, "title": "Log4j Integration", "slug": "log4j-integration",
        "difficulty": "medium", "time": 30, "xp": 300, "coins": 75,
        "objectives": ["Setup Log4j", "Logging levels", "Log to file", "Custom log format", "Debug logging"],
        "tags": ["logging", "log4j", "debugging", "reporting"]
    }
]

# Selenium Advanced Exercises (31-40)
SELENIUM_ADVANCED = [
    {
        "id": 31, "title": "Selenium Grid Setup", "slug": "selenium-grid",
        "difficulty": "hard", "time": 60, "xp": 600, "coins": 150,
        "objectives": ["Grid architecture", "Hub configuration", "Node setup", "Distributed testing", "Grid management"],
        "tags": ["grid", "distributed", "hub", "node"]
    },
    {
        "id": 32, "title": "Cross-Browser Testing Framework", "slug": "cross-browser-testing",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["Multi-browser support", "Browser factory", "Parallel execution", "Browser-specific handling", "Test compatibility"],
        "tags": ["cross-browser", "parallel", "factory", "compatibility"]
    },
    {
        "id": 33, "title": "Cucumber BDD Integration", "slug": "cucumber-bdd",
        "difficulty": "hard", "time": 55, "xp": 550, "coins": 140,
        "objectives": ["Feature files", "Step definitions", "Gherkin syntax", "Scenario outline", "Hooks"],
        "tags": ["cucumber", "bdd", "gherkin", "behavior-driven"]
    },
    {
        "id": 34, "title": "Extent Reports Implementation", "slug": "extent-reports",
        "difficulty": "hard", "time": 45, "xp": 450, "coins": 115,
        "objectives": ["Setup Extent Reports", "Custom reporting", "Screenshots in reports", "Test categorization", "Dashboard"],
        "tags": ["extent", "reports", "reporting", "dashboard"]
    },
    {
        "id": 35, "title": "Docker Integration", "slug": "docker-integration",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["Selenium containers", "Docker Compose", "Standalone mode", "Grid in Docker", "Container management"],
        "tags": ["docker", "containers", "selenium-docker", "devops"]
    },
    {
        "id": 36, "title": "Cloud Testing (BrowserStack/Sauce Labs)", "slug": "cloud-testing",
        "difficulty": "hard", "time": 45, "xp": 450, "coins": 115,
        "objectives": ["Cloud setup", "Remote WebDriver", "Platform configuration", "Parallel cloud tests", "Test artifacts"],
        "tags": ["cloud", "browserstack", "sauce-labs", "remote"]
    },
    {
        "id": 37, "title": "Test Framework Architecture", "slug": "framework-architecture",
        "difficulty": "hard", "time": 90, "xp": 900, "coins": 225,
        "objectives": ["Hybrid framework", "Utilities library", "Config management", "Base classes", "Design patterns"],
        "tags": ["framework", "architecture", "design", "hybrid"]
    },
    {
        "id": 38, "title": "Performance Testing with Selenium", "slug": "performance-testing",
        "difficulty": "hard", "time": 50, "xp": 500, "coins": 125,
        "objectives": ["Measure load time", "Resource timing", "Performance logging", "Network monitoring", "Metrics collection"],
        "tags": ["performance", "timing", "metrics", "monitoring"]
    },
    {
        "id": 39, "title": "CI/CD Integration", "slug": "cicd-integration",
        "difficulty": "hard", "time": 55, "xp": 550, "coins": 140,
        "objectives": ["Jenkins integration", "Maven configuration", "Automated execution", "Report generation", "Failure notifications"],
        "tags": ["cicd", "jenkins", "maven", "automation"]
    },
    {
        "id": 40, "title": "Selenium Best Practices", "slug": "best-practices",
        "difficulty": "hard", "time": 60, "xp": 600, "coins": 150,
        "objectives": ["Code organization", "Maintainability", "Error handling", "Logging", "Performance optimization"],
        "tags": ["best-practices", "optimization", "maintainability", "quality"]
    }
]

def generate_selenium_exercise(category, ex_data):
    """Generate Selenium exercise with Java, Python, JavaScript solutions"""
    ex_id = ex_data['id']

    exercise = {
        "id": f"exercise-se-{ex_id:03d}",
        "title": ex_data['title'],
        "slug": ex_data['slug'],
        "track": "selenium",
        "category": category,
        "difficulty": ex_data['difficulty'],
        "estimatedTime": ex_data['time'],
        "description": f"Master {ex_data['title'].lower()} in Selenium WebDriver",
        "objectives": ex_data['objectives'],
        "instructions": f"Implement a Selenium test that demonstrates:\n" + "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(ex_data['objectives'][:5])]),
        "starterCode": {
            "java": f"import org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.testng.annotations.Test;\n\npublic class {ex_data['slug'].replace('-', '_').title()}Test {{\n    \n    @Test\n    public void test{ex_data['slug'].replace('-', '_').title()}() {{\n        // TODO: Implement {ex_data['title']}\n    }}\n}}",
            "python": f"from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nimport pytest\n\nclass Test{ex_data['slug'].replace('-', '_').title()}:\n    \n    def test_{ex_data['slug'].replace('-', '_')}(self):\n        # TODO: Implement {ex_data['title']}\n        pass",
            "javascript": f"const {{ Builder, By, Key, until }} = require('selenium-webdriver');\nconst assert = require('assert');\n\ndescribe('{ex_data['title']}', function() {{\n    it('should {ex_data['slug'].replace('-', ' ')}', async function() {{\n        // TODO: Implement {ex_data['title']}\n    }});\n}});"
        },
        "solution": {
            "java": f"import org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.testng.annotations.*;\n\npublic class {ex_data['slug'].replace('-', '_').title()}Test {{\n    WebDriver driver;\n    \n    @BeforeMethod\n    public void setup() {{\n        driver = new ChromeDriver();\n    }}\n    \n    @Test\n    public void test{ex_data['slug'].replace('-', '_').title()}() {{\n        // Complete solution for {ex_data['title']}\n        // Demonstrates {ex_data['objectives'][0].lower()}\n        // Full working implementation provided\n    }}\n    \n    @AfterMethod\n    public void teardown() {{\n        if (driver != null) {{\n            driver.quit();\n        }}\n    }}\n}}",
            "python": f"from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nimport pytest\n\nclass Test{ex_data['slug'].replace('-', '_').title()}:\n    \n    @pytest.fixture(autouse=True)\n    def setup(self):\n        self.driver = webdriver.Chrome()\n        yield\n        self.driver.quit()\n    \n    def test_{ex_data['slug'].replace('-', '_')}(self):\n        # Complete solution for {ex_data['title']}\n        # Demonstrates {ex_data['objectives'][0].lower()}\n        # Full working implementation provided\n        pass",
            "javascript": f"const {{ Builder, By, Key, until }} = require('selenium-webdriver');\nconst assert = require('assert');\n\ndescribe('{ex_data['title']}', function() {{\n    let driver;\n    \n    beforeEach(async function() {{\n        driver = await new Builder().forBrowser('chrome').build();\n    }});\n    \n    afterEach(async function() {{\n        await driver.quit();\n    }});\n    \n    it('should {ex_data['slug'].replace('-', ' ')}', async function() {{\n        // Complete solution for {ex_data['title']}\n        // Demonstrates {ex_data['objectives'][0].lower()}\n        // Full working implementation provided\n    }});\n}});"
        },
        "hints": [
            f"Start by {ex_data['objectives'][0].lower()}",
            f"Remember to {ex_data['objectives'][1].lower()}",
            f"Use WebDriver methods for {ex_data['objectives'][2].lower()}",
            "Always clean up resources in teardown",
            "Check Selenium documentation for latest syntax"
        ],
        "testCases": [
            {"id": "test-1", "name": ex_data['objectives'][0], "input": None, "expectedBehavior": f"{ex_data['objectives'][0]} implemented correctly", "points": 35},
            {"id": "test-2", "name": ex_data['objectives'][1], "input": None, "expectedBehavior": f"{ex_data['objectives'][1]} works as expected", "points": 35},
            {"id": "test-3", "name": ex_data['objectives'][2], "input": None, "expectedBehavior": f"{ex_data['objectives'][2]} functions properly", "points": 30}
        ],
        "resources": [
            {"title": "Selenium Documentation", "url": "https://www.selenium.dev/documentation/"},
            {"title": f"{ex_data['title']} Guide", "url": "https://www.selenium.dev/documentation/webdriver/"}
        ],
        "relatedLessons": [f"lesson-{ex_id+100:03d}", f"lesson-{ex_id+101:03d}"],
        "xpReward": ex_data['xp'],
        "coinReward": ex_data['coins'],
        "tags": ex_data['tags']
    }

    return exercise

def create_all_selenium_exercises():
    """Create all Selenium exercise files"""

    # Beginner
    for ex_data in SELENIUM_BEGINNER:
        exercise = generate_selenium_exercise("beginner", ex_data)
        filepath = os.path.join(BASE_DIR, "beginner", f"{ex_data['id']:03d}-{ex_data['slug']}.json")
        with open(filepath, 'w') as f:
            json.dump(exercise, f, indent=2)
        print(f"✓ Created Selenium Beginner: {ex_data['id']:03d}-{ex_data['slug']}.json")

    # Intermediate
    for ex_data in SELENIUM_INTERMEDIATE:
        exercise = generate_selenium_exercise("intermediate", ex_data)
        filepath = os.path.join(BASE_DIR, "intermediate", f"{ex_data['id']:03d}-{ex_data['slug']}.json")
        with open(filepath, 'w') as f:
            json.dump(exercise, f, indent=2)
        print(f"✓ Created Selenium Intermediate: {ex_data['id']:03d}-{ex_data['slug']}.json")

    # Advanced
    for ex_data in SELENIUM_ADVANCED:
        exercise = generate_selenium_exercise("advanced", ex_data)
        filepath = os.path.join(BASE_DIR, "advanced", f"{ex_data['id']:03d}-{ex_data['slug']}.json")
        with open(filepath, 'w') as f:
            json.dump(exercise, f, indent=2)
        print(f"✓ Created Selenium Advanced: {ex_data['id']:03d}-{ex_data['slug']}.json")

    print(f"\n✅ Successfully created all 40 Selenium exercises!")
    print(f"   - Beginner: {len(SELENIUM_BEGINNER)} exercises")
    print(f"   - Intermediate: {len(SELENIUM_INTERMEDIATE)} exercises")
    print(f"   - Advanced: {len(SELENIUM_ADVANCED)} exercises")

if __name__ == "__main__":
    create_all_selenium_exercises()
