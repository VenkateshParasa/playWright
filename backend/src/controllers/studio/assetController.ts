import { Request, Response } from 'express';
import Asset from '../../models/Asset.js';
import contentVersioningService from '../../services/contentVersioning.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

/**
 * Get all assets with filters
 */
export const getAssets = async (req: Request, res: Response) => {
  try {
    const {
      type,
      folder,
      tags,
      status,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (type) query.type = type;
    if (folder) query.folder = folder;
    if (status) query.status = status;
    if (tags) {
      const tagArray = (tags as string).split(',');
      query.tags = { $in: tagArray };
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // For non-admins, only show their assets or public assets
    if (req.user && !req.user.roles?.includes('admin')) {
      query.$or = [
        { createdBy: req.user._id },
        { isPublic: true }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .lean(),
      Asset.countDocuments(query)
    ]);

    res.json({
      assets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ message: 'Failed to fetch assets', error: (error as Error).message });
  }
};

/**
 * Get single asset by ID
 */
export const getAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('usedIn.id', 'title');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check permissions
    if (
      !asset.isPublic &&
      req.user &&
      !req.user.roles?.includes('admin') &&
      asset.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(asset);
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ message: 'Failed to fetch asset', error: (error as Error).message });
  }
};

/**
 * Upload a new asset
 */
export const uploadAsset = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      folder,
      tags,
      category,
      alt,
      isPublic,
      metadata
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;

    // Generate checksum
    const fileBuffer = await fs.readFile(file.path);
    const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

    // Check for duplicate
    const existingAsset = await Asset.findOne({ checksum });
    if (existingAsset) {
      // Clean up uploaded file
      await fs.unlink(file.path);

      return res.status(400).json({
        message: 'This file already exists in the asset library',
        existingAsset
      });
    }

    // Determine asset type from MIME type
    const mimeType = file.mimetype;
    let type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

    if (mimeType.startsWith('image/')) {
      type = 'image';
    } else if (mimeType.startsWith('video/')) {
      type = 'video';
    } else if (mimeType.startsWith('audio/')) {
      type = 'audio';
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      type = 'document';
    } else if (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('compressed')
    ) {
      type = 'archive';
    } else {
      type = 'other';
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    // In production, upload to S3/Cloud Storage
    // For now, we'll use the local file path
    const url = `/uploads/${fileName}`;

    const asset = new Asset({
      title: title || file.originalname,
      fileName,
      originalFileName: file.originalname,
      description,
      url,
      type,
      mimeType,
      size: file.size,
      checksum,
      folder: folder || 'root',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      category,
      metadata: metadata || {},
      alt,
      isPublic: isPublic !== false,
      status: 'ready',
      cdnEnabled: false,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await asset.save();

    // Create initial version
    await contentVersioningService.createAssetVersion(
      asset._id,
      url,
      file.size,
      req.user._id,
      'Initial upload'
    );

    res.status(201).json(asset);
  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({ message: 'Failed to upload asset', error: (error as Error).message });
  }
};

/**
 * Update an asset
 */
export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      folder,
      tags,
      category,
      alt,
      isPublic,
      metadata
    } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check permissions
    if (
      !req.user.roles?.includes('admin') &&
      asset.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    if (title) asset.title = title;
    if (description !== undefined) asset.description = description;
    if (folder !== undefined) asset.folder = folder;
    if (tags) asset.tags = Array.isArray(tags) ? tags : tags.split(',');
    if (category !== undefined) asset.category = category;
    if (alt !== undefined) asset.alt = alt;
    if (isPublic !== undefined) asset.isPublic = isPublic;
    if (metadata) asset.metadata = { ...asset.metadata, ...metadata };

    asset.lastModifiedBy = req.user._id;
    await asset.save();

    res.json(asset);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ message: 'Failed to update asset', error: (error as Error).message });
  }
};

/**
 * Delete an asset
 */
export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Check permissions
    if (!req.user.roles?.includes('admin') && asset.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if asset is being used
    if (asset.usageCount > 0 && !force) {
      return res.status(400).json({
        message: 'Asset is being used in content. Use force=true to delete anyway.',
        usedIn: asset.usedIn
      });
    }

    // Delete physical file (in production, delete from S3/Cloud Storage)
    try {
      const filePath = path.join(process.cwd(), 'public', asset.url);
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Failed to delete physical file:', fileError);
    }

    await asset.deleteOne();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ message: 'Failed to delete asset', error: (error as Error).message });
  }
};

/**
 * Bulk delete assets
 */
