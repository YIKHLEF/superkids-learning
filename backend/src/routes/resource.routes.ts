import { Router } from 'express';
import {
  getAllResources,
  getResourcesByType,
  getResourceById,
  searchResources,
} from '../controllers/resource.controller';

const router = Router();

router.get('/', getAllResources);
router.get('/type/:type', getResourcesByType);
router.get('/search', searchResources);
router.get('/:id', getResourceById);

export default router;
