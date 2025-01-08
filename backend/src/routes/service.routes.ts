import { Router } from 'express';
import {
  getServices,
  getServiceCategories,
  searchServices,
  getServicesByCategory,
} from '../controllers/service.controller';

const router = Router();

// Get all services
router.get('/', getServices);

// Get all service categories
router.get('/categories', getServiceCategories);

// Search services
router.get('/search', searchServices);

// Get services by category
router.get('/category/:categoryId', getServicesByCategory);

export default router; 