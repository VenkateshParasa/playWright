import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  Plus,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
  GripVertical,
  Upload,
} from 'lucide-react';
import useAdminContentStore from '../../stores/adminContentStore';
import PublishSettings from '../../components/admin/PublishSettings';
import ContentPreview from '../../components/admin/ContentPreview';
import MediaUploader from '../../components/admin/MediaUploader';
import type { QuizContent, QuizQuestion } from '../../stores/adminContentStore';

const QuizEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentQuiz,
    setCurrentQuiz,
    updateQuizField,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion,
    reorderQuizQuestions,
    saveQuizDraft,
    publishQuiz,
    hasUnsavedChanges,
    lastAutoSave,
    isLoading,
    error,
  } = useAdminContentStore();

  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 1,
  });
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [uploadingForQuestion, setUploadingForQuestion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      saveQuizDraft();
    }, 30000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveQuizDraft]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`/api/admin/quizzes/${id}`)
        .then((res) => res.json())
        .then((quiz) => setCurrentQuiz(quiz))
        .catch((err) => console.error('Failed to load quiz:', err));
    } else if (id === 'new') {
      setCurrentQuiz({
        id: '',
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 70,
        questions: [],
        category: '',
        tags: [],
        difficulty: 'beginner',
        status: 'draft',
        randomizeQuestions: false,
        randomizeOptions: false,
        showFeedback: true,
        allowRetry: true,
      });
    }
    return () => {
      setCurrentQuiz(null);
    };
  }, [id, setCurrentQuiz]);

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    saveQuizDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePublish = async () => {
    if (!currentQuiz.title || currentQuiz.questions.length === 0) {
      alert('Please add a title and at least one question before publishing');
      return;
    }

    if (confirm('Are you sure you want to publish this quiz?')) {
      await publishQuiz();
      navigate('/admin/content');
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question?.trim()) {
      alert('Please enter a question');
      return;
    }

    if (newQuestion.type === 'multiple-choice') {
      const validOptions = newQuestion.options?.filter((o) => o.trim()) || [];
      if (validOptions.length < 2) {
        alert('Please add at least 2 options');
        return;
      }
      if (!newQuestion.correctAnswer) {
        alert('Please select the correct answer');
        return;
      }
    } else if (newQuestion.type === 'true-false') {
      if (!newQuestion.correctAnswer) {
        alert('Please select the correct answer');
        return;
      }
    }

    const question: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: newQuestion.type as 'multiple-choice' | 'true-false',
      question: newQuestion.question,
      options:
        newQuestion.type === 'multiple-choice'
          ? newQuestion.options?.filter((o) => o.trim())
          : undefined,
      correctAnswer: newQuestion.correctAnswer || '',
      explanation: newQuestion.explanation || '',
      points: newQuestion.points || 1,
    };

    addQuizQuestion(question);
    setNewQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), ''],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions.splice(index, 1);
    setNewQuestion({ ...newQuestion, options: newOptions });
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
                  if (
                    hasUnsavedChanges &&
                    !confirm('You have unsaved changes. Are you sure you want to leave?')
                  ) {
                    return;
                  }
                  navigate('/admin/content');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {id === 'new' ? 'Create New Quiz' : 'Edit Quiz'}
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
                {currentQuiz.status === 'published' ? 'Update' : 'Publish'}
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={currentQuiz.title}
                  onChange={(e) => updateQuizField('title', e.target.value)}
                  placeholder="Enter quiz title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={currentQuiz.description}
                  onChange={(e) => updateQuizField('description', e.target.value)}
                  placeholder="Brief description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Limit (min)
                  </label>
                  <input
                    type="number"
                    value={currentQuiz.timeLimit}
                    onChange={(e) =>
                      updateQuizField('timeLimit', parseInt(e.target.value) || 0)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={currentQuiz.passingScore}
                    onChange={(e) =>
                      updateQuizField('passingScore', parseInt(e.target.value) || 0)
                    }
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={currentQuiz.difficulty}
                    onChange={(e) =>
                      updateQuizField(
                        'difficulty',
                        e.target.value as 'beginner' | 'intermediate' | 'advanced'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add New Question */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Question
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Type
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      type: e.target.value as 'multiple-choice' | 'true-false',
                      options:
                        e.target.value === 'multiple-choice' ? ['', '', '', ''] : undefined,
                      correctAnswer: '',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  placeholder="Enter your question"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {newQuestion.type === 'multiple-choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options *
                    </label>
                    <button
                      onClick={addOption}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newQuestion.correctAnswer === option}
                          onChange={() =>
                            setNewQuestion({ ...newQuestion, correctAnswer: option })
                          }
                          className="mt-3"
                          title="Mark as correct"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {(newQuestion.options?.length || 0) > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newQuestion.type === 'true-false' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correct Answer *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="trueFalse"
                        checked={newQuestion.correctAnswer === 'True'}
                        onChange={() =>
                          setNewQuestion({ ...newQuestion, correctAnswer: 'True' })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-900 dark:text-white">True</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="trueFalse"
                        checked={newQuestion.correctAnswer === 'False'}
                        onChange={() =>
                          setNewQuestion({ ...newQuestion, correctAnswer: 'False' })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-900 dark:text-white">False</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Explanation
                </label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, explanation: e.target.value })
                  }
                  placeholder="Explain why this is the correct answer"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {/* Existing Questions */}
            {currentQuiz.questions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Questions ({currentQuiz.questions.length})
                </h2>

                <div className="space-y-3">
                  {currentQuiz.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-medium">
                            {question.question}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {question.type === 'multiple-choice'
                              ? `${question.options?.length} options`
                              : 'True/False'}{' '}
                            • {question.points} point(s)
                          </p>
                        </div>
                        <button
                          onClick={() => deleteQuizQuestion(question.id)}
                          className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PublishSettings
              status={currentQuiz.status}
              scheduledFor={currentQuiz.scheduledFor}
              onStatusChange={(status) => updateQuizField('status', status)}
              onScheduleChange={(date) => updateQuizField('scheduledFor', date)}
            />

            {/* Quiz Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Options
              </h3>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentQuiz.randomizeQuestions}
                  onChange={(e) => updateQuizField('randomizeQuestions', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Randomize question order
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentQuiz.randomizeOptions}
                  onChange={(e) => updateQuizField('randomizeOptions', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Randomize option order
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentQuiz.showFeedback}
                  onChange={(e) => updateQuizField('showFeedback', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Show feedback after submission
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentQuiz.allowRetry}
                  onChange={(e) => updateQuizField('allowRetry', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Allow retries
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <ContentPreview
          content={currentQuiz}
          type="quiz"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default QuizEditor;
