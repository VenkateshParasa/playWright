import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import Video, { IVideo } from '../../models/Video.js';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  aspectRatio: string;
}

interface ProcessingOptions {
  generateThumbnails?: boolean;
  thumbnailCount?: number;
  generateSubtitles?: boolean;
  addWatermark?: boolean;
  watermarkConfig?: {
    text?: string;
    imageUrl?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
  enableDRM?: boolean;
  drmProvider?: string;
}

class VideoProcessingService extends EventEmitter {
  private readonly UPLOAD_DIR = process.env.VIDEO_UPLOAD_DIR || './uploads/videos';
  private readonly PROCESSED_DIR = process.env.VIDEO_PROCESSED_DIR || './uploads/processed';
  private readonly THUMBNAIL_DIR = process.env.THUMBNAIL_DIR || './uploads/thumbnails';
  private readonly SUBTITLE_DIR = process.env.SUBTITLE_DIR || './uploads/subtitles';

  constructor() {
    super();
    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  private async initializeDirectories(): Promise<void> {
    const dirs = [this.UPLOAD_DIR, this.PROCESSED_DIR, this.THUMBNAIL_DIR, this.SUBTITLE_DIR];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Extract video metadata using FFprobe
   */
  async extractMetadata(filePath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        filePath,
      ]);

      let output = '';
      let errorOutput = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFprobe failed: ${errorOutput}`));
          return;
        }

        try {
          const data = JSON.parse(output);
          const videoStream = data.streams.find((s: any) => s.codec_type === 'video');

          if (!videoStream) {
            reject(new Error('No video stream found'));
            return;
          }

          const metadata: VideoMetadata = {
            duration: parseFloat(data.format.duration),
            width: videoStream.width,
            height: videoStream.height,
            fps: this.parseFPS(videoStream.r_frame_rate),
            codec: videoStream.codec_name,
            bitrate: parseInt(data.format.bit_rate),
            aspectRatio: `${videoStream.width}:${videoStream.height}`,
          };

          resolve(metadata);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Parse FPS from FFprobe fractional format
   */
  private parseFPS(fpsString: string): number {
    const parts = fpsString.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseFloat(fpsString);
  }

  /**
   * Generate thumbnails at specified intervals
   */
  async generateThumbnails(
    videoId: string,
    filePath: string,
    count: number = 5
  ): Promise<{ url: string; timestamps: number[] }> {
    try {
      const metadata = await this.extractMetadata(filePath);
      const interval = metadata.duration / (count + 1);
      const timestamps: number[] = [];
      const thumbnailPaths: string[] = [];

      for (let i = 1; i <= count; i++) {
        const timestamp = interval * i;
        timestamps.push(timestamp);

        const thumbnailPath = path.join(
          this.THUMBNAIL_DIR,
          `${videoId}_${i}.jpg`
        );

        await this.extractThumbnail(filePath, timestamp, thumbnailPath);
        thumbnailPaths.push(thumbnailPath);
      }

      // Use the middle thumbnail as the main thumbnail
      const mainThumbnailIndex = Math.floor(count / 2);
      const mainThumbnailUrl = `/thumbnails/${videoId}_${mainThumbnailIndex + 1}.jpg`;

      return {
        url: mainThumbnailUrl,
        timestamps,
      };
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      throw error;
    }
  }

  /**
   * Extract a single thumbnail at a specific timestamp
   */
  private async extractThumbnail(
    inputPath: string,
    timestamp: number,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-ss',
        timestamp.toString(),
        '-i',
        inputPath,
        '-vframes',
        '1',
        '-vf',
        'scale=320:-1',
        '-y',
        outputPath,
      ]);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Thumbnail extraction failed: ${errorOutput}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Generate subtitles using speech-to-text
   * This is a placeholder - integrate with services like AWS Transcribe, Google Speech-to-Text, etc.
   */
  async generateSubtitles(
    videoId: string,
    filePath: string,
    language: string = 'en'
  ): Promise<string> {
    try {
      // Extract audio from video
      const audioPath = path.join(this.PROCESSED_DIR, `${videoId}_audio.wav`);
      await this.extractAudio(filePath, audioPath);

      // TODO: Integrate with speech-to-text service
      // For now, return a placeholder
      const subtitlePath = path.join(this.SUBTITLE_DIR, `${videoId}_${language}.vtt`);

      // Placeholder subtitle generation
      await this.createPlaceholderSubtitles(subtitlePath);

      return subtitlePath;
    } catch (error) {
      console.error('Error generating subtitles:', error);
      throw error;
    }
  }

  /**
   * Extract audio track from video
   */
  private async extractAudio(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i',
        inputPath,
        '-vn',
        '-acodec',
        'pcm_s16le',
        '-ar',
        '16000',
        '-ac',
        '1',
        '-y',
        outputPath,
      ]);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Audio extraction failed: ${errorOutput}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create placeholder subtitles
   */
  private async createPlaceholderSubtitles(outputPath: string): Promise<void> {
    const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
Subtitles will be generated automatically.

00:00:05.000 --> 00:00:10.000
This is a placeholder subtitle file.
`;

    await fs.writeFile(outputPath, vttContent, 'utf-8');
  }

