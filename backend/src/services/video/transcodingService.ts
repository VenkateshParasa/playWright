import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { EventEmitter } from 'events';
import Video from '../../models/Video.js';

interface TranscodingProfile {
  name: string;
  resolution: string;
  width: number;
  height: number;
  videoBitrate: string;
  audioBitrate: string;
  fps: number;
  codec: string;
  preset: string;
}

interface TranscodingProgress {
  videoId: string;
  profile: string;
  progress: number;
  fps: number;
  speed: string;
  time: string;
}

class TranscodingService extends EventEmitter {
  private readonly PROCESSED_DIR = process.env.VIDEO_PROCESSED_DIR || './uploads/processed';
  private readonly HLS_DIR = process.env.HLS_DIR || './uploads/hls';
  private readonly DASH_DIR = process.env.DASH_DIR || './uploads/dash';

  // Transcoding profiles for different resolutions
  private readonly PROFILES: TranscodingProfile[] = [
    {
      name: '1080p',
      resolution: '1920x1080',
      width: 1920,
      height: 1080,
      videoBitrate: '5000k',
      audioBitrate: '192k',
      fps: 30,
      codec: 'libx264',
      preset: 'medium',
    },
    {
      name: '720p',
      resolution: '1280x720',
      width: 1280,
      height: 720,
      videoBitrate: '2500k',
      audioBitrate: '128k',
      fps: 30,
      codec: 'libx264',
      preset: 'medium',
    },
    {
      name: '480p',
      resolution: '854x480',
      width: 854,
      height: 480,
      videoBitrate: '1000k',
      audioBitrate: '128k',
      fps: 30,
      codec: 'libx264',
      preset: 'fast',
    },
    {
      name: '360p',
      resolution: '640x360',
      width: 640,
      height: 360,
      videoBitrate: '500k',
      audioBitrate: '96k',
      fps: 30,
      codec: 'libx264',
      preset: 'fast',
    },
  ];

  constructor() {
    super();
    this.initializeDirectories();
  }

