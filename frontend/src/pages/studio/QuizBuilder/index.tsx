import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, GripVertical, Copy } from 'lucide-react';

interface QuizQuestion {
  _id?: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'code' | 'essay';
  question: string;
  points: number;
  options?: { text: string; isCorrect: boolean; explanation?: string }[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface Quiz {
  _id?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  isPublished: boolean;
}

const QuizBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    questions: [],
    passingScore: 70,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    isPublished: false
  });
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await fetch(`/api/studio/quizzes/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      }
    } catch (error) {
      console.error('Failed to load quiz:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = id ? `/api/studio/quizzes/${id}` : '/api/studio/quizzes';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(quiz)
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
        if (!id) navigate(`/studio/quizzes/${data._id}`);
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setEditingQuestion({
      type: 'multiple-choice',
      question: '',
      points: 1,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ],
      difficulty: 'medium',
      tags: []
    });
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;

    setQuiz(prev => ({
      ...prev,
      questions: editingQuestion._id
        ? prev.questions.map(q => q._id === editingQuestion._id ? editingQuestion : q)
        : [...prev.questions, editingQuestion]
    }));

    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Quiz Title"
              value={quiz.title}
              onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-bold text-gray-900 border-none focus:ring-0"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Questions */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Questions ({quiz.questions.length})</h2>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>

            {quiz.questions.map((question, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <span className="text-lg font-semibold text-gray-500">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                    <div className="space-y-1">
                      {question.options?.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2 text-sm">
                          <span className={option.isCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            {String.fromCharCode(65 + optIdx)}. {option.text}
                          </span>
                          {option.isCorrect && <span className="text-green-600">✓</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span className="capitalize">{question.difficulty}</span>
                      <span>•</span>
                      <span className="capitalize">{question.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingQuestion(question);
                      setShowQuestionModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {quiz.questions.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No questions yet. Add your first question to get started.</p>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Quiz Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={quiz.passingScore}
                    onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                    className="w-full border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={quiz.timeLimit || ''}
                    onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || undefined }))}
                    className="w-full border-gray-300 rounded-lg"
                    placeholder="No limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    value={quiz.maxAttempts || ''}
                    onChange={(e) => setQuiz(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || undefined }))}
                    className="w-full border-gray-300 rounded-lg"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quiz.shuffleQuestions}
                      onChange={(e) => setQuiz(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Shuffle questions</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={quiz.showCorrectAnswers}
                      onChange={(e) => setQuiz(prev => ({ ...prev, showCorrectAnswers: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Show correct answers</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Quiz Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-medium">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-medium">
                    {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${quiz.isPublished ? 'text-green-600' : 'text-gray-600'}`}>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h3 className="text-xl font-semibold mb-4">
              {editingQuestion._id ? 'Edit Question' : 'Add Question'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <select
                  value={editingQuestion.type}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                  className="w-full border-gray-300 rounded-lg"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-in-blank">Fill in the Blank</option>
                  <option value="code">Code</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <textarea
                  value={editingQuestion.question}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg"
                  placeholder="Enter your question"
                />
              </div>

              {editingQuestion.type === 'multiple-choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {editingQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[index].isCorrect = e.target.checked;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="rounded border-gray-300"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => {
                            const newOptions = [...(editingQuestion.options || [])];
                            newOptions[index].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="flex-1 border-gray-300 rounded-lg"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOptions = [...(editingQuestion.options || []), { text: '', isCorrect: false }];
                        setEditingQuestion({ ...editingQuestion, options: newOptions });
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={editingQuestion.points}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) })}
                    className="w-full border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={editingQuestion.difficulty}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                    className="w-full border-gray-300 rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
