import { Router } from 'express';
import priceRoutes from './priceRoutes';

const apiRouter = Router();

// Mount all route modules here
apiRouter.use('/prices', priceRoutes);

// Future routes can be added here:
// apiRouter.use('/users', userRoutes);
// apiRouter.use('/auth', authRoutes);

export default apiRouter;
