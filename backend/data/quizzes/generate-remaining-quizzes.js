#!/usr/bin/env node

// Quiz generation script for comprehensive quiz banks

const fs = require('fs');
const path = require('path');

const baseDir = '/Users/venkateshparasa/Documents/playWright/backend/data/quizzes';

// Playwright Intermediate Quizzes (013-020)
const playwrightIntermediate = [
  {
    id: '013',
    title: 'Network Testing',
    slug: 'network-testing',
    questions: [
      {
        id: 'quiz-pw-q121',
        type: 'multiple-choice',
        question: 'How do you intercept network requests in Playwright?',
        options: ['page.route()', 'page.intercept()', 'page.network()', 'page.request()'],
        correctAnswer: 0,
        explanation: 'page.route() allows you to intercept and handle network requests.',
        difficulty: 'medium',
        points: 10,
        tags: ['network', 'routing']
      },
      {
        id: 'quiz-pw-q122',
        type: 'code-completion',
        question: 'Complete the code to mock an API response:',
        codeTemplate: 'await page.____(\'/api/data\', route => route.fulfill({ json: data }));',
        correctAnswer: 'await page.route(\'/api/data\', route => route.fulfill({ json: data }));',
        acceptedAnswers: ['route'],
        explanation: 'route() with fulfill() mocks API responses with custom data.',
        difficulty: 'medium',
        points: 15,
        tags: ['network', 'mocking', 'code']
      },
      {
        id: 'quiz-pw-q123',
        type: 'true-false',
        question: 'Playwright can wait for specific network responses before continuing.',
        correctAnswer: true,
        explanation: 'page.waitForResponse() waits for specific network responses.',
        difficulty: 'medium',
        points: 5,
        tags: ['network', 'waiting']
      },
      {
        id: 'quiz-pw-q124',
        type: 'multiple-choice',
        question: 'Which method waits for a network request?',
        options: ['page.waitForRequest()', 'page.onRequest()', 'page.request()', 'page.listenRequest()'],
        correctAnswer: 0,
        explanation: 'waitForRequest() waits for and returns a matching network request.',
        difficulty: 'medium',
        points: 10,
        tags: ['network', 'waiting']
      },
      {
        id: 'quiz-pw-q125',
        type: 'code-completion',
        question: 'Complete the code to abort image requests:',
        codeTemplate: 'await page.route(\'**/*.{png,jpg}\', route => route.____());',
        correctAnswer: 'await page.route(\'**/*.{png,jpg}\', route => route.abort());',
        acceptedAnswers: ['abort'],
        explanation: 'route.abort() cancels the network request.',
        difficulty: 'medium',
        points: 15,
        tags: ['network', 'routing', 'code']
      },
      {
        id: 'quiz-pw-q126',
        type: 'multiple-choice',
        question: 'What does route.continue() do?',
        options: [
          'Continues the request without modification',
          'Modifies and continues the request',
          'Both A and B',
          'Aborts the request'
        ],
        correctAnswer: 2,
        explanation: 'route.continue() can let the request proceed as-is or with modifications.',
        difficulty: 'medium',
        points: 10,
        tags: ['network', 'routing']
      },
      {
        id: 'quiz-pw-q127',
        type: 'debugging',
        question: 'What is wrong with this network interception?',
        code: 'page.route(\'/api/data\', route => { return { data: [] }; });',
        options: [
          'Should use route.fulfill()',
          'Missing await',
          'Incorrect route pattern',
          'Nothing is wrong'
        ],
        correctAnswer: 0,
        explanation: 'Must use route.fulfill(), route.continue(), or route.abort() in the handler.',
        difficulty: 'medium',
        points: 20,
        tags: ['network', 'debugging']
      },
      {
        id: 'quiz-pw-q128',
        type: 'true-false',
        question: 'You can modify request headers using route.continue().',
        correctAnswer: true,
        explanation: 'route.continue({ headers: {...} }) allows modifying request headers.',
        difficulty: 'medium',
        points: 5,
        tags: ['network', 'headers']
      },
      {
        id: 'quiz-pw-q129',
        type: 'multiple-choice',
        question: 'How do you listen to all network requests?',
        options: [
          'page.on(\\'request\\', handler)',
          'page.onRequest(handler)',
          'page.listen(\\'request\\', handler)',
          'page.requests(handler)'
        ],
        correctAnswer: 0,
        explanation: 'page.on(\\'request\\', handler) listens to all outgoing requests.',
        difficulty: 'medium',
        points: 10,
        tags: ['network', 'events']
      },
      {
        id: 'quiz-pw-q130',
        type: 'code-output',
        question: 'What does this code do?',
        code: 'await page.waitForResponse(response => response.url().includes(\\'api\\') && response.status() === 200);',
        options: [
          'Waits for any API response',
          'Waits for successful API response',
          'Waits for failed API response',
          'Checks API status'
        ],
        correctAnswer: 1,
        explanation: 'Waits for a response with \\'api\\' in URL and 200 status code.',
        difficulty: 'medium',
        points: 15,
        tags: ['network', 'waiting']
      }
    ]
  },
  {
    id: '014',
    title: 'API Testing',
    slug: 'api-testing',
    questions: [
      {
        id: 'quiz-pw-q131',
        type: 'multiple-choice',
        question: 'Which Playwright object is used for API testing?',
        options: ['page.api', 'request', 'api', 'http'],
        correctAnswer: 1,
        explanation: 'The request fixture/context is used for API testing in Playwright.',
        difficulty: 'medium',
        points: 10,
        tags: ['api', 'testing']
      },
      {
        id: 'quiz-pw-q132',
        type: 'code-completion',
        question: 'Complete the code to make a GET request:',
        codeTemplate: 'const response = await request.____(\\'https://api.example.com/data\\');',
        correctAnswer: 'const response = await request.get(\\'https://api.example.com/data\\');',
        acceptedAnswers: ['get'],
        explanation: 'request.get() makes a GET request to the specified URL.',
        difficulty: 'medium',
        points: 15,
        tags: ['api', 'http', 'code']
      },
      {
        id: 'quiz-pw-q133',
        type: 'true-false',
        question: 'Playwright can test REST APIs without opening a browser.',
        correctAnswer: true,
        explanation: 'Playwright\\'s API testing feature works independently of browser automation.',
        difficulty: 'medium',
        points: 5,
        tags: ['api', 'testing']
      },
      {
        id: 'quiz-pw-q134',
        type: 'multiple-choice',
        question: 'How do you send JSON data in a POST request?',
        options: [
          'request.post(url, { body: data })',
          'request.post(url, { data: data })',
          'request.post(url, { json: data })',
          'request.post(url, data)'
        ],
        correctAnswer: 1,
        explanation: 'Use the data option to send JSON data in POST requests.',
        difficulty: 'medium',
        points: 10,
        tags: ['api', 'post', 'json']
      },
      {
        id: 'quiz-pw-q135',
        type: 'code-completion',
        question: 'Complete the code to get JSON response:',
        codeTemplate: 'const data = await response.____();',
        correctAnswer: 'const data = await response.json();',
        acceptedAnswers: ['json'],
        explanation: 'response.json() parses the response body as JSON.',
        difficulty: 'medium',
        points: 15,
        tags: ['api', 'response', 'code']
      },
      {
        id: 'quiz-pw-q136',
        type: 'multiple-choice',
        question: 'How do you set custom headers for API requests?',
        options: [
          'request.get(url, { headers: {...} })',
          'request.setHeaders({...})',
          'request.headers({...})',
          'request.withHeaders({...})'
        ],
        correctAnswer: 0,
        explanation: 'Pass headers in the options object when making requests.',
        difficulty: 'medium',
        points: 10,
        tags: ['api', 'headers']
      },
      {
        id: 'quiz-pw-q137',
        type: 'debugging',
        question: 'What is wrong with this API test?',
        code: 'const response = request.post(\\'https://api.example.com\\', { data: {} });\\nawait expect(response.status()).toBe(200);',
        options: [
          'Missing await for request',
          'Incorrect status check',
          'Wrong POST syntax',
          'Nothing is wrong'
        ],
        correctAnswer: 0,
        explanation: 'The request.post() call must be awaited before accessing response properties.',
        difficulty: 'medium',
        points: 20,
        tags: ['api', 'debugging', 'async']
      },
      {
        id: 'quiz-pw-q138',
        type: 'true-false',
        question: 'API requests in Playwright automatically retry on failure.',
        correctAnswer: false,
        explanation: 'Unlike UI actions, API requests do not have automatic retry by default.',
        difficulty: 'medium',
        points: 5,
        tags: ['api', 'retry']
      },
      {
        id: 'quiz-pw-q139',
        type: 'multiple-choice',
        question: 'Which method checks the API response status?',
        options: [
          'response.status()',
          'response.statusCode()',
          'response.code()',
          'response.httpStatus()'
        ],
        correctAnswer: 0,
        explanation: 'response.status() returns the HTTP status code.',
        difficulty: 'medium',
        points: 10,
        tags: ['api', 'response']
      },
      {
        id: 'quiz-pw-q140',
        type: 'code-output',
        question: 'What does this code validate?',
        code: 'await expect(response).toBeOK();',
        options: [
          'Response status is 200',
          'Response status is 2xx',
          'Response has body',
          'Response is valid JSON'
        ],
        correctAnswer: 1,
        explanation: 'toBeOK() checks if the response status is in the 200-299 range.',
        difficulty: 'medium',
        points: 15,
        tags: ['api', 'assertions']
      }
    ]
  }
];