  /**
   * Initialize required directories
   */
  private async initializeDirectories(): Promise<void> {
    const dirs = [this.PROCESSED_DIR, this.HLS_DIR, this.DASH_DIR];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  /**
   * Transcode video to multiple resolutions
   */
  async transcodeVideo(
    videoId: string,
    inputPath: string,
    profiles?: string[]
  ): Promise<Array<{ resolution: string; url: string; size: number; bitrate: number; codec: string }>> {
    const results: Array<{
      resolution: string;
      url: string;
      size: number;
      bitrate: number;
      codec: string;
    }> = [];

    // Filter profiles if specified
    const selectedProfiles = profiles
      ? this.PROFILES.filter((p) => profiles.includes(p.name))
      : this.PROFILES;

    let completedCount = 0;
    const totalCount = selectedProfiles.length;

    for (const profile of selectedProfiles) {
      try {
        const outputPath = path.join(
          this.PROCESSED_DIR,
          `${videoId}_${profile.name}.mp4`
        );

        await this.transcodeToProfile(inputPath, outputPath, profile, (progress) => {
          const overallProgress = ((completedCount + progress / 100) / totalCount) * 100;
          this.emit('progress', {
            videoId,
            profile: profile.name,
            progress: overallProgress,
            currentProfile: progress,
          });
        });

        const stats = await fs.stat(outputPath);

        results.push({
          resolution: profile.name,
          url: `/videos/processed/${videoId}_${profile.name}.mp4`,
          size: stats.size,
          bitrate: parseInt(profile.videoBitrate),
          codec: profile.codec,
        });

        completedCount++;
      } catch (error) {
        console.error(`Failed to transcode to ${profile.name}:`, error);
        this.emit('error', { videoId, profile: profile.name, error });
      }
    }

    return results;
  }

  /**
   * Transcode video to a specific profile
   */
  private async transcodeToProfile(
    inputPath: string,
    outputPath: string,
    profile: TranscodingProfile,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i',
        inputPath,
        '-c:v',
        profile.codec,
        '-preset',
        profile.preset,
        '-b:v',
        profile.videoBitrate,
        '-maxrate',
        profile.videoBitrate,
        '-bufsize',
        `${parseInt(profile.videoBitrate) * 2}k`,
        '-vf',
        `scale=${profile.width}:${profile.height}`,
        '-r',
        profile.fps.toString(),
        '-c:a',
        'aac',
        '-b:a',
        profile.audioBitrate,
        '-movflags',
        '+faststart',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      let duration = 0;
      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        errorOutput += output;

        // Extract duration
        const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
        if (durationMatch && duration === 0) {
          duration =
            parseInt(durationMatch[1]) * 3600 +
            parseInt(durationMatch[2]) * 60 +
            parseInt(durationMatch[3]);
        }

        // Extract progress
        const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
        if (timeMatch && duration > 0) {
          const currentTime =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]);
          const progress = (currentTime / duration) * 100;

          if (onProgress) {
            onProgress(Math.min(progress, 100));
          }
        }
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Transcoding failed: ${errorOutput}`));
        } else {
          resolve();
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Generate HLS manifest and segments
   */
  async generateHLS(videoId: string, inputPath: string): Promise<string> {
    const outputDir = path.join(this.HLS_DIR, videoId);
    await fs.mkdir(outputDir, { recursive: true });

    const masterPlaylist = path.join(outputDir, 'master.m3u8');

    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i',
        inputPath,
        // 1080p variant
        '-vf',
        'scale=1920:1080',
        '-c:v',
        'libx264',
        '-b:v',
        '5000k',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        path.join(outputDir, '1080p_%03d.ts'),
        path.join(outputDir, '1080p.m3u8'),
        // 720p variant
        '-vf',
        'scale=1280:720',
        '-c:v',
        'libx264',
        '-b:v',
        '2500k',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        path.join(outputDir, '720p_%03d.ts'),
        path.join(outputDir, '720p.m3u8'),
        // 480p variant
        '-vf',
        'scale=854:480',
        '-c:v',
        'libx264',
        '-b:v',
        '1000k',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        path.join(outputDir, '480p_%03d.ts'),
        path.join(outputDir, '480p.m3u8'),
        // 360p variant
        '-vf',
        'scale=640:360',
        '-c:v',
        'libx264',
        '-b:v',
        '500k',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        path.join(outputDir, '360p_%03d.ts'),
        path.join(outputDir, '360p.m3u8'),
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`HLS generation failed: ${errorOutput}`));
          return;
        }

        // Create master playlist
        const masterContent = this.createHLSMasterPlaylist(videoId);
        await fs.writeFile(masterPlaylist, masterContent);

        resolve(`/hls/${videoId}/master.m3u8`);
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Create HLS master playlist
   */
  private createHLSMasterPlaylist(videoId: string): string {
    return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640x360
360p.m3u8
`;
  }

  /**
   * Generate DASH manifest and segments
   */
  async generateDASH(videoId: string, inputPath: string): Promise<string> {
    const outputDir = path.join(this.DASH_DIR, videoId);
    await fs.mkdir(outputDir, { recursive: true });

    const manifestPath = path.join(outputDir, 'manifest.mpd');

    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-c:a',
        'aac',
        '-b:v:0',
        '5000k',
        '-s:v:0',
        '1920x1080',
        '-b:v:1',
        '2500k',
        '-s:v:1',
        '1280x720',
        '-b:v:2',
        '1000k',
        '-s:v:2',
        '854x480',
        '-b:v:3',
        '500k',
        '-s:v:3',
        '640x360',
        '-use_timeline',
        '1',
        '-use_template',
        '1',
        '-adaptation_sets',
        'id=0,streams=v id=1,streams=a',
        '-f',
        'dash',
        manifestPath,
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`DASH generation failed: ${errorOutput}`));
        } else {
          resolve(`/dash/${videoId}/manifest.mpd`);
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Process video with adaptive bitrate streaming
   */
  async processWithABR(
    videoId: string,
    inputPath: string,
    formats: Array<'hls' | 'dash'> = ['hls', 'dash']
  ): Promise<{ hlsManifest?: string; dashManifest?: string }> {
    const result: { hlsManifest?: string; dashManifest?: string } = {};

    try {
      // Generate HLS
      if (formats.includes('hls')) {
        result.hlsManifest = await this.generateHLS(videoId, inputPath);
        this.emit('hls-complete', { videoId, manifest: result.hlsManifest });
      }

      // Generate DASH
      if (formats.includes('dash')) {
        result.dashManifest = await this.generateDASH(videoId, inputPath);
        this.emit('dash-complete', { videoId, manifest: result.dashManifest });
      }

      return result;
    } catch (error) {
      this.emit('error', { videoId, error });
      throw error;
    }
  }

  /**
   * Optimize video for web streaming
   */
  async optimizeForStreaming(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i',
        inputPath,
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
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
          reject(new Error(`Optimization failed: ${errorOutput}`));
        } else {
          resolve();
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get available transcoding profiles
   */
  getProfiles(): TranscodingProfile[] {
    return this.PROFILES;
  }

  /**
   * Get profile by name
   */
  getProfileByName(name: string): TranscodingProfile | undefined {
    return this.PROFILES.find((p) => p.name === name);
  }
}

export default new TranscodingService();