  /**
   * Apply watermark to video
   */
  async applyWatermark(
    inputPath: string,
    outputPath: string,
    watermarkConfig: {
      text?: string;
      imageUrl?: string;
      position: string;
      opacity: number;
    }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let filterComplex = '';

      if (watermarkConfig.text) {
        // Text watermark
        const position = this.getWatermarkPosition(watermarkConfig.position);
        filterComplex = `drawtext=text='${watermarkConfig.text}':fontsize=24:fontcolor=white@${watermarkConfig.opacity}:x=${position.x}:y=${position.y}`;
      } else if (watermarkConfig.imageUrl) {
        // Image watermark
        const position = this.getWatermarkPosition(watermarkConfig.position);
        filterComplex = `overlay=${position.x}:${position.y}:format=auto:alpha=${watermarkConfig.opacity}`;
      }

      const ffmpegArgs = [
        '-i',
        inputPath,
        '-vf',
        filterComplex,
        '-codec:a',
        'copy',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Watermarking failed: ${errorOutput}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Calculate watermark position
   */
  private getWatermarkPosition(position: string): { x: string; y: string } {
    const positions: Record<string, { x: string; y: string }> = {
      'top-left': { x: '10', y: '10' },
      'top-right': { x: 'W-w-10', y: '10' },
      'bottom-left': { x: '10', y: 'H-h-10' },
      'bottom-right': { x: 'W-w-10', y: 'H-h-10' },
      center: { x: '(W-w)/2', y: '(H-h)/2' },
    };

    return positions[position] || positions['bottom-right'];
  }

  /**
   * Process video with options
   */
  async processVideo(
    videoId: string,
    filePath: string,
    options: ProcessingOptions = {}
  ): Promise<Partial<IVideo>> {
    try {
      // Update status to processing
      await Video.findByIdAndUpdate(videoId, {
        status: 'processing',
        processingProgress: 0,
      });

      const result: Partial<IVideo> = {};

      // Extract metadata
      const metadata = await this.extractMetadata(filePath);
      result.metadata = metadata;

      this.emit('progress', { videoId, progress: 10 });

      // Generate thumbnails
      if (options.generateThumbnails !== false) {
        const thumbnails = await this.generateThumbnails(
          videoId,
          filePath,
          options.thumbnailCount || 5
        );
        result.thumbnail = thumbnails;
      }

      this.emit('progress', { videoId, progress: 30 });

      // Generate subtitles
      if (options.generateSubtitles) {
        const subtitlePath = await this.generateSubtitles(videoId, filePath);
        result.subtitles = [
          {
            language: 'en',
            url: `/subtitles/${path.basename(subtitlePath)}`,
            autoGenerated: true,
          },
        ];
      }

      this.emit('progress', { videoId, progress: 50 });

      // Apply watermark
      if (options.addWatermark && options.watermarkConfig) {
        const watermarkedPath = path.join(
          this.PROCESSED_DIR,
          `${videoId}_watermarked.mp4`
        );
        await this.applyWatermark(filePath, watermarkedPath, options.watermarkConfig);
      }

      this.emit('progress', { videoId, progress: 70 });

      // Update video status
      await Video.findByIdAndUpdate(videoId, {
        ...result,
        status: 'ready',
        processingProgress: 100,
      });

      this.emit('complete', { videoId });

      return result;
    } catch (error) {
      await Video.findByIdAndUpdate(videoId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      this.emit('error', { videoId, error });
      throw error;
    }
  }

  /**
   * Delete video files
   */
  async deleteVideoFiles(videoId: string): Promise<void> {
    try {
      const patterns = [
        path.join(this.UPLOAD_DIR, `${videoId}*`),
        path.join(this.PROCESSED_DIR, `${videoId}*`),
        path.join(this.THUMBNAIL_DIR, `${videoId}*`),
        path.join(this.SUBTITLE_DIR, `${videoId}*`),
      ];

      for (const pattern of patterns) {
        // Delete matching files
        const dir = path.dirname(pattern);
        const prefix = path.basename(pattern).replace('*', '');

        try {
          const files = await fs.readdir(dir);
          for (const file of files) {
            if (file.startsWith(prefix)) {
              await fs.unlink(path.join(dir, file));
            }
          }
        } catch (error) {
          // Directory might not exist, ignore
        }
      }
    } catch (error) {
      console.error('Error deleting video files:', error);
      throw error;
    }
  }

  /**
   * Get processing progress for a video
   */
  async getProcessingProgress(videoId: string): Promise<number> {
    const video = await Video.findById(videoId);
    return video?.processingProgress || 0;
  }
}

export default new VideoProcessingService();
