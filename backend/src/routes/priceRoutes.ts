import { Router } from 'express';
import { priceController } from '../controllers/priceController';

const router = Router();

router.get('/convert', priceController.getCurrencyConversion);

export default router;
