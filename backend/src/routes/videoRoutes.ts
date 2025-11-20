import express from 'express';
import multer from 'multer';
import { videoController } from '@/controllers/videoController';

const router = express.Router();

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/videos/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
});

// Upload route
router.post('/upload', upload.single('video'), (req, res) =>
  videoController.uploadVideo(req, res)
);

// Get all videos
router.get('/', (req, res) => videoController.getAllVideos(req, res));

// Get single video by ID
router.get('/:id', (req, res) => videoController.getVideoById(req, res));

// Get videos by wallet address
router.get('/wallet/:walletAddress', (req, res) => 
  videoController.getVideosByWallet(req, res)
);

// Delete video by ID
router.delete('/:id', (req, res) => videoController.deleteVideo(req, res));

export default router;