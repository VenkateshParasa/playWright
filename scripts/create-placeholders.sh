#!/bin/bash

# Frontend placeholder files
cat > frontend/src/pages/Dashboard.tsx << 'EOF'
export default function Dashboard() {
  return <div>Dashboard - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/Lessons.tsx << 'EOF'
export default function Lessons() {
  return <div>Lessons - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/LessonDetail.tsx << 'EOF'
export default function LessonDetail() {
  return <div>Lesson Detail - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/Flashcards.tsx << 'EOF'
export default function Flashcards() {
  return <div>Flashcards - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/Exercises.tsx << 'EOF'
export default function Exercises() {
  return <div>Exercises - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/Progress.tsx << 'EOF'
export default function Progress() {
  return <div>Progress - TODO: Implement</div>;
}
EOF

cat > frontend/src/pages/Settings.tsx << 'EOF'
export default function Settings() {
  return <div>Settings - TODO: Implement</div>;
}
EOF

cat > frontend/src/components/layout/Layout.tsx << 'EOF'
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Test Automation Academy</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
EOF

cat > frontend/src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

cat > frontend/public/manifest.json << 'EOF'
{
  "name": "Playwright & Selenium Learning Platform",
  "short_name": "Test Academy",
  "description": "Master Playwright and Selenium in 30-60 days",
  "theme_color": "#4F46E5",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Master Playwright and Selenium in 30-60 days" />
    <meta name="theme-color" content="#4F46E5" />
    <link rel="manifest" href="/manifest.json" />
    <title>Test Automation Academy</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > frontend/.gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
dist
build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode
.idea
*.swp
*.swo
*~
EOF

echo "Frontend placeholder files created successfully!"