/**
 * Code Grading Results Component
 * Displays automated grading results with detailed feedback
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Shield,
  TrendingUp,
  Code,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';

interface GradingResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  testResults: TestResult[];
  styleIssues: StyleIssue[];
  securityVulnerabilities: SecurityVulnerability[];
  performanceMetrics: PerformanceMetrics;
  plagiarismResult?: PlagiarismResult;
  feedback: string[];
  partialCredits: {
    tests: number;
    style: number;
    security: number;
    performance: number;
  };
  gradedAt: Date;
}

interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  executionTime: number;
  error?: string;
}

interface StyleIssue {
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  description: string;
  recommendation: string;
}

interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  complexity: {
    cyclomatic: number;
    cognitive: number;
  };
  suggestions: string[];
}

interface PlagiarismResult {
  similarity: number;
  matchedSubmissions: Array<{
    submissionId: string;
    userId: string;
    similarity: number;
  }>;
}

interface CodeGradingResultsProps {
  result: GradingResult;
  showDetailedOutput?: boolean;
}

export const CodeGradingResults: React.FC<CodeGradingResultsProps> = ({
  result,
  showDetailedOutput = true,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'style' | 'security' | 'performance'>('overview');
  const [showHiddenTests, setShowHiddenTests] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': case 'error': return 'text-orange-600 bg-orange-50';
      case 'medium': case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'low': case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grading-result-${new Date().getTime()}.json`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Score Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grading Results</h2>
            <p className="text-sm text-gray-500">
              Graded on {new Date(result.gradedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {result.score.toFixed(1)} / {result.maxScore}
              </div>
            </div>
            <div className={`p-3 rounded-full ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {result.passed ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {result.partialCredits.tests.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {result.partialCredits.style.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Style</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-orange-600">
                {result.partialCredits.security.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Security</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {result.partialCredits.performance.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Performance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Summary Feedback</h3>
        <ul className="space-y-1">
          {result.feedback.map((item, index) => (
            <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Plagiarism Alert */}
      {result.plagiarismResult && result.plagiarismResult.similarity > 0.5 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Plagiarism Detected</h3>
              <p className="text-sm text-red-700 mt-1">
                {(result.plagiarismResult.similarity * 100).toFixed(1)}% similarity found with{' '}
                {result.plagiarismResult.matchedSubmissions.length} other submission(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tests', label: 'Test Results', count: result.testResults.length },
            { id: 'style', label: 'Style Issues', count: result.styleIssues.length },
            { id: 'security', label: 'Security', count: result.securityVulnerabilities.length },
            { id: 'performance', label: 'Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Test Results Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Test Results</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Passed:</span>
                    <span className="font-semibold text-green-600">
                      {result.testResults.filter(t => t.passed).length} / {result.testResults.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Failed:</span>
                    <span className="font-semibold text-red-600">
                      {result.testResults.filter(t => !t.passed).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Performance</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg Execution:</span>
                    <span className="font-semibold">
                      {result.performanceMetrics.executionTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Complexity:</span>
                    <span className="font-semibold">
                      {result.performanceMetrics.complexity.cyclomatic}
                    </span>
                  </div>
                </div>
              </div>

              {/* Style Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Code Style</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Errors:</span>
                    <span className="font-semibold text-red-600">
                      {result.styleIssues.filter(i => i.severity === 'error').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Warnings:</span>
                    <span className="font-semibold text-yellow-600">
                      {result.styleIssues.filter(i => i.severity === 'warning').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold">Security</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Critical:</span>
                    <span className="font-semibold text-red-600">
                      {result.securityVulnerabilities.filter(v => v.severity === 'critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>High:</span>
                    <span className="font-semibold text-orange-600">
                      {result.securityVulnerabilities.filter(v => v.severity === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Test Case Results</h3>
              {showDetailedOutput && (
                <button
                  onClick={() => setShowHiddenTests(!showHiddenTests)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showHiddenTests ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showHiddenTests ? 'Hide' : 'Show'} Details
                </button>
              )}
            </div>

            {result.testResults.map((test, index) => (
              <div
                key={test.testCaseId}
                className={`border rounded-lg p-4 ${
                  test.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {test.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">Test Case #{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {test.executionTime.toFixed(2)}ms
                  </div>
                </div>

                {showHiddenTests && (
                  <div className="mt-3 space-y-2 text-sm">
                    {!test.passed && test.error && (
                      <div className="bg-red-100 rounded p-2">
                        <span className="font-medium text-red-900">Error: </span>
                        <span className="text-red-700">{test.error}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Expected:</div>
                        <div className="bg-white rounded p-2 font-mono text-xs">
                          {test.expectedOutput}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Actual:</div>
                        <div className="bg-white rounded p-2 font-mono text-xs">
                          {test.actualOutput || '(no output)'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-3">
            {result.styleIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No style issues found! Great job!</p>
              </div>
            ) : (
              result.styleIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{issue.rule}</span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded">
                          Line {issue.line}:{issue.column}
                        </span>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3">
            {result.securityVulnerabilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No security vulnerabilities detected!</p>
              </div>
            ) : (
              result.securityVulnerabilities.map((vuln, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getSeverityColor(vuln.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(vuln.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{vuln.type}</span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded uppercase">
                          {vuln.severity}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded">
                          Line {vuln.line}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{vuln.description}</p>
                      <div className="bg-white rounded p-2 text-sm">
                        <span className="font-medium">Recommendation: </span>
                        {vuln.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Execution Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average Time:</span>
                    <span className="font-medium">
                      {result.performanceMetrics.executionTime.toFixed(2)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span className="font-medium">
                      {(result.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Complexity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cyclomatic:</span>
                    <span className="font-medium">
                      {result.performanceMetrics.complexity.cyclomatic}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive:</span>
                    <span className="font-medium">
                      {result.performanceMetrics.complexity.cognitive}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {result.performanceMetrics.suggestions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Optimization Suggestions</h4>
                <ul className="space-y-2">
                  {result.performanceMetrics.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
