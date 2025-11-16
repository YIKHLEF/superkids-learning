import { Router } from 'express';
import {
  getAllActivities,
  getActivityById,
  getActivitiesByCategory,
  startActivity,
  completeActivity,
  updateActivitySession,
} from '../controllers/activity.controller';

const router = Router();

router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.get('/category/:category', getActivitiesByCategory);
router.post('/session/start', startActivity);
router.post('/session/:sessionId/complete', completeActivity);
router.patch('/session/:sessionId', updateActivitySession);

export default router;
