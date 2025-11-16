import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updatePreferences,
  getChildProfiles,
} from '../controllers/profile.controller';

const router = Router();

router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.patch('/:id/preferences', updatePreferences);
router.get('/children/all', getChildProfiles);

export default router;
