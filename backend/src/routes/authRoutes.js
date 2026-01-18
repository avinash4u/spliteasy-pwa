import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  register, 
  getProfile, 
  updateProfile, 
  deleteAccount 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authMiddleware, register);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
