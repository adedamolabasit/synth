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
 * /generate-music:
 *   post:
 *     summary: Generate AI music from a prompt and optional parameters
 *     description: Generates a music track (up to 60 seconds) using OpenAI Audio API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Create a calm ambient track with soft pads"
 *               duration:
 *                 type: number
 *                 example: 60
 *               genre:
 *                 type: string
 *                 example: "ambient"
 *               mood:
 *                 type: string
 *                 example: "relaxed"
 *               instruments:
 *                 type: string
 *                 example: "pads, soft bells"
 *               bpm:
 *                 type: number
 *                 example: 85
 *               style:
 *                 type: string
 *                 example: "lofi electronic"
 *               temperature:
 *                 type: number
 *                 example: 1
 *               top_p:
 *                 type: number
 *                 example: 1
 *               top_k:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: Music generated successfully (returns WAV audio buffer)
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid input or request error
 *       500:
 *         description: Server error generating music
 */
router.post('/generate-music', (req, res) =>
  lyricsController.getGenerateMusic(req, res)
);

/**
 * @swagger
 * /audio:
 *   get:
 *     summary: Get all audio entries
 *     responses:
 *       200:
 *         description: List of all audio entries
 */
router.get('/audio', (req, res) =>
  lyricsController.getAllAudio(req, res)
);

/**
 * @swagger
 * /audio/wallet/{walletAddress}:
 *   get:
 *     summary: Get audio by wallet address
 *     parameters:
 *       - name: walletAddress
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User's wallet address
 *     responses:
 *       200:
 *         description: List of audio entries for the specified wallet
 */
router.get('/audio/wallet/:walletAddress', (req, res) =>
  lyricsController.getAudioByWallet(req, res)
);

/**
 * @swagger
 * /audio/{id}:
 *   get:
 *     summary: Get a single audio entry by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio entry ID
 *     responses:
 *       200:
 *         description: Audio entry data
 *       404:
 *         description: Audio entry not found
 */
router.get('/audio/:id', (req, res) =>
  lyricsController.getAudioById(req, res)
);

/**
 * @swagger
 * /audio/{id}:
 *   delete:
 *     summary: Delete an audio entry by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio entry ID
 *     responses:
 *       200:
 *         description: Audio entry deleted successfully
 *       404:
 *         description: Audio entry not found
 */
router.delete('/audio/:id', (req, res) =>
  lyricsController.deleteAudio(req, res)
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check for audio/lyrics routes
 *     responses:
 *       200:
 *         description: Service is running
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'Lyrics routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
