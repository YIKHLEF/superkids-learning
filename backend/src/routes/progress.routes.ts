import { Router } from 'express';
import {
  getProgress,
  updateProgress,
  getRewards,
  unlockReward,
} from '../controllers/progress.controller';

const router = Router();

router.get('/:childId', getProgress);
router.put('/:childId', updateProgress);
router.get('/:childId/rewards', getRewards);
router.post('/:childId/rewards/:rewardId/unlock', unlockReward);

export default router;
