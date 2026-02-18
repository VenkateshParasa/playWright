/**
 * Plagiarism Detection Service
 * Detects code and text similarity for academic integrity
 */

import type { PlagiarismResult } from '../../types/ai.js';

interface TokenSequence {
  tokens: string[];
  lines: number[];
}

interface SimilarityMatch {
  submissionId: string;
  userId: string;
  similarity: number;
  matchedLines: number[];
  matchedSegments: Array<{
    start: number;
    end: number;
    similarity: number;
  }>;
}

export class PlagiarismDetectionService {
  private readonly similarityThreshold = 0.7;
  private readonly windowSize = 5;

  /**
   * Check code similarity against other submissions
   */
  async checkCodeSimilarity(
    code: string,
    language: string,
    userId: string,
    exerciseId: string,
    allSubmissions: Array<{ id: string; userId: string; code: string }>
  ): Promise<PlagiarismResult> {
    // Normalize and tokenize the code
    const normalizedCode = this.normalizeCode(code, language);
    const tokens = this.tokenizeCode(normalizedCode, language);

    const matches: SimilarityMatch[] = [];

    // Compare with other submissions
    for (const submission of allSubmissions) {
      // Skip comparing with self
      if (submission.userId === userId) continue;

      const otherNormalized = this.normalizeCode(submission.code, language);
      const otherTokens = this.tokenizeCode(otherNormalized, language);

      const similarity = this.calculateSimilarity(tokens, otherTokens);

      if (similarity >= this.similarityThreshold) {
        const matchedLines = this.findMatchedLines(code, submission.code);
        matches.push({
          submissionId: submission.id,
          userId: submission.userId,
          similarity,
          matchedLines,
          matchedSegments: this.findMatchedSegments(tokens, otherTokens),
        });
      }
    }

    // Sort matches by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    // Calculate overall similarity score
    const overallSimilarity = matches.length > 0
      ? Math.max(...matches.map(m => m.similarity))
      : 0;

    return {
      similarity: overallSimilarity,
      matchedSubmissions: matches.map(m => ({
        submissionId: m.submissionId,
        userId: m.userId,
        similarity: m.similarity,
        matchedLines: m.matchedLines,
      })),
    };
  }

  /**
   * Check text similarity for essays and short answers
   */
  async checkTextSimilarity(
    text: string,
    allSubmissions: Array<{ id: string; userId: string; text: string }>,
    userId: string
  ): Promise<PlagiarismResult> {
    const normalizedText = this.normalizeText(text);
    const textTokens = this.tokenizeText(normalizedText);

    const matches: SimilarityMatch[] = [];

    for (const submission of allSubmissions) {
      if (submission.userId === userId) continue;

      const otherNormalized = this.normalizeText(submission.text);
      const otherTokens = this.tokenizeText(otherNormalized);

      const similarity = this.calculateTextSimilarity(textTokens, otherTokens);

      if (similarity >= this.similarityThreshold) {
        matches.push({
          submissionId: submission.id,
          userId: submission.userId,
          similarity,
          matchedLines: [],
          matchedSegments: [],
        });
      }
    }

    matches.sort((a, b) => b.similarity - a.similarity);

    const overallSimilarity = matches.length > 0
      ? Math.max(...matches.map(m => m.similarity))
      : 0;

    return {
      similarity: overallSimilarity,
      matchedSubmissions: matches.map(m => ({
        submissionId: m.submissionId,
        userId: m.userId,
        similarity: m.similarity,
        matchedLines: m.matchedLines,
      })),
    };
  }

