import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle,
  Circle,
  Clock,
  Trophy,
  BookOpen,
  Terminal as TerminalIcon,
  Code,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import CodeEditor, { CodeFile } from '../../components/playground/CodeEditor';
import Terminal from '../../components/playground/Terminal';

interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  instructions: LabInstruction[];
  checkpoints: LabCheckpoint[];
}

interface LabInstruction {
  step: number;
  title: string;
  content: string;
  code?: string;
  hints?: string[];
}

interface LabCheckpoint {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
}

interface LabSession {
  id: string;
  labId: string;
  sandboxId: string;
  progress: {
    currentStep: number;
    completedCheckpoints: string[];
    timeSpent: number;
  };
}

export const VirtualLab: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [session, setSession] = useState<LabSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'index.js',
      language: 'javascript',
      content: '// Start coding here...\n',
      path: 'index.js',
    },
  ]);

  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session) {
      interval = setInterval(() => {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                progress: {
                  ...prev.progress,
                  timeSpent: prev.progress.timeSpent + 1,
                },
              }
            : null
        );
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const fetchLabs = async () => {
    try {
      const response = await fetch('/api/playground/labs');
      if (response.ok) {
        const data = await response.json();
        setLabs(data.labs);
      }
    } catch (error) {
      console.error('Failed to fetch labs:', error);
    }
  };

  const startLab = async (labId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/playground/labs/${labId}/start`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setSelectedLab(data.lab);
        setCurrentStep(0);

        // Initialize files based on lab template
        if (data.lab.instructions[0]?.code) {
          setFiles([
            {
              id: '1',
              name: 'index.js',
              language: 'javascript',
              content: data.lab.instructions[0].code,
              path: 'index.js',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to start lab:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCheckpoint = async (checkpointId: string) => {
    if (!session) return;

    setValidating(checkpointId);
    try {
      const response = await fetch(
        `/api/playground/labs/${session.id}/checkpoints/${checkpointId}/validate`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.valid) {
          // Update session with completed checkpoint
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  progress: {
                    ...prev.progress,
                    completedCheckpoints: [
                      ...prev.progress.completedCheckpoints,
                      checkpointId,
                    ],
                  },
                }
              : null
          );
        }

        // Show validation result
        alert(
          result.valid
            ? `Checkpoint completed! ${result.details || ''}`
            : `Checkpoint not met. ${result.details || ''}`
        );
      }
    } catch (error) {
      console.error('Failed to validate checkpoint:', error);
    } finally {
      setValidating(null);
    }
  };

  const completeLab = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/playground/labs/${session.id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Congratulations! You have completed the lab!');
        setSession(null);
        setSelectedLab(null);
      }
    } catch (error) {
      console.error('Failed to complete lab:', error);
    }
  };

  const handleTerminalCommand = async (command: string) => {
    if (!session) {
      return {
        stdout: 'Error: No active lab session',
        stderr: '',
        exitCode: 1,
      };
    }

    try {
      const response = await fetch(
        `/api/playground/sandbox/${session.sandboxId}/command`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command }),
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Command failed',
        exitCode: 1,
      };
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!selectedLab || !session) {
    // Lab Selection View
    return (
      <div className="h-screen bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Labs</h1>
            <p className="text-lg text-gray-600">
              Hands-on learning experiences with guided tutorials and checkpoints
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{lab.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                        lab.difficulty
                      )}`}
                    >
                      {lab.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{lab.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lab.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{lab.instructions.length} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{lab.checkpoints.length} checkpoints</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startLab(lab.id)}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Lab
                  </button>
                </div>
              </div>
            ))}
          </div>

          {labs.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">No labs available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lab Environment View
  const instruction = selectedLab.instructions[currentStep];
  const progress =
    (session.progress.completedCheckpoints.length / selectedLab.checkpoints.length) * 100;

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">{selectedLab.title}</h1>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
              selectedLab.difficulty
            )}`}
          >
            {selectedLab.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Time: {formatTime(session.progress.timeSpent)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>
              {session.progress.completedCheckpoints.length}/
              {selectedLab.checkpoints.length} checkpoints
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-800">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Instructions Sidebar */}
        <div className="w-96 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            {/* Steps Navigation */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Instructions
              </h2>

              <div className="space-y-2">
                {selectedLab.instructions.map((inst, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Step {inst.step}</span>
                    </div>
                    <div className="text-sm mt-1">{inst.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Step {instruction.step}: {instruction.title}
              </h3>
              <p className="text-gray-300 whitespace-pre-wrap">{instruction.content}</p>

              {instruction.hints && instruction.hints.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {showHints ? 'Hide' : 'Show'} Hints ({instruction.hints.length})
                  </button>

                  {showHints && (
                    <div className="mt-2 space-y-2">
                      {instruction.hints.map((hint, i) => (
                        <div
                          key={i}
                          className="p-2 bg-gray-700 rounded text-sm text-gray-300"
                        >
                          {hint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checkpoints */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Checkpoints
              </h3>

              <div className="space-y-2">
                {selectedLab.checkpoints.map((checkpoint) => {
                  const isCompleted = session.progress.completedCheckpoints.includes(
                    checkpoint.id
                  );
                  const isValidating = validating === checkpoint.id;

                  return (
                    <div
                      key={checkpoint.id}
                      className="p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-sm font-medium text-white">
                              {checkpoint.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 ml-6">
                            {checkpoint.description}
                          </p>
                        </div>

                        {!isCompleted && (
                          <button
                            onClick={() => validateCheckpoint(checkpoint.id)}
                            disabled={isValidating}
                            className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                          >
                            {isValidating ? 'Validating...' : 'Validate'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() =>
                  setCurrentStep(
                    Math.min(selectedLab.instructions.length - 1, currentStep + 1)
                  )
                }
                disabled={currentStep === selectedLab.instructions.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Complete Lab Button */}
            {progress === 100 && (
              <button
                onClick={completeLab}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Complete Lab
              </button>
            )}
          </div>
        </div>

        {/* Editor and Terminal */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              files={files}
              activeFileId={files[0]?.id}
              onFileChange={(fileId, content) => {
                setFiles((prev) =>
                  prev.map((f) => (f.id === fileId ? { ...f, content } : f))
                );
              }}
            />
          </div>

          <div className="h-64 border-t border-gray-700">
            <Terminal
              sandboxId={session.sandboxId}
              onCommand={handleTerminalCommand}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualLab;