// Function to create quiz JSON
function createQuiz(track, category, quizData, quizNumber) {
  return {
    id: `quiz-${track.substring(0, 2)}-${quizData.id}`,
    title: quizData.title,
    slug: quizData.slug,
    track: track,
    category: category,
    description: `Test your ${category} level knowledge of ${quizData.title}`,
    timeLimit: 600,
    passingScore: 70,
    questions: quizData.questions,
    totalPoints: quizData.questions.reduce((sum, q) => sum + q.points, 0),
    relatedLesson: `lesson-${track.substring(0, 2)}-${quizData.id}`,
    prerequisites: quizNumber > 1 ? [`quiz-${track.substring(0, 2)}-${String(parseInt(quizData.id) - 1).padStart(3, '0')}`] : [],
    xpReward: category === 'beginner' ? 150 : category === 'intermediate' ? 200 : 250,
    coinReward: category === 'beginner' ? 30 : category === 'intermediate' ? 40 : 50
  };
}

// Generate intermediate quizzes
playwrightIntermediate.forEach((quizData, index) => {
  const quiz = createQuiz('playwright', 'intermediate', quizData, index + 1);
  const filePath = path.join(baseDir, 'playwright', 'intermediate', `${quizData.id}-${quizData.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));
  console.log(`Created: ${filePath}`);
});

console.log('Quiz generation script completed for intermediate quizzes 013-014');
