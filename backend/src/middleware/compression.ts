import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

/**
 * Compression middleware configuration
 * Supports both gzip and brotli compression
 */

/**
 * Configure compression middleware with optimized settings
 */
export function setupCompression() {
  return compression({
    // Compression level (0-9)
    // Higher = better compression but slower
    level: 6,

    // Only compress responses above this threshold (in bytes)
    threshold: 1024,

    // Filter function to determine if response should be compressed
    filter: (req: Request, res: Response) => {
      // Don't compress if client doesn't accept encoding
      if (req.headers['x-no-compression']) {
        return false;
      }

      // Use compression filter
      return compression.filter(req, res);
    },

    // Memory level (1-9)
    // Higher = more memory but better compression
    memLevel: 8,

    // Window bits for gzip
    windowBits: 15,

    // Strategy for compression algorithm
    strategy: 0 // Default strategy
  });
}

/**
 * Brotli compression middleware (for modern browsers)
 */
export function brotliCompression() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if client supports brotli
    const acceptEncoding = req.headers['accept-encoding'] || '';

    if (!acceptEncoding.includes('br')) {
      return next();
    }

    // Skip if response is too small
    const contentLength = res.getHeader('content-length');
    if (contentLength && parseInt(contentLength as string) < 1024) {
      return next();
    }

    // Skip if already compressed
    if (res.getHeader('content-encoding')) {
      return next();
    }

    // Use brotli compression
    const zlib = require('zlib');
    const stream = zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4, // 0-11, higher = better compression
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 0
      }
    });

    // Store original methods
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    // Set headers
    res.setHeader('Content-Encoding', 'br');
    res.removeHeader('Content-Length');

    // Override write method
    res.write = function (chunk: any, ...args: any[]) {
      return stream.write(chunk, ...args);
    };

    // Override end method
    res.end = function (chunk?: any, ...args: any[]) {
      if (chunk) {
        stream.write(chunk);
      }
      return stream.end();
    };

    // Pipe compressed stream to response
    stream.pipe(res as any);

    next();
  };
}

/**
 * Smart compression that chooses best algorithm
 */
export function smartCompression() {
  return (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';

    // Prefer brotli for modern browsers
    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
    } else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
    } else if (acceptEncoding.includes('deflate')) {
      res.setHeader('Content-Encoding', 'deflate');
    }

    next();
  };
}

/**
 * Compression for specific content types
 */
export function compressContentType(contentTypes: string[]) {
  return compression({
    filter: (req: Request, res: Response) => {
      const contentType = res.getHeader('content-type') as string;

      if (!contentType) {
        return false;
      }

      return contentTypes.some((type) =>
        contentType.toLowerCase().includes(type.toLowerCase())
      );
    }
  });
}

/**
 * Compress JSON responses
 */
export function compressJSON() {
  return compressContentType(['application/json']);
}

/**
 * Compress HTML responses
 */
export function compressHTML() {
  return compressContentType(['text/html']);
}

/**
 * Compress text responses
 */
export function compressText() {
  return compressContentType(['text/plain', 'text/css', 'text/javascript']);
}

/**
 * Dynamic compression based on response size and type
 */
export function dynamicCompression() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      const bodyString = JSON.stringify(body);
      const bodySize = Buffer.byteLength(bodyString);

      // Only compress if above threshold
      if (bodySize > 1024) {
        res.setHeader('Content-Type', 'application/json');

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const zlib = require('zlib');

        if (acceptEncoding.includes('br')) {
          const compressed = zlib.brotliCompressSync(bodyString, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 4
            }
          });
          res.setHeader('Content-Encoding', 'br');
          return res.send(compressed);
        } else if (acceptEncoding.includes('gzip')) {
          const compressed = zlib.gzipSync(bodyString, { level: 6 });
          res.setHeader('Content-Encoding', 'gzip');
          return res.send(compressed);
        }
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Pre-compress static assets at build time
 */
export function servePrecompressed() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const path = req.path;

    // Check for pre-compressed files
    if (acceptEncoding.includes('br')) {
      const fs = require('fs').promises;
      const brPath = `${path}.br`;

      try {
        await fs.access(brPath);
        res.setHeader('Content-Encoding', 'br');
        return res.sendFile(brPath);
      } catch (e) {
        // File doesn't exist, continue
      }
    } else if (acceptEncoding.includes('gzip')) {
      const fs = require('fs').promises;
      const gzPath = `${path}.gz`;

      try {
        await fs.access(gzPath);
        res.setHeader('Content-Encoding', 'gzip');
        return res.sendFile(gzPath);
      } catch (e) {
        // File doesn't exist, continue
      }
    }

    next();
  };
}

/**
 * Compression statistics
 */
export class CompressionStats {
  private totalOriginalSize = 0;
  private totalCompressedSize = 0;
  private requestCount = 0;

  record(originalSize: number, compressedSize: number) {
    this.totalOriginalSize += originalSize;
    this.totalCompressedSize += compressedSize;
    this.requestCount++;
  }

  getStats() {
    const compressionRatio =
      this.totalOriginalSize > 0
        ? ((this.totalOriginalSize - this.totalCompressedSize) /
            this.totalOriginalSize) *
          100
        : 0;

    return {
      totalOriginalSize: this.totalOriginalSize,
      totalCompressedSize: this.totalCompressedSize,
      compressionRatio: compressionRatio.toFixed(2) + '%',
      requestCount: this.requestCount,
      averageOriginalSize: Math.round(this.totalOriginalSize / this.requestCount),
      averageCompressedSize: Math.round(this.totalCompressedSize / this.requestCount)
    };
  }

  reset() {
    this.totalOriginalSize = 0;
    this.totalCompressedSize = 0;
    this.requestCount = 0;
  }
}

/**
 * Compression monitoring middleware
 */
export function compressionMonitoring(stats: CompressionStats) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalEnd = res.end.bind(res);

    res.end = function (chunk?: any, ...args: any[]) {
      const originalSize = chunk ? Buffer.byteLength(chunk) : 0;
      const encoding = res.getHeader('content-encoding');

      if (encoding && originalSize > 0) {
        const contentLength = res.getHeader('content-length');
        const compressedSize = contentLength
          ? parseInt(contentLength as string)
          : originalSize;

        stats.record(originalSize, compressedSize);
      }

      return originalEnd(chunk, ...args);
    };

    next();
  };
}

/**
 * Get compression stats endpoint
 */
export function getCompressionStats(stats: CompressionStats) {
  return (req: Request, res: Response) => {
    res.json(stats.getStats());
  };
}

export default setupCompression;
