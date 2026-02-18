import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Save,
  Eye,
  Upload,
  Settings,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit2
} from 'lucide-react';

interface Section {
  _id?: string;
  title: string;
  description?: string;
  order: number;
  lessons: any[];
  isPublished: boolean;
}

interface Course {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objectives: string[];
  sections: Section[];
  isPublished: boolean;
}

const SortableSection: React.FC<{
  section: Section;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}> = ({ section, index, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section._id || `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4"
    >
      <div className="flex items-center p-4 gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={20} />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(index)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isExpanded && section.lessons.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            {section.lessons.map((lesson, lessonIndex) => (
              <div
                key={lessonIndex}
                className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200"
              >
                <span className="text-sm text-gray-500">{lessonIndex + 1}.</span>
                <span className="flex-1 text-sm font-medium text-gray-900">
                  {lesson.title || 'Untitled Lesson'}
                </span>
                <span className="text-xs text-gray-500">
                  {lesson.estimatedDuration || 0} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course>({
    title: '',
    slug: '',
    description: '',
    category: '',
    level: 'beginner',
    objectives: [''],
    sections: [],
    isPublished: false
  });
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/studio/courses/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCourse(prev => {
        const oldIndex = prev.sections.findIndex(
          s => (s._id || `section-${prev.sections.indexOf(s)}`) === active.id
        );
        const newIndex = prev.sections.findIndex(
          s => (s._id || `section-${prev.sections.indexOf(s)}`) === over.id
        );

        const newSections = arrayMove(prev.sections, oldIndex, newIndex);
        return {
          ...prev,
          sections: newSections.map((s, i) => ({ ...s, order: i }))
        };
      });
    }
  };

  const handleAddSection = () => {
    setEditingSectionIndex(null);
    setSectionForm({ title: '', description: '' });
    setShowSectionModal(true);
  };

  const handleEditSection = (index: number) => {
    const section = course.sections[index];
    setEditingSectionIndex(index);
    setSectionForm({
      title: section.title,
      description: section.description || ''
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = () => {
    if (!sectionForm.title.trim()) return;

    setCourse(prev => {
      const sections = [...prev.sections];

      if (editingSectionIndex !== null) {
        sections[editingSectionIndex] = {
          ...sections[editingSectionIndex],
          ...sectionForm
        };
      } else {
        sections.push({
          title: sectionForm.title,
          description: sectionForm.description,
          order: sections.length,
          lessons: [],
          isPublished: false
        });
      }

      return { ...prev, sections };
    });

    setShowSectionModal(false);
    setSectionForm({ title: '', description: '' });
  };

  const handleDeleteSection = (index: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setCourse(prev => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const url = id ? `/api/studio/courses/${id}` : '/api/studio/courses';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(course)
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        if (!id) {
          navigate(`/studio/courses/${data._id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save course:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishCourse = async () => {
    try {
      const response = await fetch(`/api/studio/courses/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ publish: !course.isPublished })
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      }
    } catch (error) {
      console.error('Failed to publish course:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <input
                type="text"
                placeholder="Course Title"
                value={course.title}
                onChange={(e) => setCourse(prev => ({
                  ...prev,
                  title: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                }))}
                className="text-2xl font-bold text-gray-900 border-none focus:ring-0 w-full p-0"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/courses/${id}/preview`)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Eye size={18} />
                Preview
              </button>

              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>

              {id && (
                <button
                  onClick={handlePublishCourse}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    course.isPublished
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Upload size={18} />
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              )}

              <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={course.description}
                onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="What will students learn in this course?"
              />
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Objectives
              </label>
              <div className="space-y-2">
                {course.objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const newObjectives = [...course.objectives];
                        newObjectives[index] = e.target.value;
                        setCourse(prev => ({ ...prev, objectives: newObjectives }));
                      }}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Students will be able to..."
                    />
                    <button
                      onClick={() => {
                        const newObjectives = course.objectives.filter((_, i) => i !== index);
                        setCourse(prev => ({ ...prev, objectives: newObjectives }));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setCourse(prev => ({
                    ...prev,
                    objectives: [...prev.objectives, '']
                  }))}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Plus size={16} />
                  Add Objective
                </button>
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Curriculum</h2>
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm"
                >
                  <Plus size={18} />
                  Add Section
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={course.sections.map((s, i) => s._id || `section-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {course.sections.map((section, index) => (
                    <SortableSection
                      key={section._id || `section-${index}`}
                      section={section}
                      index={index}
                      onEdit={handleEditSection}
                      onDelete={handleDeleteSection}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {course.sections.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No sections yet. Add your first section to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={course.category}
                    onChange={(e) => setCourse(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="playwright">Playwright</option>
                    <option value="selenium">Selenium</option>
                    <option value="testing">Testing Fundamentals</option>
                    <option value="automation">Test Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={course.level}
                    onChange={(e) => setCourse(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thumbnail</h3>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-gray-400">No thumbnail</span>
                </div>
              )}
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
                Upload Thumbnail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingSectionIndex !== null ? 'Edit Section' : 'Add Section'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Section title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={sectionForm.description}
                  onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Section description (optional)"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSectionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
