import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  removeMember,
  deleteGroup
} from '../controllers/groupController.js';

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.get('/:groupId', authMiddleware, getGroupById);
router.put('/:groupId/members', authMiddleware, addMember);
router.delete('/:groupId/members/:userId', authMiddleware, removeMember);
router.delete('/:groupId', authMiddleware, deleteGroup);

export default router;
