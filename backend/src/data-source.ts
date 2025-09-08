import { DataSource } from 'typeorm';
import { CurrencyPrice } from './entities/CurrencyPrice';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'whale_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [CurrencyPrice],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  migrationsTableName: 'typeorm_migrations',
});
