# Selenium Java - Test Examples & Exercises

## 🚀 Quick Start

```bash
# 1. Compile project
mvn clean compile

# 2. Run all tests
mvn test

# 3. Run specific test
mvn test -Dtest=LoginTests

# 4. Skip tests during build
mvn clean install -DskipTests
```

## 📋 Available Commands

```bash
mvn clean           # Clean build artifacts
mvn compile         # Compile source code
mvn test            # Run all tests
mvn test -Dtest=*   # Run specific test class
mvn surefire-report:report  # Generate test report
```

## 📚 Project Structure

```
src/
├── main/java/com/testautomation/
│   ├── pages/      # Page Object Models
│   ├── utils/      # Helper utilities
│   └── config/     # Configuration classes
└── test/java/com/testautomation/
    ├── tests/      # Test classes
    └── exercises/  # Practice exercises
```

## 🎓 Learning Path

1. **Study Page Objects** (src/main/java/pages/)
   - BasePage.java - Base class for all pages
   - LoginPage.java - Login page example
   - HomePage.java - Home page example

2. **Review Tests** (src/test/java/tests/)
   - BaseTest.java - Test setup/teardown
   - LoginTests.java - Login test examples
   - NavigationTests.java - Navigation examples

3. **Complete Exercises** (src/test/java/exercises/)
   - Practice what you learned
   - Apply Page Object Model pattern

## 🔧 Configuration

### Browser Selection

Edit `testng.xml` to change browser:

```xml
<parameter name="browser" value="chrome"/>
<!-- or -->
<parameter name="browser" value="firefox"/>
```

### Base URL

Set in `src/test/resources/config.properties`:

```properties
base.url=http://localhost:3000
```

## 📖 Key Concepts

### Page Object Model (POM)
- Encapsulate page elements and actions
- Improve test maintainability
- Reduce code duplication

### WebDriverManager
- Automatically manages browser drivers
- No manual driver downloads needed
- Supports Chrome, Firefox, Edge, Safari

### TestNG
- Powerful test framework
- Parallel test execution
- Flexible test configuration
- Detailed reporting

## 🧪 Running Tests

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=LoginTests
```

### Run Specific Test Method
```bash
mvn test -Dtest=LoginTests#testSuccessfulLogin
```

### Run with Different Browser
```bash
mvn test -Dbrowser=firefox
```

### Generate HTML Report
```bash
mvn surefire-report:report
# Report: target/site/surefire-report.html
```

## 📊 Test Reports

After running tests, find reports in:
- `target/surefire-reports/` - XML and text reports
- `target/site/surefire-report.html` - HTML report

## 🔍 Debugging

### Enable Logging
Add to test:
```java
System.setProperty("webdriver.chrome.verboseLogging", "true");
```

### Take Screenshots
```java
File screenshot = ((TakesScreenshot)driver).getScreenshotAs(OutputType.FILE);
FileUtils.copyFile(screenshot, new File("screenshot.png"));
```

### Slow Down Tests
```java
Thread.sleep(2000); // Not recommended for production
// Use explicit waits instead
```

## 📚 Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [TestNG Documentation](https://testng.org/doc/)
- [WebDriverManager](https://github.com/bonigarcia/webdrivermanager)
- [Maven Documentation](https://maven.apache.org/guides/)

## 🆘 Common Issues

### Issue: Browser not found
**Solution**: WebDriverManager will download it automatically on first run

### Issue: Tests fail with "Connection refused"
**Solution**: Make sure frontend is running on http://localhost:3000

### Issue: Java version error
**Solution**: Use Java 17+
```bash
java -version  # Should show 17 or higher
```

---

**Ready to start testing!** Run `mvn test` to begin. 🎉