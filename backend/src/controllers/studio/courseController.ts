import { Request, Response } from 'express';
import Course from '../../models/Course.js';
import Lesson from '../../models/Lesson.js';
import contentVersioningService from '../../services/contentVersioning.js';
import mongoose from 'mongoose';

/**
 * Get all courses (with filters)
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      level,
      instructor,
      search,
      isTemplate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructors = instructor;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // For non-admins, only show their courses
    if (req.user && !req.user.roles?.includes('admin')) {
      query.$or = [
        { createdBy: req.user._id },
        { instructors: req.user._id }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('instructors', 'name email avatar')
        .populate('createdBy', 'name email')
        .lean(),
      Course.countDocuments(query)
    ]);

    res.json({
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: (error as Error).message });
  }
};

/**
 * Get single course by ID
 */
export const getCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructors', 'name email avatar bio')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate({
        path: 'sections.lessons',
        select: 'title slug description duration difficulty isPublished order'
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (
      !course.isPublished &&
      req.user &&
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString() &&
      !course.instructors.some(i => i.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Failed to fetch course', error: (error as Error).message });
  }
};

/**
 * Create a new course
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      thumbnail,
      category,
      tags,
      level,
      language,
      objectives,
      prerequisites,
      price,
      currency,
      isPremium,
      certificateEnabled,
      allowDiscussions,
      allowReviews,
      isTemplate,
      templateCategory
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return res.status(400).json({ message: 'A course with this title already exists' });
    }

    const course = new Course({
      title,
      slug,
      description,
      thumbnail,
      instructors: [req.user._id],
      category,
      tags: tags || [],
      level: level || 'beginner',
      language: language || 'en',
      objectives: objectives || [],
      prerequisites: prerequisites || [],
      price: price || 0,
      currency: currency || 'USD',
      isPremium: isPremium || false,
      certificateEnabled: certificateEnabled || false,
      allowDiscussions: allowDiscussions !== false,
      allowReviews: allowReviews !== false,
      isTemplate: isTemplate || false,
      templateCategory,
      sections: [],
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await course.save();

    // Create initial version
    await contentVersioningService.createCourseVersion(
      course._id,
      req.user._id,
      'Initial version'
    );

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Failed to create course', error: (error as Error).message });
  }
};

/**
 * Update a course
 */
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      category,
      tags,
      level,
      language,
      objectives,
      prerequisites,
      price,
      currency,
      isPremium,
      certificateEnabled,
      allowDiscussions,
      allowReviews,
      sections,
      createVersion,
      versionChangeLog
    } = req.body;

    const course = await Course.findById(id);
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

    // Create version before updating if requested
    if (createVersion) {
      await contentVersioningService.createCourseVersion(
        course._id,
        req.user._id,
        versionChangeLog || 'Manual version creation'
      );
    }

    // Update fields
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (category) course.category = category;
    if (tags) course.tags = tags;
    if (level) course.level = level;
    if (language) course.language = language;
    if (objectives) course.objectives = objectives;
    if (prerequisites) course.prerequisites = prerequisites;
    if (price !== undefined) course.price = price;
    if (currency) course.currency = currency;
    if (isPremium !== undefined) course.isPremium = isPremium;
    if (certificateEnabled !== undefined) course.certificateEnabled = certificateEnabled;
    if (allowDiscussions !== undefined) course.allowDiscussions = allowDiscussions;
    if (allowReviews !== undefined) course.allowReviews = allowReviews;
    if (sections) course.sections = sections;

    course.lastModifiedBy = req.user._id;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Failed to update course', error: (error as Error).message });
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (!req.user.roles?.includes('admin') && course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deletion of published courses with enrollments
    if (course.isPublished && course.enrollmentCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete a published course with enrollments. Archive it instead.'
      });
    }

    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course', error: (error as Error).message });
  }
};

/**
 * Update course structure (sections and lessons)
 */