export const bulkDeleteAssets = async (req: Request, res: Response) => {
  try {
    const { assetIds, force } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'Asset IDs array is required' });
    }

    const assets = await Asset.find({
      _id: { $in: assetIds },
      createdBy: req.user._id
    });

    // Check if any asset is being used
    if (!force) {
      const usedAssets = assets.filter(a => a.usageCount > 0);
      if (usedAssets.length > 0) {
        return res.status(400).json({
          message: 'Some assets are being used. Use force=true to delete anyway.',
          usedAssets: usedAssets.map(a => ({ id: a._id, title: a.title, usageCount: a.usageCount }))
        });
      }
    }

    // Delete files
    await Promise.all(
      assets.map(async (asset) => {
        try {
          const filePath = path.join(process.cwd(), 'public', asset.url);
          await fs.unlink(filePath);
        } catch (error) {
          console.warn(`Failed to delete file for asset ${asset._id}:`, error);
        }
      })
    );

    const result = await Asset.deleteMany({
      _id: { $in: assetIds },
      createdBy: req.user._id
    });

    res.json({
      message: `${result.deletedCount} assets deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete assets error:', error);
    res.status(500).json({ message: 'Failed to delete assets', error: (error as Error).message });
  }
};

/**
 * Get asset folders
 */
export const getFolders = async (req: Request, res: Response) => {
  try {
    const query: any = {};

    // For non-admins, only show their assets
    if (req.user && !req.user.roles?.includes('admin')) {
      query.createdBy = req.user._id;
    }

    const folders = await Asset.distinct('folder', query);

    // Get asset count per folder
    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const count = await Asset.countDocuments({ ...query, folder });
        return { name: folder, count };
      })
    );

    res.json(folderStats);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ message: 'Failed to fetch folders', error: (error as Error).message });
  }
};

/**
 * Get asset tags
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const query: any = {};

    // For non-admins, only show their assets
    if (req.user && !req.user.roles?.includes('admin')) {
      query.createdBy = req.user._id;
    }

    const tags = await Asset.distinct('tags', query);

    // Get usage count per tag
    const tagStats = await Promise.all(
      tags.map(async (tag) => {
        const count = await Asset.countDocuments({ ...query, tags: tag });
        return { name: tag, count };
      })
    );

    res.json(tagStats.sort((a, b) => b.count - a.count));
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Failed to fetch tags', error: (error as Error).message });
  }
};

/**
 * Get asset usage
 */
export const getAssetUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const asset = await Asset.findById(id)
      .populate('usedIn.id', 'title slug');

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({
      usageCount: asset.usageCount,
      usedIn: asset.usedIn
    });
  } catch (error) {
    console.error('Get asset usage error:', error);
    res.status(500).json({ message: 'Failed to fetch asset usage', error: (error as Error).message });
  }
};

/**
 * Get asset statistics
 */
export const getAssetStats = async (req: Request, res: Response) => {
  try {
    const query: any = {};

    // For non-admins, only show their assets
    if (req.user && !req.user.roles?.includes('admin')) {
      query.createdBy = req.user._id;
    }

    const [
      totalAssets,
      totalSize,
      assetsByType,
      assetsByStatus
    ] = await Promise.all([
      Asset.countDocuments(query),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$size' } } }
      ]),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 }, size: { $sum: '$size' } } }
      ]),
      Asset.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalAssets,
      totalSize: totalSize[0]?.total || 0,
      assetsByType: assetsByType.map(item => ({
        type: item._id,
        count: item.count,
        size: item.size
      })),
      assetsByStatus: assetsByStatus.map(item => ({
        status: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Get asset stats error:', error);
    res.status(500).json({ message: 'Failed to fetch asset statistics', error: (error as Error).message });
  }
};

/**
 * Move assets to folder
 */
export const moveToFolder = async (req: Request, res: Response) => {
  try {
    const { assetIds, folder } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'Asset IDs array is required' });
    }

    const result = await Asset.updateMany(
      {
        _id: { $in: assetIds },
        createdBy: req.user._id
      },
      {
        $set: {
          folder: folder || 'root',
          lastModifiedBy: req.user._id
        }
      }
    );

    res.json({
      message: `${result.modifiedCount} assets moved successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Move to folder error:', error);
    res.status(500).json({ message: 'Failed to move assets', error: (error as Error).message });
  }
};

/**
 * Add tags to assets
 */
export const addTags = async (req: Request, res: Response) => {
  try {
    const { assetIds, tags } = req.body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return res.status(400).json({ message: 'Asset IDs array is required' });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ message: 'Tags array is required' });
    }

    const result = await Asset.updateMany(
      {
        _id: { $in: assetIds },
        createdBy: req.user._id
      },
      {
        $addToSet: { tags: { $each: tags } },
        $set: { lastModifiedBy: req.user._id }
      }
    );

    res.json({
      message: `Tags added to ${result.modifiedCount} assets`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Add tags error:', error);
    res.status(500).json({ message: 'Failed to add tags', error: (error as Error).message });
  }
};
