import { Router } from 'express'
import multer from 'multer'
import {
  uploadVideoController,
  listVideosController,
  getVideoController,
  streamMasterPlaylistController,
  streamVariantPlaylistController,
} from '../controllers/video.controller.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
})

const router: Router = Router()

// Video Upload Endpoint (Teacher only)
router.post('/upload', upload.single('video'), uploadVideoController)

// Video Catalog & Retrieval
router.get('/', listVideosController)
router.get('/:id', getVideoController)

// HLS Adaptive Bitrate Streaming Endpoints
router.get('/stream/:videoId/master.m3u8', streamMasterPlaylistController)
router.get('/stream/:videoId/:variant', streamVariantPlaylistController)

export default router
