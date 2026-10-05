import express from 'express';
import {
  getAssets,
  getAssetById,
  streamAsset,
  downloadAsset,
  getAssetContent,
} from '../controllers/assetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// List user's assets
router.get('/', protect, getAssets);

// Single asset metadata
router.get('/:id', protect, getAssetById);

// Stream media asset (images, native video playback with HTTP Range request seeking)
router.get('/:id/stream', protect, streamAsset);

// Authenticated asset download
router.get('/:id/download', protect, downloadAsset);

// Authenticated asset text extraction content
router.get('/:id/content', protect, getAssetContent);

export default router;
