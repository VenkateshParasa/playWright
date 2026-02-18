import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Plus, X, Clock, AlertCircle, CheckCircle, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import useAdminContentStore from '../../stores/adminContentStore';
import PublishSettings from '../../components/admin/PublishSettings';
import ContentPreview from '../../components/admin/ContentPreview';
import type { ExerciseContent, TestCase } from '../../stores/adminContentStore';

const ExerciseEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentExercise,
    setCurrentExercise,
    updateExerciseField,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    addHint,
    updateHint,
    deleteHint,
    saveExerciseDraft,
    publishExercise,
    hasUnsavedChanges,
    lastAutoSave,
    isLoading,
    error,
  } = useAdminContentStore();

  const [showPreview, setShowPreview] = useState(false);
  const [newTestCase, setNewTestCase] = useState<Partial<TestCase>>({
    input: '',
    expectedOutput: '',
    description: '',
    isHidden: false,
  });
  const [newHint, setNewHint] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => saveExerciseDraft(), 30000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveExerciseDraft]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`/api/admin/exercises/${id}`)
        .then((res) => res.json())
        .then((exercise) => setCurrentExercise(exercise))
        .catch((err) => console.error('Failed to load exercise:', err));
    } else if (id === 'new') {
      setCurrentExercise({
        id: '',
        title: '',
        description: '',
        difficulty: 'beginner',
        language: 'typescript',
        starterCode: '// Write your solution here\n\n',
        solutionCode: '// Model solution\n\n',
        testCases: [],
        hints: [],
        learningObjectives: [],
        category: '',
        tags: [],
        status: 'draft',
        timeEstimate: 30,
      });
    }
    return () => setCurrentExercise(null);
  }, [id, setCurrentExercise]);

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exercise...</p>
        </div>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    saveExerciseDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePublish = async () => {
    if (!currentExercise.title || !currentExercise.starterCode || currentExercise.testCases.length === 0) {
      alert('Please fill in title, starter code, and add at least one test case');
      return;
    }
    if (confirm('Are you sure you want to publish this exercise?')) {
      await publishExercise();
      navigate('/admin/content');
    }
  };

  const handleAddTestCase = () => {
    if (!newTestCase.input?.trim() || !newTestCase.expectedOutput?.trim()) {
      alert('Please fill in input and expected output');
      return;
    }
    addTestCase({
      id: `tc-${Date.now()}`,
      input: newTestCase.input,
      expectedOutput: newTestCase.expectedOutput,
      description: newTestCase.description || '',
      isHidden: newTestCase.isHidden || false,
    });
    setNewTestCase({ input: '', expectedOutput: '', description: '', isHidden: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure?')) return;
                  navigate('/admin/content');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {id === 'new' ? 'Create New Exercise' : 'Edit Exercise'}
                </h1>
                {lastAutoSave && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last saved: {new Date(lastAutoSave).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exercise Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={currentExercise.title}
                  onChange={(e) => updateExerciseField('title', e.target.value)}
                  placeholder="Enter exercise title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={currentExercise.description}
                  onChange={(e) => updateExerciseField('description', e.target.value)}
                  placeholder="Describe the exercise task"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select
                    value={currentExercise.language}
                    onChange={(e) => updateExerciseField('language', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={currentExercise.difficulty}
                    onChange={(e) => updateExerciseField('difficulty', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (min)</label>
                  <input
                    type="number"
                    value={currentExercise.timeEstimate}
                    onChange={(e) => updateExerciseField('timeEstimate', parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Starter Code */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Starter Code *</h2>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Editor
                  height="300px"
                  language={currentExercise.language === 'java' ? 'java' : 'typescript'}
                  value={currentExercise.starterCode}
                  onChange={(value) => updateExerciseField('starterCode', value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Solution Code */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Solution Code *</h2>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <Editor
                  height="300px"
                  language={currentExercise.language === 'java' ? 'java' : 'typescript'}
                  value={currentExercise.solutionCode}
                  onChange={(value) => updateExerciseField('solutionCode', value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Cases *</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input</label>
                  <textarea
                    value={newTestCase.input}
                    onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                    placeholder="Test input"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Output</label>
                  <textarea
                    value={newTestCase.expectedOutput}
                    onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                    placeholder="Expected output"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={newTestCase.description}
                    onChange={(e) => setNewTestCase({ ...newTestCase, description: e.target.value })}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTestCase.isHidden || false}
                    onChange={(e) => setNewTestCase({ ...newTestCase, isHidden: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Hidden test case (for validation only)</span>
                </label>
                <button
                  onClick={handleAddTestCase}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Test Case
                </button>
              </div>

              {currentExercise.testCases.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Test Cases ({currentExercise.testCases.length})</h3>
                  {currentExercise.testCases.map((tc, index) => (
                    <div key={tc.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Test Case {index + 1} {tc.isHidden && <span className="text-xs text-gray-500">(Hidden)</span>}
                        </p>
                        {tc.description && <p className="text-xs text-gray-500 dark:text-gray-400">{tc.description}</p>}
                      </div>
                      <button
                        onClick={() => deleteTestCase(tc.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hints */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hints</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newHint.trim()) {
                      addHint(newHint.trim());
                      setNewHint('');
                    }
                  }}
                  placeholder="Add a hint"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (newHint.trim()) {
                      addHint(newHint.trim());
                      setNewHint('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {currentExercise.hints.length > 0 && (
                <ul className="space-y-2">
                  {currentExercise.hints.map((hint, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                      <span className="text-gray-900 dark:text-white text-sm">
                        <strong>Hint {index + 1}:</strong> {hint}
                      </span>
                      <button
                        onClick={() => deleteHint(index)}
                        className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PublishSettings
              status={currentExercise.status}
              scheduledFor={currentExercise.scheduledFor}
              onStatusChange={(status) => updateExerciseField('status', status)}
              onScheduleChange={(date) => updateExerciseField('scheduledFor', date)}
            />
          </div>
        </div>
      </div>

      {showPreview && (
        <ContentPreview
          content={currentExercise}
          type="exercise"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ExerciseEditor;
