import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import useAdminContentStore from '../../stores/adminContentStore';

interface MediaUploaderProps {
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUploadComplete?: (urls: string[]) => void;
  multiple?: boolean;
}

interface FileWithPreview {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  url?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  accept = 'image/*,video/*',
  maxSize = 10, // 10MB default
  maxFiles = 10,
  onUploadComplete,
  multiple = true,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    const fileType = file.type;
    const isAccepted = acceptedTypes.some((type) => {
      if (type === '*/*') return true;
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return fileType === type;
    });

    if (!isAccepted) {
      return 'File type not accepted';
    }

    return null;
  };

  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const uploadFile = async (
    fileWithPreview: FileWithPreview,
    index: number
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', fileWithPreview.file);

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'uploading' as const } : f
        )
      );

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress } : f))
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? {
                    ...f,
                    status: 'complete' as const,
                    progress: 100,
                    url: response.url,
                  }
                : f
            )
          );
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  status: 'error' as const,
                  error: 'Upload failed',
                }
              : f
          )
        );
      });

      xhr.open('POST', '/api/admin/media/upload');
      xhr.send(formData);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: 'error' as const,
                error:
                  error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate and prepare files
      const validFiles: FileWithPreview[] = [];
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          alert(`${file.name}: ${error}`);
          continue;
        }

        const preview = await generatePreview(file);
        validFiles.push({
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      }

      // Add files to state
      setFiles((prev) => [...prev, ...validFiles]);

      // Start uploading
      const startIndex = files.length;
      validFiles.forEach((file, index) => {
        uploadFile(file, startIndex + index);
      });
    },
    [files.length, maxFiles]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadComplete = () => {
    const urls = files
      .filter((f) => f.status === 'complete' && f.url)
      .map((f) => f.url!);
    onUploadComplete?.(urls);
  };

  const allComplete = files.length > 0 && files.every((f) => f.status === 'complete');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            {dragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {accept.includes('image') && 'Images'}
            {accept.includes('video') && ' Videos'} up to {maxSize}MB
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Maximum {maxFiles} files
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploaded Files ({files.length})
            </h3>
            {allComplete && onUploadComplete && (
              <button
                onClick={handleUploadComplete}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Use These Files
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((fileWithPreview, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
                  {fileWithPreview.preview ? (
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : fileWithPreview.file.type.startsWith('image/') ? (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  ) : (
                    <File className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {fileWithPreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(fileWithPreview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* Progress Bar */}
                  {fileWithPreview.status === 'uploading' && (
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${fileWithPreview.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {fileWithPreview.status === 'error' && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {fileWithPreview.error}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {fileWithPreview.status === 'complete' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {fileWithPreview.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {fileWithPreview.status === 'uploading' && (
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {fileWithPreview.progress}%
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
