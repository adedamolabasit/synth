import { Router } from 'express';
import { LyricsController } from '../controllers/lyricsController';
import { upload } from '../middleware/upload';

const router = Router();
const lyricsController = new LyricsController();

/**
 * @swagger
 * /extract:
 *   post:
 *     summary: Extract lyrics from an uploaded audio file
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lyrics extracted successfully
 *       400:
 *         description: File too large or invalid
 */
router.post('/extract', upload.single('audio'), (req, res) => 
  lyricsController.extractLyrics(req, res)
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check for lyrics routes
 *     responses:
 *       200:
 *         description: Lyrics routes are working
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'Lyrics routes are working', 
    timestamp: new Date().toISOString() 
  });
});

export default router;
