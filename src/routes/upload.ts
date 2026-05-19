import { Router } from 'express';
import { protect } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { upload, uploadImage, uploadImages, deleteImage } from '../controllers/uploadController';

const router = Router();

// All routes require admin authentication
router.use(protect);
router.use(adminAuth);

// @route   POST /api/upload/image
router.post('/image', upload.single('image'), uploadImage);

// @route   POST /api/upload/images
router.post('/images', upload.array('images', 5), uploadImages);

// @route   DELETE /api/upload/image/:publicId
router.delete('/image/:publicId', deleteImage);

export default router;
