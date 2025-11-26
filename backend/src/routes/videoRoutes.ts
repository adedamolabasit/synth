import express from 'express';
import multer from 'multer';
import { videoController } from '@/controllers/videoController';

const router = express.Router();

const upload = multer({
  dest: 'uploads/videos/',
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});


router.post('/upload/:walletAddress', upload.single('video'), (req, res) =>
  videoController.uploadVideo(req, res)
);

router.get('/', (req, res) => videoController.getAllVideos(req, res));

router.get('/:id', (req, res) => videoController.getVideoById(req, res));

router.get('/wallet/:walletAddress', (req, res) => 
  videoController.getVideosByWallet(req, res)
);

router.delete('/:id', (req, res) => videoController.deleteVideo(req, res));

export default router;