  /**
   * Normalize code by removing comments, whitespace, and formatting
   */
  private normalizeCode(code: string, language: string): string {
    let normalized = code;

    // Remove comments based on language
    if (language === 'javascript' || language === 'typescript' || language === 'java') {
      // Remove single-line comments
      normalized = normalized.replace(/\/\/.*/g, '');
      // Remove multi-line comments
      normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
    } else if (language === 'python') {
      // Remove Python comments
      normalized = normalized.replace(/#.*/g, '');
      // Remove docstrings
      normalized = normalized.replace(/"""[\s\S]*?"""/g, '');
      normalized = normalized.replace(/'''[\s\S]*?'''/g, '');
    }

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    // Normalize variable names (replace with placeholders)
    normalized = this.normalizeVariables(normalized);

    return normalized;
  }

  /**
   * Normalize variable names to detect renamed plagiarism
   */
  private normalizeVariables(code: string): string {
    const identifierPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const reservedWords = new Set([
      'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'return', 'class', 'import', 'export', 'from', 'async', 'await',
      'try', 'catch', 'throw', 'new', 'this', 'super', 'extends',
      'def', 'lambda', 'pass', 'break', 'continue', 'yield',
      'public', 'private', 'protected', 'static', 'void', 'int', 'string',
    ]);

    const identifierMap = new Map<string, string>();
    let counter = 0;

    return code.replace(identifierPattern, (match) => {
      if (reservedWords.has(match)) {
        return match;
      }

      if (!identifierMap.has(match)) {
        identifierMap.set(match, `VAR${counter++}`);
      }

      return identifierMap.get(match)!;
    });
  }

  /**
   * Tokenize code into meaningful tokens
   */
  private tokenizeCode(code: string, language: string): TokenSequence {
    const tokens: string[] = [];
    const lines: number[] = [];
    let currentLine = 0;

    // Simple tokenization (can be enhanced with AST parsing)
    const tokenPattern = /[a-zA-Z_][a-zA-Z0-9_]*|[0-9]+|[+\-*/%=<>!&|^~]+|[(){}\[\];,.:]|\n/g;

    let match;
    while ((match = tokenPattern.exec(code)) !== null) {
      const token = match[0];
      if (token === '\n') {
        currentLine++;
      } else {
        tokens.push(token);
        lines.push(currentLine);
      }
    }

    return { tokens, lines };
  }

  /**
   * Calculate similarity using Winnowing algorithm (k-gram fingerprinting)
   */
  private calculateSimilarity(seq1: TokenSequence, seq2: TokenSequence): number {
    const fingerprints1 = this.generateFingerprints(seq1.tokens);
    const fingerprints2 = this.generateFingerprints(seq2.tokens);

    if (fingerprints1.size === 0 || fingerprints2.size === 0) {
      return 0;
    }

    // Count matching fingerprints
    let matches = 0;
    for (const fp of fingerprints1) {
      if (fingerprints2.has(fp)) {
        matches++;
      }
    }

    // Jaccard similarity
    const union = fingerprints1.size + fingerprints2.size - matches;
    return matches / union;
  }

  /**
   * Generate fingerprints using k-gram hashing
   */
  private generateFingerprints(tokens: string[]): Set<number> {
    const fingerprints = new Set<number>();
    const k = this.windowSize;

    for (let i = 0; i <= tokens.length - k; i++) {
      const gram = tokens.slice(i, i + k).join('');
      const hash = this.hashString(gram);
      fingerprints.add(hash);
    }

    return fingerprints;
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Find matched line numbers between two code samples
   */
  private findMatchedLines(code1: string, code2: string): number[] {
    const lines1 = code1.split('\n');
    const lines2 = code2.split('\n');
    const matchedLines: number[] = [];

    for (let i = 0; i < lines1.length; i++) {
      const normalized1 = lines1[i].trim();
      if (!normalized1 || normalized1.startsWith('//') || normalized1.startsWith('#')) {
        continue;
      }

      for (const line2 of lines2) {
        const normalized2 = line2.trim();
        const similarity = this.stringSimilarity(normalized1, normalized2);
        if (similarity > 0.8) {
          matchedLines.push(i);
          break;
        }
      }
    }

    return matchedLines;
  }

  /**
   * Find matched segments between token sequences
   */
  private findMatchedSegments(
    seq1: TokenSequence,
    seq2: TokenSequence
  ): Array<{ start: number; end: number; similarity: number }> {
    const segments: Array<{ start: number; end: number; similarity: number }> = [];
    const minSegmentLength = 10;

    for (let i = 0; i < seq1.tokens.length - minSegmentLength; i++) {
      for (let j = 0; j < seq2.tokens.length - minSegmentLength; j++) {
        let matchLength = 0;
        while (
          i + matchLength < seq1.tokens.length &&
          j + matchLength < seq2.tokens.length &&
          seq1.tokens[i + matchLength] === seq2.tokens[j + matchLength]
        ) {
          matchLength++;
        }

        if (matchLength >= minSegmentLength) {
          segments.push({
            start: i,
            end: i + matchLength,
            similarity: 1.0,
          });
          i += matchLength - 1;
          break;
        }
      }
    }

    return segments;
  }

  /**
   * Normalize text for comparison
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Tokenize text into words
   */
  private tokenizeText(text: string): string[] {
    return text.split(/\s+/).filter(token => token.length > 0);
  }

  /**
   * Calculate text similarity using n-gram analysis
   */
  private calculateTextSimilarity(tokens1: string[], tokens2: string[]): number {
    if (tokens1.length === 0 || tokens2.length === 0) {
      return 0;
    }

    // Create n-grams (3-grams)
    const ngrams1 = this.createNGrams(tokens1, 3);
    const ngrams2 = this.createNGrams(tokens2, 3);

    // Calculate Jaccard similarity
    const intersection = ngrams1.filter(ng => ngrams2.includes(ng)).length;
    const union = new Set([...ngrams1, ...ngrams2]).size;

    return intersection / union;
  }

  /**
   * Create n-grams from token array
   */
  private createNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  /**
   * Calculate Levenshtein distance-based similarity
   */
  private stringSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Compute Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check against external sources (mock implementation)
   * In production, this would integrate with services like Turnitin, Copyleaks, etc.
   */
  async checkExternalSources(code: string, language: string): Promise<{
    matches: Array<{
      source: string;
      url: string;
      similarity: number;
    }>;
  }> {
    // Mock implementation - would integrate with external APIs
    // Examples: GitHub search, Stack Overflow, code repositories
    return {
      matches: [],
    };
  }

  /**
   * Generate plagiarism report
   */
  generateReport(result: PlagiarismResult): string {
    let report = '=== Plagiarism Detection Report ===\n\n';
    report += `Overall Similarity Score: ${(result.similarity * 100).toFixed(2)}%\n\n`;

    if (result.similarity < 0.3) {
      report += 'Status: PASS - No significant similarity detected\n';
    } else if (result.similarity < 0.7) {
      report += 'Status: WARNING - Moderate similarity detected\n';
    } else {
      report += 'Status: FAIL - High similarity detected\n';
    }

    if (result.matchedSubmissions.length > 0) {
      report += '\nMatched Submissions:\n';
      result.matchedSubmissions.forEach((match, idx) => {
        report += `\n${idx + 1}. User ${match.userId}\n`;
        report += `   Similarity: ${(match.similarity * 100).toFixed(2)}%\n`;
        report += `   Matched Lines: ${match.matchedLines.length}\n`;
      });
    }

    if (result.externalMatches && result.externalMatches.length > 0) {
      report += '\nExternal Matches:\n';
      result.externalMatches.forEach((match, idx) => {
        report += `\n${idx + 1}. ${match.source}\n`;
        report += `   URL: ${match.url}\n`;
        report += `   Similarity: ${(match.similarity * 100).toFixed(2)}%\n`;
      });
    }

    return report;
  }
}

export const plagiarismDetectionService = new PlagiarismDetectionService();
