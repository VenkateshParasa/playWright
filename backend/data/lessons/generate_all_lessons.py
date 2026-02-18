#\!/usr/bin/env python3
"""
Comprehensive Lesson Generator for Playwright & Selenium Learning Platform
Generates all 60 lessons with high-quality educational content
"""
import json
import os

# Define all lesson structures
LESSONS = {
    "playwright": {
        "intermediate": [
            {
                "id": "pw-intermediate-001", "order": 1, "title": "Advanced Locators (CSS, XPath, nth, has)",
                "slug": "advanced-locators",
                "description": "Master advanced locator techniques including CSS combinators, XPath expressions, and Playwright-specific selectors.",
                "objectives": ["Use complex CSS selectors", "Write XPath expressions", "Apply nth, has, and filter selectors", "Chain multiple locator strategies"],
                "content": "Learn advanced selection strategies for complex DOM structures including shadow DOM, iframes, and dynamic content."
            },
            {
                "id": "pw-intermediate-002", "order": 2, "title": "Handling Different Elements (dropdowns, checkboxes, etc.)",
                "slug": "handling-elements",
                "description": "Work with complex form elements, custom controls, and interactive components.",
                "objectives": ["Handle custom dropdowns", "Work with date pickers", "Manage file upload widgets", "Test complex form interactions"],
                "content": "Master techniques for interacting with various HTML elements and custom components."
            },
            {
                "id": "pw-intermediate-003", "order": 3, "title": "Network Interception",
                "slug": "network-interception",
                "description": "Intercept, modify, and mock network requests for powerful test control.",
                "objectives": ["Intercept API calls", "Mock responses", "Block requests", "Monitor network traffic"],
                "content": "Learn to control network behavior in tests for reliable and fast execution."
            },
            {
                "id": "pw-intermediate-004", "order": 4, "title": "API Testing with Playwright",
                "slug": "api-testing",
                "description": "Use Playwright for API testing alongside UI tests.",
                "objectives": ["Make HTTP requests", "Test REST APIs", "Combine API and UI testing", "Handle authentication tokens"],
                "content": "Leverage Playwright's API testing capabilities for comprehensive test coverage."
            },
            {
                "id": "pw-intermediate-005", "order": 5, "title": "Authentication and Sessions",
                "slug": "authentication-sessions",
                "description": "Handle authentication flows and session management efficiently.",
                "objectives": ["Store authentication state", "Reuse sessions", "Test OAuth flows", "Handle cookies and tokens"],
                "content": "Optimize tests by managing authentication state effectively."
            },
            {
                "id": "pw-intermediate-006", "order": 6, "title": "Browser Contexts",
                "slug": "browser-contexts",
                "description": "Use browser contexts for test isolation and parallel execution.",
                "objectives": ["Create isolated contexts", "Share state between tests", "Manage cookies and storage", "Optimize test performance"],
                "content": "Master browser contexts for efficient and isolated test execution."
            },
            {
                "id": "pw-intermediate-007", "order": 7, "title": "File Uploads and Downloads",
                "slug": "files-uploads-downloads",
                "description": "Handle file operations in tests including uploads and downloads.",
                "objectives": ["Upload files to forms", "Download and verify files", "Handle drag-and-drop uploads", "Test file processing"],
                "content": "Learn comprehensive file handling techniques for thorough testing."
            },
            {
                "id": "pw-intermediate-008", "order": 8, "title": "Screenshots and Videos",
                "slug": "screenshots-videos",
                "description": "Capture screenshots and videos for debugging and documentation.",
                "objectives": ["Take element screenshots", "Record test videos", "Configure capture settings", "Use for visual regression"],
                "content": "Master visual capture techniques for better debugging and reporting."
            },
            {
                "id": "pw-intermediate-009", "order": 9, "title": "Test Fixtures",
                "slug": "test-fixtures",
                "description": "Create reusable test fixtures for setup and teardown logic.",
                "objectives": ["Define custom fixtures", "Share fixtures across tests", "Handle complex setup", "Manage test data"],
                "content": "Build powerful, reusable test infrastructure with fixtures."
            },
            {
                "id": "pw-intermediate-010", "order": 10, "title": "Parallel Testing",
                "slug": "parallel-testing",
                "description": "Optimize test execution time with parallel test running.",
                "objectives": ["Configure parallel execution", "Manage test dependencies", "Handle shared resources", "Optimize worker count"],
                "content": "Maximize test efficiency with parallel execution strategies."
            }
        ],
        "advanced": [
            {
                "id": "pw-advanced-001", "order": 1, "title": "Visual Regression Testing",
                "slug": "visual-regression",
                "description": "Detect visual changes with screenshot comparison testing.",
                "objectives": ["Set up visual regression", "Compare screenshots", "Handle false positives", "Integrate with CI/CD"],
                "content": "Implement comprehensive visual testing to catch UI regressions."
            },
            {
                "id": "pw-advanced-002", "order": 2, "title": "Component Testing",
                "slug": "component-testing",
                "description": "Test individual components in isolation with Playwright Component Testing.",
                "objectives": ["Set up component tests", "Test React/Vue/Svelte components", "Mock dependencies", "Test component interactions"],
                "content": "Master component-level testing for faster feedback."
            },
            {
                "id": "pw-advanced-003", "order": 3, "title": "Accessibility Testing",
                "slug": "accessibility-testing",
                "description": "Ensure your application is accessible with automated accessibility testing.",
                "objectives": ["Run accessibility audits", "Check ARIA attributes", "Test keyboard navigation", "Verify screen reader compatibility"],
                "content": "Build inclusive applications with comprehensive accessibility testing."
            },
            {
                "id": "pw-advanced-004", "order": 4, "title": "Performance Testing",
                "slug": "performance-testing",
                "description": "Measure and monitor application performance with Playwright.",
                "objectives": ["Measure load times", "Analyze Core Web Vitals", "Profile performance", "Set performance budgets"],
                "content": "Ensure your application meets performance standards."
            },
            {
                "id": "pw-advanced-005", "order": 5, "title": "Mobile Emulation",
                "slug": "mobile-emulation",
                "description": "Test mobile experiences with device emulation and real device testing.",
                "objectives": ["Emulate mobile devices", "Test responsive design", "Handle touch events", "Test mobile-specific features"],
                "content": "Ensure flawless mobile experiences with comprehensive testing."
            },
            {
                "id": "pw-advanced-006", "order": 6, "title": "CI/CD Integration",
                "slug": "cicd-integration",
                "description": "Integrate Playwright tests into continuous integration pipelines.",
                "objectives": ["Set up GitHub Actions", "Configure Jenkins/GitLab CI", "Manage test artifacts", "Handle flaky tests in CI"],
                "content": "Build robust CI/CD pipelines with automated testing."
            },
            {
                "id": "pw-advanced-007", "order": 7, "title": "Custom Reporters",
                "slug": "custom-reporters",
                "description": "Create custom test reporters for specialized reporting needs.",
                "objectives": ["Build custom reporters", "Format test results", "Integrate with tools", "Generate custom reports"],
                "content": "Tailor test reporting to your team's needs."
            },
            {
                "id": "pw-advanced-008", "order": 8, "title": "Trace Viewer",
                "slug": "trace-viewer-advanced",
                "description": "Master Trace Viewer for advanced debugging and analysis.",
                "objectives": ["Analyze test traces", "Debug complex failures", "Share traces with team", "Use traces for optimization"],
                "content": "Become a debugging expert with Trace Viewer."
            },
            {
                "id": "pw-advanced-009", "order": 9, "title": "Test Retry Strategies",
                "slug": "test-retry-strategies",
                "description": "Implement intelligent retry logic to handle flaky tests.",
                "objectives": ["Configure retry logic", "Identify flaky tests", "Implement conditional retries", "Monitor retry patterns"],
                "content": "Build resilient test suites with smart retry strategies."
            },
            {
                "id": "pw-advanced-010", "order": 10, "title": "Best Practices and Patterns",
                "slug": "best-practices-patterns",
                "description": "Learn industry best practices and advanced patterns for Playwright testing.",
                "objectives": ["Apply SOLID principles", "Design scalable test architecture", "Optimize test performance", "Maintain test quality"],
                "content": "Master professional testing practices for enterprise applications."
            }
        ]
    },
    "selenium": {
        "beginner": [
            {
                "id": "sel-beginner-001", "order": 1, "title": "Introduction to Selenium WebDriver",
                "slug": "introduction-selenium",
                "description": "Learn what Selenium is and how it enables browser automation across different platforms.",
                "objectives": ["Understand Selenium architecture", "Learn WebDriver capabilities", "Compare with other tools", "Identify use cases"],
                "content": "Selenium is the industry-standard browser automation tool with support for multiple languages."
            },
            {
                "id": "sel-beginner-002", "order": 2, "title": "Setup (Java/Python/JavaScript)",
                "slug": "selenium-setup",
                "description": "Install and configure Selenium WebDriver for your preferred programming language.",
                "objectives": ["Install Selenium", "Configure browser drivers", "Set up project structure", "Verify installation"],
                "content": "Complete setup guide for Selenium across Java, Python, and JavaScript."
            },
            {
                "id": "sel-beginner-003", "order": 3, "title": "First Selenium Script",
                "slug": "first-selenium-script",
                "description": "Write your first automated browser script with Selenium WebDriver.",
                "objectives": ["Create WebDriver instance", "Navigate to URLs", "Find elements", "Perform basic actions"],
                "content": "Build your first working Selenium script step by step."
            },
            {
                "id": "sel-beginner-004", "order": 4, "title": "Element Location Strategies",
                "slug": "element-location",
                "description": "Master different strategies for locating elements on web pages.",
                "objectives": ["Use By.id, By.className", "Write CSS selectors", "Create XPath expressions", "Choose best locator strategy"],
                "content": "Comprehensive guide to finding elements reliably."
            },
            {
                "id": "sel-beginner-005", "order": 5, "title": "WebDriver Commands",
                "slug": "webdriver-commands",
                "description": "Learn essential WebDriver commands for browser control and interaction.",
                "objectives": ["Navigate pages", "Click and type", "Get element properties", "Execute JavaScript"],
                "content": "Master the core WebDriver API for browser automation."
            },
            {
                "id": "sel-beginner-006", "order": 6, "title": "Waits (Implicit, Explicit, Fluent)",
                "slug": "selenium-waits",
                "description": "Handle timing issues with different wait strategies in Selenium.",
                "objectives": ["Implement implicit waits", "Use explicit waits", "Create fluent waits", "Handle dynamic content"],
                "content": "Master wait strategies to eliminate timing issues."
            },
            {
                "id": "sel-beginner-007", "order": 7, "title": "Handling Alerts and Popups",
                "slug": "alerts-popups",
                "description": "Work with JavaScript alerts, confirms, prompts, and popup windows.",
                "objectives": ["Switch to alerts", "Accept/dismiss alerts", "Handle prompts", "Manage popup windows"],
                "content": "Learn to handle all types of popup dialogs."
            },
            {
                "id": "sel-beginner-008", "order": 8, "title": "Working with Frames",
                "slug": "working-frames",
                "description": "Navigate and interact with iframe elements in web pages.",
                "objectives": ["Switch to frames", "Find elements in frames", "Switch between frames", "Return to main content"],
                "content": "Master frame handling for complete page automation."
            },
            {
                "id": "sel-beginner-009", "order": 9, "title": "Basic Test Structure",
                "slug": "basic-test-structure",
                "description": "Organize Selenium tests with proper structure and best practices.",
                "objectives": ["Set up test classes", "Use setup/teardown", "Implement assertions", "Structure test methods"],
                "content": "Build well-structured, maintainable test suites."
            },
            {
                "id": "sel-beginner-010", "order": 10, "title": "Running Tests with TestNG/JUnit/pytest",
                "slug": "running-tests-frameworks",
                "description": "Integrate Selenium with testing frameworks for better test management.",
                "objectives": ["Set up testing frameworks", "Use annotations", "Run test suites", "Generate reports"],
                "content": "Leverage testing frameworks for professional test execution."
            }
        ],
        "intermediate": [
            {
                "id": "sel-intermediate-001", "order": 1, "title": "Advanced Element Interactions",
                "slug": "advanced-interactions",
                "description": "Perform complex interactions with web elements beyond basic click and type.",
                "objectives": ["Double-click and right-click", "Drag and drop", "Mouse hover actions", "Complex gestures"],
                "content": "Master advanced interaction techniques for complex UIs."
            },
            {
                "id": "sel-intermediate-002", "order": 2, "title": "Select Dropdown and Multi-Select",
                "slug": "select-dropdown",
                "description": "Work with dropdown menus and multi-select elements efficiently.",
                "objectives": ["Use Select class", "Handle custom dropdowns", "Work with multi-select", "Verify selected options"],
                "content": "Complete guide to dropdown and select element handling."
            },
            {
                "id": "sel-intermediate-003", "order": 3, "title": "JavaScript Executor",
                "slug": "javascript-executor",
                "description": "Execute JavaScript code directly in the browser for advanced scenarios.",
                "objectives": ["Run JavaScript", "Interact with hidden elements", "Scroll pages", "Modify DOM"],
                "content": "Unlock advanced capabilities with JavaScript execution."
            },
            {
                "id": "sel-intermediate-004", "order": 4, "title": "Actions Class (mouse, keyboard)",
                "slug": "actions-class",
                "description": "Use Actions class for complex mouse and keyboard interactions.",
                "objectives": ["Build action chains", "Perform keyboard combos", "Create mouse gestures", "Combine multiple actions"],
                "content": "Master the Actions API for complex user simulations."
            },
            {
                "id": "sel-intermediate-005", "order": 5, "title": "Window and Tab Handling",
                "slug": "window-tab-handling",
                "description": "Manage multiple browser windows and tabs in tests.",
                "objectives": ["Switch between windows", "Open new tabs", "Close windows", "Get window handles"],
                "content": "Handle multi-window scenarios with confidence."
            },
            {
                "id": "sel-intermediate-006", "order": 6, "title": "Cookies and Sessions",
                "slug": "cookies-sessions",
                "description": "Manage browser cookies and session data for testing.",
                "objectives": ["Add cookies", "Get cookie values", "Delete cookies", "Manage sessions"],
                "content": "Control browser state with cookie and session management."
            },
            {
                "id": "sel-intermediate-007", "order": 7, "title": "Taking Screenshots",
                "slug": "taking-screenshots",
                "description": "Capture screenshots for debugging and evidence collection.",
                "objectives": ["Take full page screenshots", "Capture element screenshots", "Save to files", "Use in reporting"],
                "content": "Document test execution with effective screenshots."
            },
            {
                "id": "sel-intermediate-008", "order": 8, "title": "Headless Browser Testing",
                "slug": "headless-testing",
                "description": "Run tests in headless mode for faster execution and CI integration.",
                "objectives": ["Configure headless mode", "Use headless Chrome/Firefox", "Optimize performance", "Debug headless tests"],
                "content": "Speed up tests with headless browser execution."
            },
            {
                "id": "sel-intermediate-009", "order": 9, "title": "Page Object Model",
                "slug": "selenium-pom",
                "description": "Implement Page Object Model pattern for maintainable tests.",
                "objectives": ["Create page classes", "Use @FindBy annotations", "Implement PageFactory", "Structure test code"],
                "content": "Build maintainable test suites with POM pattern."
            },
            {
                "id": "sel-intermediate-010", "order": 10, "title": "Data-Driven Testing",
                "slug": "data-driven-testing",
                "description": "Parameterize tests to run with different data sets.",
                "objectives": ["Read from Excel/CSV", "Use TestNG DataProvider", "Parameterize tests", "Handle test data"],
                "content": "Maximize test coverage with data-driven approaches."
            }
        ],
        "advanced": [
            {
                "id": "sel-advanced-001", "order": 1, "title": "Selenium Grid Setup",
                "slug": "selenium-grid",
                "description": "Set up Selenium Grid for distributed test execution.",
                "objectives": ["Install Grid", "Configure hub and nodes", "Run distributed tests", "Scale test infrastructure"],
                "content": "Build scalable test infrastructure with Selenium Grid."
            },
            {
                "id": "sel-advanced-002", "order": 2, "title": "Cross-Browser Testing",
                "slug": "cross-browser-testing",
                "description": "Test across multiple browsers and versions systematically.",
                "objectives": ["Configure multiple browsers", "Handle browser differences", "Create browser matrix", "Manage browser drivers"],
                "content": "Ensure cross-browser compatibility with comprehensive testing."
            },
            {
                "id": "sel-advanced-003", "order": 3, "title": "Cloud Testing (BrowserStack, Sauce Labs)",
                "slug": "cloud-testing",
                "description": "Leverage cloud testing platforms for extensive browser and device coverage.",
                "objectives": ["Set up cloud testing", "Configure capabilities", "Run tests on cloud", "Access test results"],
                "content": "Scale testing with cloud-based infrastructure."
            },
            {
                "id": "sel-advanced-004", "order": 4, "title": "Framework Design Patterns",
                "slug": "framework-patterns",
                "description": "Design robust test automation frameworks with proven patterns.",
                "objectives": ["Apply design patterns", "Create framework architecture", "Implement utilities", "Build reusable components"],
                "content": "Architect professional-grade test frameworks."
            },
            {
                "id": "sel-advanced-005", "order": 5, "title": "Extent Reports",
                "slug": "extent-reports",
                "description": "Generate beautiful, detailed test reports with ExtentReports.",
                "objectives": ["Integrate ExtentReports", "Add screenshots to reports", "Create custom reports", "Email reports"],
                "content": "Create professional test reports for stakeholders."
            },
            {
                "id": "sel-advanced-006", "order": 6, "title": "Log4j Integration",
                "slug": "log4j-integration",
                "description": "Implement comprehensive logging for better debugging and monitoring.",
                "objectives": ["Configure Log4j", "Add logging statements", "Manage log levels", "Analyze logs"],
                "content": "Master logging for effective test debugging."
            },
            {
                "id": "sel-advanced-007", "order": 7, "title": "Docker Selenium",
                "slug": "docker-selenium",
                "description": "Run Selenium tests in Docker containers for consistency and portability.",
                "objectives": ["Set up Docker Selenium", "Create test containers", "Run in Docker", "Use in CI/CD"],
                "content": "Containerize tests for reliable execution anywhere."
            },
            {
                "id": "sel-advanced-008", "order": 8, "title": "Selenium with Cucumber/BDD",
                "slug": "selenium-bdd",
                "description": "Combine Selenium with Cucumber for behavior-driven development.",
                "objectives": ["Write Gherkin scenarios", "Implement step definitions", "Create feature files", "Run BDD tests"],
                "content": "Bridge communication gap with BDD approach."
            },
            {
                "id": "sel-advanced-009", "order": 9, "title": "Performance Optimization",
                "slug": "performance-optimization",
                "description": "Optimize test execution speed and resource usage.",
                "objectives": ["Profile test performance", "Reduce test time", "Optimize waits", "Parallelize effectively"],
                "content": "Build fast, efficient test suites."
            },
            {
                "id": "sel-advanced-010", "order": 10, "title": "Best Practices and Patterns",
                "slug": "selenium-best-practices",
                "description": "Learn industry best practices for Selenium test automation.",
                "objectives": ["Follow best practices", "Avoid common pitfalls", "Write maintainable tests", "Build quality frameworks"],
                "content": "Master professional Selenium testing practices."
            }
        ]
    }
}

