import { Request, Response } from 'express';
import Lesson from '../../models/Lesson.js';
import Course from '../../models/Course.js';
import contentVersioningService from '../../services/contentVersioning.js';

/**
 * Get all lessons
 */
export const getLessons = async (req: Request, res: Response) => {
  try {
    const {
      courseId,
      sectionId,
      isPublished,
      difficulty,
      search,
      page = 1,
      limit = 20,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const query: any = {};

    if (courseId) query.courseId = courseId;
    if (sectionId) query.sectionId = sectionId;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (difficulty) query.difficulty = difficulty;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [lessons, total] = await Promise.all([
      Lesson.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('courseId', 'title slug')
        .select('-content -versions')
        .lean(),
      Lesson.countDocuments(query)
    ]);

    res.json({
      lessons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Failed to fetch lessons', error: (error as Error).message });
  }
};

/**
 * Get single lesson
 */
export const getLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('courseId', 'title slug instructors')
      .populate('quizzes.quizId', 'title description');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Failed to fetch lesson', error: (error as Error).message });
  }
};

/**
 * Create a new lesson
 */
export const createLesson = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      courseId,
      sectionId,
      content,
      contentType,
      objectives,
      prerequisites,
      estimatedDuration,
      difficulty,
      order,
      isFree
    } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString() &&
      !course.instructors.some(i => i.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const lesson = new Lesson({
      title,
      slug,
      description,
      courseId,
      sectionId,
      content: content || '',
      contentType: contentType || 'wysiwyg',
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      estimatedDuration: estimatedDuration || 0,
      difficulty: difficulty || 'medium',
      order: order || 0,
      isFree: isFree || false,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await lesson.save();

    // Create initial version
    await contentVersioningService.createLessonVersion(
      lesson._id,
      req.user._id,
      'Initial version'
    );

    // Add lesson to course section if sectionId is provided
    if (sectionId) {
      const section = course.sections.find(s => s._id?.toString() === sectionId);
      if (section) {
        section.lessons.push(lesson._id);
        await course.save();
      }
    }

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Failed to create lesson', error: (error as Error).message });
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content,
      contentType,
      objectives,
      prerequisites,
      estimatedDuration,
      difficulty,
      order,
      isFree,
      allowComments,
      codeBlocks,
      videos,
      quizzes,
      resources,
      interactiveElements,
      createVersion,
      versionChangeLog
    } = req.body;

    const lesson = await Lesson.findById(id).populate('courseId', 'instructors createdBy');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check permissions
    const course: any = lesson.courseId;
    if (
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString() &&
      !course.instructors.some((i: any) => i.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create version before updating if content changed or explicitly requested
    if (createVersion || (content && content !== lesson.content)) {
      await contentVersioningService.createLessonVersion(
        lesson._id,
        req.user._id,
        versionChangeLog || 'Content update'
      );
    }

    // Update fields
    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (content !== undefined) lesson.content = content;
    if (contentType) lesson.contentType = contentType;
    if (objectives) lesson.objectives = objectives;
    if (prerequisites) lesson.prerequisites = prerequisites;
    if (estimatedDuration !== undefined) lesson.estimatedDuration = estimatedDuration;
    if (difficulty) lesson.difficulty = difficulty;
    if (order !== undefined) lesson.order = order;
    if (isFree !== undefined) lesson.isFree = isFree;
    if (allowComments !== undefined) lesson.allowComments = allowComments;
    if (codeBlocks) lesson.codeBlocks = codeBlocks;
    if (videos) lesson.videos = videos;
    if (quizzes) lesson.quizzes = quizzes;
    if (resources) lesson.resources = resources;
    if (interactiveElements) lesson.interactiveElements = interactiveElements;

    lesson.lastModifiedBy = req.user._id;
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Failed to update lesson', error: (error as Error).message });
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id).populate('courseId', 'instructors createdBy');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check permissions
    const course: any = lesson.courseId;
    if (
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove lesson from course section
    const fullCourse = await Course.findById(lesson.courseId);
    if (fullCourse) {
      fullCourse.sections.forEach(section => {
        section.lessons = section.lessons.filter(l => l.toString() !== id);
      });
      await fullCourse.save();
    }

    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Failed to delete lesson', error: (error as Error).message });
  }
};

/**
 * Publish/Unpublish a lesson
 */
export const toggleLessonPublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;

    const lesson = await Lesson.findById(id).populate('courseId', 'instructors createdBy');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check permissions
    const course: any = lesson.courseId;
    if (
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString() &&
      !course.instructors.some((i: any) => i.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    lesson.isPublished = publish;
    lesson.lastModifiedBy = req.user._id;
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Toggle lesson publish error:', error);
    res.status(500).json({ message: 'Failed to toggle lesson publish status', error: (error as Error).message });
  }
};

/**
 * Duplicate a lesson
 */
export const duplicateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, courseId, sectionId } = req.body;

    const originalLesson = await Lesson.findById(id);
    if (!originalLesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const slug = (title || `${originalLesson.title} Copy`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const lessonData = originalLesson.toObject();
    delete lessonData._id;
    delete lessonData.createdAt;
    delete lessonData.updatedAt;

    const newLesson = new Lesson({
      ...lessonData,
      title: title || `${originalLesson.title} Copy`,
      slug,
      courseId: courseId || originalLesson.courseId,
      sectionId: sectionId || originalLesson.sectionId,
      isPublished: false,
      viewCount: 0,
      completionCount: 0,
      likeCount: 0,
      versions: [],
      currentVersion: 1,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await newLesson.save();

    // Create initial version
    await contentVersioningService.createLessonVersion(
      newLesson._id,
      req.user._id,
      `Duplicated from lesson: ${originalLesson.title}`
    );

    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Duplicate lesson error:', error);
    res.status(500).json({ message: 'Failed to duplicate lesson', error: (error as Error).message });
  }
};

/**
 * Reorder lessons
 */
export const reorderLessons = async (req: Request, res: Response) => {
  try {
    const { lessons } = req.body; // Array of { id, order }

    if (!Array.isArray(lessons)) {
      return res.status(400).json({ message: 'Lessons array is required' });
    }

    await Promise.all(
      lessons.map(({ id, order }) =>
        Lesson.findByIdAndUpdate(id, {
          order,
          lastModifiedBy: req.user._id
        })
      )
    );

    res.json({ message: 'Lessons reordered successfully' });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({ message: 'Failed to reorder lessons', error: (error as Error).message });
  }
};

/**
 * Add code block to lesson
 */
export const addCodeBlock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language, code, fileName, highlightLines, showLineNumbers } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.codeBlocks.push({
      language,
      code,
      fileName,
      highlightLines,
      showLineNumbers: showLineNumbers !== false
    });

    lesson.lastModifiedBy = req.user._id;
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Add code block error:', error);
    res.status(500).json({ message: 'Failed to add code block', error: (error as Error).message });
  }
};

/**
 * Add video to lesson
 */
export const addVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { provider, url, thumbnail, duration, chapters, captions, quality } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.videos.push({
      provider,
      url,
      thumbnail,
      duration: duration || 0,
      chapters,
      captions,
      quality
    });

    lesson.lastModifiedBy = req.user._id;
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ message: 'Failed to add video', error: (error as Error).message });
  }
};

/**
 * Add resource to lesson
 */
export const addResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, type, url, size, description } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.resources.push({
      title,
      type,
      url,
      size,
      description
    });

    lesson.lastModifiedBy = req.user._id;
    await lesson.save();

    res.json(lesson);
  } catch (error) {
    console.error('Add resource error:', error);
    res.status(500).json({ message: 'Failed to add resource', error: (error as Error).message });
  }
};

export default {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonPublish,
  duplicateLesson,
  reorderLessons,
  addCodeBlock,
  addVideo,
  addResource
};
