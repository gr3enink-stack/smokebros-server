import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRegister, validateLogin, checkValidation } from '../middleware/validatePhone';

const router = express.Router();

router.post('/register', validateRegister, checkValidation, register);
router.post('/login', validateLogin, checkValidation, login);
router.get('/me', protect, getMe);

export default router;
