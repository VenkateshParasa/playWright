import React, { useState, useEffect } from 'react';
import {
  Upload, Folder, Tag, Search, Grid, List,
  Image as ImageIcon, Video, FileText, Trash2, Edit2, Download
} from 'lucide-react';

interface Asset {
  _id: string;
  title: string;
  fileName: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  size: number;
  folder: string;
  tags: string[];
  thumbnail?: string;
  createdAt: string;
}

const AssetLibrary: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadAssets();
    loadFolders();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, selectedFolder, searchQuery]);

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/studio/assets?limit=100', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/studio/assets/folders', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFolders(data.map((f: any) => f.name));
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    if (selectedFolder !== 'all') {
      filtered = filtered.filter(a => a.folder === selectedFolder);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredAssets(filtered);
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('folder', selectedFolder === 'all' ? 'root' : selectedFolder);

        const response = await fetch('/api/studio/assets/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (response.ok) {
          await loadAssets();
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setShowUploadModal(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/studio/assets/${assetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setAssets(prev => prev.filter(a => a._id !== assetId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedAssets.size} selected assets?`)) return;

    try {
      const response = await fetch('/api/studio/assets/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assetIds: Array.from(selectedAssets) })
      });

      if (response.ok) {
        setAssets(prev => prev.filter(a => !selectedAssets.has(a._id)));
        setSelectedAssets(new Set());
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={20} />;
      case 'video': return <Video size={20} />;
      case 'document': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Asset Library</h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                <Upload size={18} />
                Upload
              </button>

              {selectedAssets.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  <Trash2 size={18} />
                  Delete ({selectedAssets.size})
                </button>
              )}

              <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Folders</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedFolder('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    selectedFolder === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Folder size={16} />
                  All Files
                </button>
                {folders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                      selectedFolder === folder ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Folder size={16} />
                    {folder}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Assets:</span>
                  <span className="font-medium">{assets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Size:</span>
                  <span className="font-medium">
                    {formatFileSize(assets.reduce((sum, a) => sum + a.size, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assets Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {filteredAssets.map(asset => (
                  <div
                    key={asset._id}
                    className={`bg-white rounded-lg border-2 p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedAssets.has(asset._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      const newSelected = new Set(selectedAssets);
                      if (newSelected.has(asset._id)) {
                        newSelected.delete(asset._id);
                      } else {
                        newSelected.add(asset._id);
                      }
                      setSelectedAssets(newSelected);
                    }}
                  >
                    {asset.type === 'image' ? (
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                        {getAssetIcon(asset.type)}
                      </div>
                    )}
                    <h4 className="font-medium text-gray-900 text-sm truncate">{asset.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(asset.size)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                {filteredAssets.map(asset => (
                  <div
                    key={asset._id}
                    className={`flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${
                      selectedAssets.has(asset._id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.has(asset._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedAssets);
                        if (e.target.checked) {
                          newSelected.add(asset._id);
                        } else {
                          newSelected.delete(asset._id);
                        }
                        setSelectedAssets(newSelected);
                      }}
                      className="rounded border-gray-300"
                    />

                    {asset.type === 'image' ? (
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {getAssetIcon(asset.type)}
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{asset.title}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(asset.size)} • {asset.folder}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(asset.url, '_blank')}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(asset._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredAssets.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No assets found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Upload Assets</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">
                  Images, videos, documents, and more
                </p>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetLibrary;
