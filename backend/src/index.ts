import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './data-source';
import { jobClient } from './services/JobClient';
import priceRoutes from './routes/priceRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(limiter);

const apiV1 = express.Router();
apiV1.use('/prices', priceRoutes);
app.use('/v1/api', apiV1);

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

async function initialize() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    await AppDataSource.runMigrations();
    console.log('Migrations completed');

    await jobClient.start();
    console.log('Job system initialized');

  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
