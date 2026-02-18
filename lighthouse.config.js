module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/lessons',
        'http://localhost:4173/flashcards',
        'http://localhost:4173/exercises',
        'http://localhost:4173/progress',
        'http://localhost:4173/dashboard'
      ],
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],

        // Performance metrics
        'interactive': ['error', { maxNumericValue: 3500 }],
        'max-potential-fid': ['warn', { maxNumericValue: 130 }],

        // Resource optimizations
        'unused-javascript': ['warn', { maxNumericValue: 50000 }],
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'uses-optimized-images': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
        'uses-text-compression': ['error', { minScore: 1 }],
        'uses-long-cache-ttl': ['warn', { minScore: 0.75 }],

        // Network
        'uses-http2': ['warn', { minScore: 1 }],
        'uses-rel-preconnect': ['warn', { minScore: 0.8 }],
        'uses-rel-preload': ['warn', { minScore: 0.8 }],

        // Bundle size
        'total-byte-weight': ['warn', { maxNumericValue: 1000000 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],

        // JavaScript
        'bootup-time': ['warn', { maxNumericValue: 2500 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 2500 }],
        'duplicated-javascript': ['warn', { minScore: 1 }],
        'legacy-javascript': ['warn', { minScore: 0.8 }],

        // Fonts
        'font-display': ['warn', { minScore: 1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci.db'
      }
    }
  }
};
