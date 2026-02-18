import { Request, Response } from 'express';
import Video from '../../models/Video.js';
import VideoProgress from '../../models/VideoProgress.js';
import processingService from '../../services/video/processingService.js';
import transcodingService from '../../services/video/transcodingService.js';
import streamingService from '../../services/video/streamingService.js';

/**
 * Upload and create a new video
 */
export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, courseId, lessonId, isPremium, tags, category } = req.body;
    const userId = (req as any).user.id;

    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    // Extract metadata
    const metadata = await processingService.extractMetadata(req.file.path);

    // Create video record
    const video = new Video({
      title,
      description,
      courseId,
      lessonId,
      uploadedBy: userId,
      originalFile: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/videos/${req.file.filename}`,
        duration: metadata.duration,
      },
      metadata,
      status: 'processing',
      isPremium: isPremium || false,
      tags: tags ? tags.split(',') : [],
      category: category || '',
    });

    await video.save();

    // Start processing in background
    processingService
      .processVideo(video._id.toString(), req.file.path, {
        generateThumbnails: true,
        thumbnailCount: 5,
        generateSubtitles: true,
      })
      .catch((error) => {
        console.error('Video processing error:', error);
      });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        status: video.status,
      },
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

/**
 * Get video details
 */
export const getVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const video = await Video.findById(id).populate('uploadedBy', 'name email');

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Get user progress if authenticated
    let progress = null;
    if (userId) {
      progress = await streamingService.getProgress(userId, id);
    }

    res.json({
      video,
      progress,
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
};

/**
 * Get streaming URLs for video
 */
export const getStreamingUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { quality } = req.query;

    const urls = await streamingService.getStreamingUrls(
      id,
      userId,
      quality as string | undefined
    );

    res.json(urls);
  } catch (error) {
    console.error('Get streaming URLs error:', error);
    res.status(500).json({ error: 'Failed to get streaming URLs' });
  }
};

/**
 * Start video session
 */
export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { quality } = req.body;

    const sessionId = await streamingService.startSession(id, userId, quality);

    res.json({ sessionId });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

/**
 * Update session progress
 */
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { currentPosition, watchedRanges } = req.body;

    await streamingService.updateProgress(sessionId, currentPosition, watchedRanges);

    res.json({ message: 'Progress updated' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

/**
 * End video session
 */
export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const analytics = await streamingService.endSession(sessionId);

    res.json({ analytics });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
};

/**
 * Get video progress
 */
export const getProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const progress = await streamingService.getProgress(userId, id);

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
};

/**
 * Add bookmark
 */
export const addBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { timestamp, note } = req.body;

    await streamingService.addBookmark(userId, id, timestamp, note);

    res.json({ message: 'Bookmark added' });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

/**
 * Remove bookmark
 */
export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, timestamp } = req.params;
    const userId = (req as any).user.id;

    await streamingService.removeBookmark(userId, id, parseFloat(timestamp));

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};

/**
 * Add note
 */
export const addNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { timestamp, content } = req.body;

    await streamingService.addNote(userId, id, timestamp, content);

    res.json({ message: 'Note added' });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

/**
 * Remove note
 */
export const removeNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, timestamp } = req.params;
    const userId = (req as any).user.id;

    await streamingService.removeNote(userId, id, parseFloat(timestamp));

    res.json({ message: 'Note removed' });
  } catch (error) {
    console.error('Remove note error:', error);
    res.status(500).json({ error: 'Failed to remove note' });
  }
};

/**
 * Update playback settings
 */
export const updatePlaybackSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const settings = req.body;

    await streamingService.updatePlaybackSettings(userId, id, settings);

    res.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

/**
 * Get engagement heatmap
 */
export const getEngagementHeatmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const heatmap = await streamingService.getEngagementHeatmap(id);

    res.json({ heatmap });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ error: 'Failed to get heatmap' });
  }
};

/**
 * Transcode video
 */
export const transcodeVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { profiles } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Start transcoding
    const processedFiles = await transcodingService.transcodeVideo(
      id,
      video.originalFile.url,
      profiles
    );

    // Update video record
    video.processedFiles = processedFiles as any;
    await video.save();

    res.json({ message: 'Transcoding complete', processedFiles });
  } catch (error) {
    console.error('Transcode error:', error);
    res.status(500).json({ error: 'Failed to transcode video' });
  }
};

/**
 * Generate adaptive bitrate streaming
 */
export const generateABR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { formats } = req.body;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const result = await transcodingService.processWithABR(id, video.originalFile.url, formats);

    // Update video record
    if (result.hlsManifest) {
      video.hlsManifest = result.hlsManifest;
    }
    if (result.dashManifest) {
      video.dashManifest = result.dashManifest;
    }

    await video.save();

    res.json({ message: 'ABR generation complete', result });
  } catch (error) {
    console.error('Generate ABR error:', error);
    res.status(500).json({ error: 'Failed to generate ABR' });
  }
};

/**
 * Update video details
 */
export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Check permission
    if (video.uploadedBy.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Update allowed fields
    const allowedFields = [
      'title',
      'description',
      'tags',
      'category',
      'isPublished',
      'isPremium',
      'chapters',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (video as any)[field] = updates[field];
      }
    }

    if (updates.isPublished && !video.publishedAt) {
      video.publishedAt = new Date();
    }

    await video.save();

    res.json({ message: 'Video updated', video });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
};

/**
 * Delete video
 */
export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Check permission
    if (video.uploadedBy.toString() !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Delete files
    await processingService.deleteVideoFiles(id);

    // Delete database record
    await Video.findByIdAndDelete(id);

    // Delete progress records
    await VideoProgress.deleteMany({ videoId: id });

    res.json({ message: 'Video deleted' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

/**
 * List videos
 */
export const listVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, courseId, category, tag, search } = req.query;

    const query: any = { isPublished: true };

    if (courseId) {
      query.courseId = courseId;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('uploadedBy', 'name email'),
      Video.countDocuments(query),
    ]);

    res.json({
      videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({ error: 'Failed to list videos' });
  }
};

/**
 * Get video analytics
 */
export const getVideoAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Get detailed analytics
    const progressRecords = await VideoProgress.find({ videoId: id });

    const analytics = {
      ...video.analytics,
      totalViewers: progressRecords.length,
      activeViewers: await streamingService.getActiveSessionsForVideo(id).length,
      dropOffPoints: [], // TODO: Calculate drop-off points
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};