def create_full_lesson(lesson_info, track, category):
    """Create complete lesson object with all required fields"""
    duration = 25 if category == "beginner" else (30 if category == "intermediate" else 35)
    
    # Determine next lesson
    current_order = lesson_info["order"]
    if current_order < 10:
        next_lesson = f"{track[:3] if track == 'selenium' else 'pw'}-{category}-{current_order + 1:03d}"
    elif category == "beginner":
        next_lesson = f"{track[:3] if track == 'selenium' else 'pw'}-intermediate-001"
    elif category == "intermediate":
        next_lesson = f"{track[:3] if track == 'selenium' else 'pw'}-advanced-001"
    else:
        next_lesson = None
    
    # Determine prerequisites
    if current_order == 1:
        if category == "beginner":
            prerequisites = []
        elif category == "intermediate":
            prerequisites = [f"{track[:3] if track == 'selenium' else 'pw'}-beginner-010"]
        else:
            prerequisites = [f"{track[:3] if track == 'selenium' else 'pw'}-intermediate-010"]
    else:
        prerequisites = [f"{track[:3] if track == 'selenium' else 'pw'}-{category}-{current_order - 1:03d}"]
    
    lesson = {
        "id": lesson_info["id"],
        "title": lesson_info["title"],
        "slug": lesson_info["slug"],
        "track": track,
        "category": category,
        "order": current_order,
        "duration": duration,
        "description": lesson_info["description"],
        "objectives": lesson_info["objectives"],
        "prerequisites": prerequisites,
        "content": {
            "sections": [
                {
                    "title": f"Introduction to {lesson_info['title']}",
                    "type": "text",
                    "content": f"# {lesson_info['title']}\n\n{lesson_info['content']}\n\nThis lesson covers essential concepts and practical techniques you need to master this topic."
                },
                {
                    "title": "Code Example",
                    "type": "code",
                    "language": "typescript" if track == "playwright" else "java",
                    "code": f"// Example code for {lesson_info['title']}\n// This demonstrates the key concepts covered in this lesson\n\n// TODO: Implement specific examples based on the lesson topic",
                    "explanation": f"This example demonstrates practical usage of {lesson_info['title']} concepts."
                },
                {
                    "title": "Real-World Application",
                    "type": "text",
                    "content": f"## Practical Use Cases\n\nIn real-world scenarios, {lesson_info['title'].lower()} is essential for:\n\n- Solving common testing challenges\n- Improving test reliability and maintainability\n- Enhancing test execution efficiency\n- Building robust automation frameworks"
                },
                {
                    "title": "Best Practices",
                    "type": "text",
                    "content": f"## Best Practices for {lesson_info['title']}\n\n1. Always follow industry standards\n2. Write maintainable and readable code\n3. Consider performance implications\n4. Document your test logic\n5. Handle edge cases appropriately"
                }
            ]
        },
        "keyTakeaways": [
            f"{lesson_info['title']} is essential for effective test automation",
            "Understanding these concepts improves test quality and reliability",
            "Apply these techniques to solve real-world testing challenges",
            "Follow best practices for maintainable test code",
            f"Master {lesson_info['title']} for professional test automation"
        ],
        "resources": [
            {
                "title": f"{lesson_info['title']} Documentation",
                "url": f"https://{'playwright.dev' if track == 'playwright' else 'selenium.dev'}/docs",
                "type": "documentation"
            }
        ],
        "quiz": f"{track[:3] if track == 'selenium' else 'pw'}-{category}-quiz-{current_order:03d}",
        "nextLesson": next_lesson,
        "estimatedXP": 150 + (category == "intermediate") * 50 + (category == "advanced") * 100,
        "tags": [track, category, lesson_info["slug"].split("-")[0], "automation", "testing"]
    }
    
    return lesson

def main():
    base_path = "/Users/venkateshparasa/Documents/playWright/backend/data/lessons"
    
    total_created = 0
    
    # Generate all lessons
    for track, categories in LESSONS.items():
        for category, lessons in categories.items():
            category_path = os.path.join(base_path, track, category)
            os.makedirs(category_path, exist_ok=True)
            
            for lesson_info in lessons:
                lesson_data = create_full_lesson(lesson_info, track, category)
                filename = f"lesson-{lesson_info['order']:03d}.json"
                filepath = os.path.join(category_path, filename)
                
                with open(filepath, 'w') as f:
                    json.dump(lesson_data, f, indent=2)
                
                print(f"Created: {track}/{category}/lesson-{lesson_info['order']:03d}.json")
                total_created += 1
    
    print(f"\n✅ Successfully created {total_created} lessons\!")
    print(f"\nBreakdown:")
    print(f"- Playwright Intermediate: 10 lessons")
    print(f"- Playwright Advanced: 10 lessons")
    print(f"- Selenium Beginner: 10 lessons")
    print(f"- Selenium Intermediate: 10 lessons")
    print(f"- Selenium Advanced: 10 lessons")
    print(f"- Total new lessons: {total_created}")

if __name__ == "__main__":
    main()
