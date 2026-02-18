import mongoose from 'mongoose';
import Course, { ICourse, ICourseVersion } from '../models/Course.js';
import Lesson, { ILesson, ILessonVersion } from '../models/Lesson.js';
import Asset, { IAsset, IAssetVersion } from '../models/Asset.js';

export interface VersionDiff {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
}

export interface VersionHistory {
  version: number;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  changeLog?: string;
  changes: VersionDiff[];
}

class ContentVersioningService {
  /**
   * Create a new version of a course
   */
  async createCourseVersion(
    courseId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId,
    changeLog?: string
  ): Promise<ICourseVersion> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const newVersion = course.createVersion(userId, changeLog);
    course.lastModifiedBy = userId;
    await course.save();

    return newVersion;
  }

  /**
   * Restore a course to a previous version
   */
  async restoreCourseVersion(
    courseId: mongoose.Types.ObjectId | string,
    version: number,
    userId: mongoose.Types.ObjectId
  ): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Create a backup of current state before restoring
    await this.createCourseVersion(courseId, userId, `Backup before restoring to version ${version}`);

    course.restoreVersion(version);
    course.lastModifiedBy = userId;
    await course.save();

    return course;
  }

  /**
   * Get version history for a course
   */
  async getCourseVersionHistory(courseId: mongoose.Types.ObjectId | string): Promise<VersionHistory[]> {
    const course = await Course.findById(courseId).populate('versions.createdBy', 'name email');
    if (!course) {
      throw new Error('Course not found');
    }

    return course.versions.map((v, index) => {
      const previous = index > 0 ? course.versions[index - 1] : null;
      const changes = previous ? this.calculateDiff(previous, v) : [];

      return {
        version: v.version,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        changeLog: v.changeLog,
        changes
      };
    });
  }

  /**
   * Create a new version of a lesson
   */
  async createLessonVersion(
    lessonId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId,
    changeLog?: string
  ): Promise<ILessonVersion> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const newVersion = lesson.createVersion(userId, changeLog);
    lesson.lastModifiedBy = userId;
    await lesson.save();

    return newVersion;
  }

  /**
   * Restore a lesson to a previous version
   */
  async restoreLessonVersion(
    lessonId: mongoose.Types.ObjectId | string,
    version: number,
    userId: mongoose.Types.ObjectId
  ): Promise<ILesson> {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Create a backup of current state before restoring
    await this.createLessonVersion(lessonId, userId, `Backup before restoring to version ${version}`);

    lesson.restoreVersion(version);
    lesson.lastModifiedBy = userId;
    await lesson.save();

    return lesson;
  }

  /**
   * Get version history for a lesson
   */
  async getLessonVersionHistory(lessonId: mongoose.Types.ObjectId | string): Promise<VersionHistory[]> {
    const lesson = await Lesson.findById(lessonId).populate('versions.createdBy', 'name email');
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return lesson.versions.map((v, index) => {
      const previous = index > 0 ? lesson.versions[index - 1] : null;
      const changes = previous ? this.calculateDiff({ content: previous.content }, { content: v.content }) : [];

      return {
        version: v.version,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        changeLog: v.changeLog,
        changes
      };
    });
  }

  /**
   * Create a new version of an asset
   */
  async createAssetVersion(
    assetId: mongoose.Types.ObjectId | string,
    url: string,
    size: number,
    userId: mongoose.Types.ObjectId,
    changeLog?: string
  ): Promise<IAssetVersion> {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }

    const newVersion = asset.createVersion(url, size, userId, changeLog);
    asset.lastModifiedBy = userId;
    await asset.save();

    return newVersion;
  }

  /**
   * Compare two versions and calculate differences
   */
  private calculateDiff(oldVersion: any, newVersion: any): VersionDiff[] {
    const diffs: VersionDiff[] = [];
    const allKeys = new Set([
      ...Object.keys(oldVersion),
      ...Object.keys(newVersion)
    ]);

    for (const key of allKeys) {
      if (key === '_id' || key === 'version' || key === 'createdAt' || key === 'createdBy') {
        continue;
      }

      const oldValue = oldVersion[key];
      const newValue = newVersion[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        let type: 'added' | 'removed' | 'modified' = 'modified';

        if (oldValue === undefined) {
          type = 'added';
        } else if (newValue === undefined) {
          type = 'removed';
        }

        diffs.push({
          field: key,
          oldValue,
          newValue,
          type
        });
      }
    }

    return diffs;
  }

  /**
   * Compare two specific versions
   */
  async compareVersions(
    contentType: 'course' | 'lesson' | 'asset',
    contentId: mongoose.Types.ObjectId | string,
    version1: number,
    version2: number
  ): Promise<VersionDiff[]> {
    let content: ICourse | ILesson | IAsset | null = null;

    switch (contentType) {
      case 'course':
        content = await Course.findById(contentId);
        break;
      case 'lesson':
        content = await Lesson.findById(contentId);
        break;
      case 'asset':
        content = await Asset.findById(contentId);
        break;
    }

    if (!content) {
      throw new Error(`${contentType} not found`);
    }

    const v1 = content.versions.find(v => v.version === version1);
    const v2 = content.versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }

    return this.calculateDiff(v1, v2);
  }

  /**
   * Delete old versions (keep last N versions)
   */
  async cleanupOldVersions(
    contentType: 'course' | 'lesson' | 'asset',
    contentId: mongoose.Types.ObjectId | string,
    keepCount: number = 10
  ): Promise<number> {
    let content: ICourse | ILesson | IAsset | null = null;

    switch (contentType) {
      case 'course':
        content = await Course.findById(contentId);
        break;
      case 'lesson':
        content = await Lesson.findById(contentId);
        break;
      case 'asset':
        content = await Asset.findById(contentId);
        break;
    }

    if (!content) {
      throw new Error(`${contentType} not found`);
    }

    const versionCount = content.versions.length;
    if (versionCount <= keepCount) {
      return 0;
    }

    const toDelete = versionCount - keepCount;
    content.versions = content.versions.slice(-keepCount);
    await content.save();

    return toDelete;
  }

  /**
   * Get version details
   */
  async getVersionDetails(
    contentType: 'course' | 'lesson' | 'asset',
    contentId: mongoose.Types.ObjectId | string,
    version: number
  ): Promise<any> {
    let content: ICourse | ILesson | IAsset | null = null;

    switch (contentType) {
      case 'course':
        content = await Course.findById(contentId).populate('versions.createdBy', 'name email');
        break;
      case 'lesson':
        content = await Lesson.findById(contentId).populate('versions.createdBy', 'name email');
        break;
      case 'asset':
        content = await Asset.findById(contentId).populate('versions.createdBy', 'name email');
        break;
    }

    if (!content) {
      throw new Error(`${contentType} not found`);
    }

    const versionData = content.versions.find(v => v.version === version);
    if (!versionData) {
      throw new Error(`Version ${version} not found`);
    }

    return versionData;
  }

  /**
   * Bulk create versions for multiple items
   */
  async bulkCreateVersions(
    items: Array<{
      type: 'course' | 'lesson' | 'asset';
      id: mongoose.Types.ObjectId | string;
    }>,
    userId: mongoose.Types.ObjectId,
    changeLog?: string
  ): Promise<any[]> {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        switch (item.type) {
          case 'course':
            return this.createCourseVersion(item.id, userId, changeLog);
          case 'lesson':
            return this.createLessonVersion(item.id, userId, changeLog);
          case 'asset':
            throw new Error('Asset versioning requires url and size parameters');
          default:
            throw new Error(`Unknown content type: ${item.type}`);
        }
      })
    );

    return results.map((result, index) => ({
      type: items[index].type,
      id: items[index].id,
      status: result.status,
      version: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }
}

export default new ContentVersioningService();
