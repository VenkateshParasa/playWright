# Playwright + Selenium Learning Program (30–60 days)

This document is a comprehensive specification and implementation prompt for a 30–60 day learning program that teaches Playwright (JavaScript) and Selenium (Java) and includes a React PWA UI, assessments, and a Spaced Repetition System (SRS).

---

## Goal

Build a learner-centered program and starter repos so an intermediate JS and Java developer becomes proficient with Playwright (JS) and Selenium (Java), and can build and test a React PWA. Include automated assessments, SRS-backed flashcards, and CI-based grading.

## Target learner profile

- JavaScript: basic → medium
- Java: medium
- Goal: Practical E2E/browser automation skills, React PWA instrumentation, tests, CI, and SRS for retention.

## High-level deliverables

1. Curriculum: 30-day intensive and 60-day extended tracks with daily/weekly lesson plans, exercises, and milestones.
2. Starter repos:
   - `frontend/` — React PWA (TypeScript) with lessons, flashcards, progress dashboard, SRS hooks.
   - `playwright-runner/` — Node Playwright Test examples.
   - `selenium-java/` — Maven/Gradle Java project with Selenium tests.
   - `backend/` (optional) — REST API for user progress and SRS.
3. Assessments: quizzes, coding tasks, test-driven exercises, manual review hooks.
4. SRS: SM-2 algorithm implementation, card model, UI integration.
5. CI: GitHub Actions to run Playwright and Selenium suites and grade submissions.
6. Documentation: README and run instructions.

## Detailed curriculum (summary)

Two tracks: 30-day (intensive) and 60-day (extended). Each module includes objectives, reading, hands-on tasks, quiz, and a small project milestone.

### 30-day (condensed example)
- Days 1–3: Setup, tooling, "Hello World" Playwright and Selenium tests.
- Days 4–8: Core automation skills — selectors, locators, waits, page objects.
- Days 9–14: Test architecture, param tests, fixtures.
- Days 15–20: Advanced Playwright (network mocking, auth, file uploads) and cross-browser tests.
- Days 21–25: Build React PWA features; write E2E tests with Playwright and Selenium.
- Days 26–30: Capstone project, CI integration, final assessments.

### 60-day
Same modules paced with deeper exercises, code reviews, and iterative capstones.

## Assessments & grading

- MCQ quizzes (auto-grade).
- Code exercises (auto-grade using test harnesses).
- E2E assignments (run provided test suites).
- Manual review (rubrics and feedback templates).

Auto-grading: run test harnesses in CI or locally and report pass/fail with logs.

## Spaced Repetition System (SRS)

Card JSON model example:

{
  "id": "<uuid>",
  "front": "Question or micro-exercise",
  "back": "Answer + explanation",
  "ease": 2.5,
  "interval": 1,
  "repetitions": 0,
  "due": "2026-02-17T12:00:00Z",
  "tags": ["playwright","selectors"],
  "history": [{ "date":"...", "quality":0 }]
}

Algorithm: SM-2 or variant. UI shows due cards, allows quality rating (0–5), and updates next due date. Persist to backend or IndexedDB for offline-first behavior.

## React PWA UI (pages & components)

Pages:
- Dashboard — progress, due SRS, next lesson
- Lessons — modules and lesson viewer
- LessonPlayer — step-by-step content with code examples
- Exercises — coding tasks with "Run"/"Check" buttons
- Flashcards — SRS review UI with quality buttons
- Projects — capstone submissions
- Admin — (optional) edit content and view progress

PWA features:
- `manifest.json`, service worker (Workbox), offline reading, IndexedDB for queued reviews.

## Backend (optional)

Endpoints (examples):
- GET /api/srs/due?userId=... -> [Card]
- POST /api/srs/review -> { cardId, quality, date, userId } -> { newCardState }
- POST /api/assessments/submit -> { assignmentId, userId, repoUrl? } -> { result, reportUrl }

Tech choices: Node/Express + SQLite or Java Spring Boot + H2.

## CI & auto-grading (GitHub Actions)

Workflows:
- ci-playwright.yml — run Playwright on push
- ci-selenium.yml — run Selenium Java tests
- grade.yml — run student's test harness on submission and post results

## Repo layout (suggested)
- repo-root/
  - frontend/
  - playwright-runner/
  - selenium-java/
  - backend/
  - docs/
  - ci/
  - README.md

## Acceptance criteria

- Curriculum content in `docs/`.
- React PWA runs locally, installable, and supports offline reading and SRS reviews.
- Playwright examples run locally and in CI.
- Selenium Java examples compile and run locally and in CI.
- SRS endpoints or client-only SRS wired to front-end.
- At least two sample capstones with tests and grading harness.

## Security & considerations

- Do not execute untrusted student code on host without sandboxing (use Docker).
- Handle flaky tests with retries and flakiness detection.
- Sync conflicts for offline data must be reconciled carefully.

---

## Concise developer prompt (pasteable)

Build a 30–60 day learning platform and starter repos for teaching Playwright (JavaScript) and Selenium (Java). Deliver:

1) Two curriculum tracks (30-day intensive, 60-day extended). Each lesson must include objectives, reading, hands-on exercise, quiz, and acceptance criteria.

2) Starter repos:
   - `frontend/` — React + TypeScript PWA with Dashboard, Lessons, LessonPlayer, Flashcards (SRS UI), Exercises interface, Projects, offline support (Workbox), IndexedDB sync.
   - `playwright-runner/` — Playwright Test examples demonstrating selectors, waits, network mocking, parallelization, reporters.
   - `selenium-java/` — Maven/Gradle Java project with Selenium WebDriver examples, page object patterns, and JUnit/TestNG tests against the React PWA.
   - `backend/` (optional) — REST API storing user progress and SRS.

3) SRS Implementation:
   - SM-2 scheduler; card model; endpoints to fetch due cards and submit reviews, or front-end-only IndexedDB SRS with sync.

4) Assessments & auto-grading:
   - MCQ quizzes (auto-grade), code exercises auto-graded by running test harnesses in CI, rubrics for manual review.

5) CI:
   - GitHub Actions to run Playwright and Selenium tests and grade submissions.

6) Documentation:
   - `README.md` with local run steps, install, and acceptance checklist.

7) Capstones:
   - Provide two sample capstone projects: Playwright-focused and Selenium Java–focused, each with tests and grading harness.

Implementation notes:
- Use TypeScript in frontend and Playwright examples when practical.
- SRS SM-2 persists to IndexedDB and syncs to backend when online.
- Use Docker for grading student code.

Acceptance criteria:
- Repos build and run locally with docs.
- PWA installable and supports offline SRS reviews.
- Playwright and Selenium suites run locally and via CI.

Timeline: MVP (frontend + Playwright + SRS + docs) in 2 weeks; full implementation in 4–6 weeks with weekly checkpoints.

---

## Next steps & options

If you want this tailored to projects in `~/Documents`, provide either:
- Top-level project names and stacks from your `~/Documents` folder, or
- A zipped sample project placed under this workspace (for example `/Users/venkateshparasa/Documents/playWright`), or
- Say “skip analysis” and I will scaffold generic starter projects.

If you want me to continue now, pick one:
- Generate full day-by-day 30-day and 60-day plans now, or
- Scaffold one starter repo (choose: `frontend`, `playwright-runner`, or `selenium-java`).

---

*File generated by assistant on 2026-02-16.*
