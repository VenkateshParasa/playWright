import { useRef, useEffect, useMemo } from 'react';

/**
 * Image optimization utilities for WebP, lazy loading, and responsive images
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  srcSet?: boolean;
  sizes?: string;
}

/**
 * Generate optimized image URL with parameters
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 85, format = 'webp' } = options;

  // If using a CDN or image optimization service, build the URL
  const url = new URL(src, window.location.origin);
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format) params.set('f', format);

  return params.toString() ? `${url.pathname}?${params.toString()}` : src;
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return widths
    .map((width) => `${getOptimizedImageUrl(src, { width })} ${width}w`)
    .join(', ');
}

/**
 * Lazy image component with intersection observer
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E',
  threshold = 0.01,
  rootMargin = '50px',
  onLoad,
  onError,
  ...props
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const source = img.dataset.src;

            if (source) {
              img.src = source;
              img.removeAttribute('data-src');
              observerRef.current?.unobserve(img);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  return (
    <img
      ref={imgRef}
      data-src={src}
      src={placeholder}
      alt={alt}
      loading="lazy"
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}

/**
 * Progressive image loading with blur effect
 */
interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder: string;
  aspectRatio?: number;
}

export function ProgressiveImage({
  src,
  alt,
  placeholder,
  aspectRatio,
  className = '',
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
    };

    return () => {
      img.onload = null;
    };
  }, [src]);

  const style = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <img
        src={currentSrc}
        alt={alt}
        className={`transition-all duration-300 ${
          loaded ? 'blur-0' : 'blur-md scale-105'
        }`}
        {...props}
      />
    </div>
  );
}

/**
 * WebP support detection
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * AVIF support detection
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * Get best supported image format
 */
export async function getBestImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  const [hasAVIF, hasWebP] = await Promise.all([
    supportsAVIF(),
    supportsWebP()
  ]);

  if (hasAVIF) return 'avif';
  if (hasWebP) return 'webp';
  return 'jpeg';
}

/**
 * Convert image URL to best format
 */
export async function convertToOptimalFormat(src: string): Promise<string> {
  const format = await getBestImageFormat();
  return getOptimizedImageUrl(src, { format });
}

/**
 * Preload critical images
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = src;
        })
    )
  );
}

/**
 * Picture element with multiple sources
 */
interface ResponsivePictureProps {
  src: string;
  alt: string;
  sources: Array<{
    srcSet: string;
    type?: string;
    media?: string;
  }>;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ResponsivePicture({
  src,
  alt,
  sources,
  className = '',
  loading = 'lazy'
}: ResponsivePictureProps) {
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          type={source.type}
          media={source.media}
        />
      ))}
      <img src={src} alt={alt} className={className} loading={loading} />
    </picture>
  );
}

/**
 * Hook for responsive image sources
 */
export function useResponsiveImage(
  src: string,
  breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  }
) {
  return useMemo(() => {
    const sources = Object.entries(breakpoints).map(([name, width]) => ({
      srcSet: generateSrcSet(src, [width]),
      media: `(min-width: ${width}px)`
    }));

    return {
      src: getOptimizedImageUrl(src),
      srcSet: generateSrcSet(src),
      sources
    };
  }, [src, breakpoints]);
}

/**
 * Image compression utility (client-side)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  const ref = useRef({ value: initialValue });
  return [ref.current.value, (newValue: T) => { ref.current.value = newValue; }];
}
