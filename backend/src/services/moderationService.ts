/**
 * Moderation Service
 * Handles spam detection, content filtering, and moderation logic
 */

// Common spam keywords and patterns
const SPAM_KEYWORDS = [
  'viagra',
  'cialis',
  'casino',
  'lottery',
  'bitcoin',
  'cryptocurrency',
  'click here',
  'buy now',
  'limited offer',
  'act now',
  'free money',
  'make money fast',
  'work from home',
  'weight loss',
  'miracle cure',
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
  /\b\d{10,}\b/g, // Long numbers (phone, credit cards)
  /(https?:\/\/[^\s]+){3,}/g, // Multiple URLs
  /(.)\1{10,}/g, // Repeated characters
  /[A-Z]{10,}/g, // All caps words
];

/**
 * Detect spam content using keyword matching and pattern analysis
 */
export function detectSpam(content: string): boolean {
  const lowerContent = content.toLowerCase();

  // Check for spam keywords
  const hasSpamKeywords = SPAM_KEYWORDS.some(keyword =>
    lowerContent.includes(keyword)
  );

  if (hasSpamKeywords) {
    return true;
  }

  // Check for suspicious patterns
  const hasSuspiciousPattern = SUSPICIOUS_PATTERNS.some(pattern =>
    pattern.test(content)
  );

  if (hasSuspiciousPattern) {
    return true;
  }

  // Check for excessive URLs (more than 5)
  const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 5) {
    return true;
  }

  // Check for excessive caps (more than 50% uppercase)
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 0 && capsCount / letterCount > 0.5) {
    return true;
  }

  return false;
}

/**
 * Calculate spam score (0-100)
 */
export function calculateSpamScore(content: string): number {
  let score = 0;
  const lowerContent = content.toLowerCase();

  // Keyword matching (5 points per keyword)
  SPAM_KEYWORDS.forEach(keyword => {
    if (lowerContent.includes(keyword)) {
      score += 5;
    }
  });

  // Pattern matching (10 points per pattern)
  SUSPICIOUS_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      score += 10;
    }
  });

  // URL count (2 points per URL after the first 2)
  const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  if (urlCount > 2) {
    score += (urlCount - 2) * 2;
  }

  // Caps ratio (up to 20 points)
  const capsCount = (content.match(/[A-Z]/g) || []).length;
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length;
  if (letterCount > 0) {
    const capsRatio = capsCount / letterCount;
    score += Math.min(capsRatio * 40, 20);
  }

  // Repeated characters (10 points)
  if (/(.)\1{5,}/.test(content)) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Filter profanity and offensive content
 */
const PROFANITY_LIST = [
  // Add profanity words here
  // Using asterisks as placeholders
  'badword1',
  'badword2',
];

export function filterProfanity(content: string): string {
  let filtered = content;

  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });

  return filtered;
}

/**
 * Check if content needs moderation
 */
export function needsModeration(content: string): boolean {
  const spamScore = calculateSpamScore(content);
  return spamScore > 50;
}

/**
 * Validate content length and format
 */
export function validateContent(
  content: string,
  minLength: number = 10,
  maxLength: number = 10000
): { valid: boolean; message?: string } {
  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      message: 'Content cannot be empty',
    };
  }

  if (content.length < minLength) {
    return {
      valid: false,
      message: `Content must be at least ${minLength} characters`,
    };
  }

  if (content.length > maxLength) {
    return {
      valid: false,
      message: `Content must not exceed ${maxLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Check for duplicate content (basic implementation)
 */
export function isDuplicateContent(
  newContent: string,
  recentContents: string[]
): boolean {
  const normalized = newContent.toLowerCase().trim();

  return recentContents.some(content => {
    const normalizedExisting = content.toLowerCase().trim();
    return normalized === normalizedExisting;
  });
}

/**
 * Rate limiting check (basic implementation)
 */
const userActionTimestamps = new Map<string, number[]>();

export function checkRateLimit(
  userId: string,
  maxActions: number = 10,
  timeWindowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = userActionTimestamps.get(userId) || [];

  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(
    ts => now - ts < timeWindowMs
  );

  if (recentTimestamps.length >= maxActions) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  recentTimestamps.push(now);
  userActionTimestamps.set(userId, recentTimestamps);

  return true;
}

/**
 * Clean up old rate limit data (call periodically)
 */
export function cleanupRateLimitData(): void {
  const now = Date.now();
  const maxAge = 3600000; // 1 hour

  for (const [userId, timestamps] of userActionTimestamps.entries()) {
    const recentTimestamps = timestamps.filter(
      ts => now - ts < maxAge
    );

    if (recentTimestamps.length === 0) {
      userActionTimestamps.delete(userId);
    } else {
      userActionTimestamps.set(userId, recentTimestamps);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimitData, 3600000);

/**
 * Extract mentions from content (@username)
 */
export function extractMentions(content: string): string[] {
  const mentionPattern = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionPattern.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Sanitize HTML content (basic implementation)
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: links
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}
