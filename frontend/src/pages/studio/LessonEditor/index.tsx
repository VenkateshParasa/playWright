import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { lowlight } from 'lowlight';
import {
  Bold, Italic, Underline, Code, List, ListOrdered,
  Quote, Undo, Redo, Image as ImageIcon, Link as LinkIcon,
  Video, FileText, Save, Eye, Settings
} from 'lucide-react';

// Import languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';

lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  content: string;
  courseId: string;
  sectionId?: string;
  contentType: 'markdown' | 'html' | 'wysiwyg';
  objectives: string[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isPublished: boolean;
}

const MenuBar: React.FC<{ editor: any }> = ({ editor }) => {
  if (!editor) return null;

  const buttons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: Underline, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: Undo, action: () => editor.chain().focus().undo().run() },
    { icon: Redo, action: () => editor.chain().focus().redo().run() }
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.action}
          className={`p-2 rounded hover:bg-gray-200 ${
            btn.active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
          }`}
        >
          <btn.icon size={18} />
        </button>
      ))}
    </div>
  );
};

const LessonEditor: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson>({
    title: '',
    description: '',
    content: '',
    courseId: courseId || '',
    contentType: 'wysiwyg',
    objectives: [''],
    estimatedDuration: 0,
    difficulty: 'medium',
    isPublished: false
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight
      }),
      Image,
      Link,
      Table,
      TableRow,
      TableCell,
      TableHeader
    ],
    content: lesson.content,
    onUpdate: ({ editor }) => {
      setLesson(prev => ({ ...prev, content: editor.getHTML() }));
    }
  });

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  const loadLesson = async () => {
    try {
      const response = await fetch(`/api/studio/lessons/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLesson(data);
        editor?.commands.setContent(data.content);
      }
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = id ? `/api/studio/lessons/${id}` : '/api/studio/lessons';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(lesson)
      });

      if (response.ok) {
        const data = await response.json();
        setLesson(data);
        if (!id) {
          navigate(`/studio/lessons/${data._id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save lesson:', error);
    } finally {
      setSaving(false);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Lesson Title"
                value={lesson.title}
                onChange={(e) => setLesson(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold text-gray-900 border-none focus:ring-0 w-full p-0"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Eye size={18} />
                Preview
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6">
            {['content', 'settings', 'preview'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-gray-200">
              <button
                onClick={insertImage}
                className="p-2 rounded hover:bg-gray-100 text-gray-700"
                title="Insert Image"
              >
                <ImageIcon size={18} />
              </button>
              <button
                onClick={insertLink}
                className="p-2 rounded hover:bg-gray-100 text-gray-700"
                title="Insert Link"
              >
                <LinkIcon size={18} />
              </button>
              <button
                onClick={insertCodeBlock}
                className="p-2 rounded hover:bg-gray-100 text-gray-700"
                title="Insert Code Block"
              >
                <Code size={18} />
              </button>
            </div>

            <MenuBar editor={editor} />

            <EditorContent
              editor={editor}
              className="prose max-w-none p-6 min-h-[500px] focus:outline-none"
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Lesson Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={lesson.description}
                    onChange={(e) => setLesson(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border-gray-300 rounded-lg"
                    placeholder="Brief description of the lesson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={lesson.estimatedDuration}
                    onChange={(e) => setLesson(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                    className="w-full border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={lesson.difficulty}
                    onChange={(e) => setLesson(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full border-gray-300 rounded-lg"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Learning Objectives</h3>

              <div className="space-y-2">
                {lesson.objectives.map((obj, index) => (
                  <input
                    key={index}
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const newObjectives = [...lesson.objectives];
                      newObjectives[index] = e.target.value;
                      setLesson(prev => ({ ...prev, objectives: newObjectives }));
                    }}
                    className="w-full border-gray-300 rounded-lg"
                    placeholder="What will students learn?"
                  />
                ))}
                <button
                  onClick={() => setLesson(prev => ({
                    ...prev,
                    objectives: [...prev.objectives, '']
                  }))}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Objective
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
            <p className="text-gray-600 mb-6">{lesson.description}</p>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonEditor;
