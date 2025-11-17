import express from 'express';
import { getAdaptiveRecommendations } from '../controllers/adaptive.controller';
import { validate } from '../middleware/validate';
import { adaptiveContextSchema } from '../middleware/validation.schemas';

const router = express.Router();

router.post('/recommendations', validate(adaptiveContextSchema), getAdaptiveRecommendations);

export default router;