export const updateCourseStructure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;

    const course = await Course.findById(id);
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

    // Create version before updating structure
    await contentVersioningService.createCourseVersion(
      course._id,
      req.user._id,
      'Course structure update'
    );

    course.sections = sections;
    course.lastModifiedBy = req.user._id;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Update course structure error:', error);
    res.status(500).json({ message: 'Failed to update course structure', error: (error as Error).message });
  }
};

/**
 * Publish/Unpublish a course
 */
export const toggleCoursePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (
      !req.user.roles?.includes('admin') &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate course has content before publishing
    if (publish && course.sections.length === 0) {
      return res.status(400).json({ message: 'Cannot publish a course without sections' });
    }

    course.isPublished = publish;
    course.isDraft = !publish;
    course.status = publish ? 'published' : 'draft';

    if (publish && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    course.lastModifiedBy = req.user._id;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Toggle course publish error:', error);
    res.status(500).json({ message: 'Failed to toggle course publish status', error: (error as Error).message });
  }
};

/**
 * Duplicate a course
 */
export const duplicateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const originalCourse = await Course.findById(id);
    if (!originalCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Generate new slug
    const slug = (title || `${originalCourse.title} Copy`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const courseData = originalCourse.toObject();
    delete courseData._id;
    delete courseData.createdAt;
    delete courseData.updatedAt;

    const newCourse = new Course({
      ...courseData,
      title: title || `${originalCourse.title} Copy`,
      slug,
      isPublished: false,
      isDraft: true,
      status: 'draft',
      publishedAt: undefined,
      enrollmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
      completionCount: 0,
      versions: [],
      currentVersion: 1,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      instructors: [req.user._id]
    });

    await newCourse.save();

    // Create initial version
    await contentVersioningService.createCourseVersion(
      newCourse._id,
      req.user._id,
      `Duplicated from course: ${originalCourse.title}`
    );

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Duplicate course error:', error);
    res.status(500).json({ message: 'Failed to duplicate course', error: (error as Error).message });
  }
};

/**
 * Get course templates
 */
export const getCourseTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const query: any = { isTemplate: true };
    if (category) {
      query.templateCategory = category;
    }

    const templates = await Course.find(query)
      .select('title description thumbnail templateCategory level estimatedDuration')
      .lean();

    res.json(templates);
  } catch (error) {
    console.error('Get course templates error:', error);
    res.status(500).json({ message: 'Failed to fetch course templates', error: (error as Error).message });
  }
};

/**
 * Create course from template
 */
export const createFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { title, customizations } = req.body;

    const template = await Course.findById(templateId);
    if (!template || !template.isTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const templateData = template.toObject();
    delete templateData._id;
    delete templateData.createdAt;
    delete templateData.updatedAt;

    const newCourse = new Course({
      ...templateData,
      ...customizations,
      title,
      slug,
      isTemplate: false,
      templateCategory: undefined,
      isPublished: false,
      isDraft: true,
      status: 'draft',
      enrollmentCount: 0,
      averageRating: 0,
      reviewCount: 0,
      completionCount: 0,
      versions: [],
      currentVersion: 1,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      instructors: [req.user._id]
    });

    await newCourse.save();

    // Create initial version
    await contentVersioningService.createCourseVersion(
      newCourse._id,
      req.user._id,
      `Created from template: ${template.title}`
    );

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Create from template error:', error);
    res.status(500).json({ message: 'Failed to create course from template', error: (error as Error).message });
  }
};

/**
 * Get course statistics
 */
export const getCourseStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Calculate additional statistics
    const lessonCount = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const publishedSections = course.sections.filter(s => s.isPublished).length;

    const stats = {
      enrollmentCount: course.enrollmentCount,
      completionCount: course.completionCount,
      averageRating: course.averageRating,
      reviewCount: course.reviewCount,
      sectionCount: course.sections.length,
      publishedSections,
      lessonCount,
      estimatedDuration: course.estimatedDuration,
      completionRate: course.enrollmentCount > 0
        ? ((course.completionCount / course.enrollmentCount) * 100).toFixed(2)
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Failed to fetch course statistics', error: (error as Error).message });
  }
};
