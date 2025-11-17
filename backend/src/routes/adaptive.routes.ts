import express from 'express';
import { getAdaptiveRecommendations } from '../controllers/adaptive.controller';

const router = express.Router();

router.post('/recommendations', getAdaptiveRecommendations);

export default router;
