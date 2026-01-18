import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getGroupSettlements,
  recordSettlement,
  getSettlementHistory
} from '../controllers/settlementController.js';

const router = express.Router();

router.get('/groups/:groupId/settlements', authMiddleware, getGroupSettlements);
router.post('/groups/:groupId/settlements', authMiddleware, recordSettlement);
router.get('/groups/:groupId/settlements/history', authMiddleware, getSettlementHistory);

export default router;
