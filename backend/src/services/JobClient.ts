import PgBoss from 'pg-boss';
import { priceFetchJobHandler } from '../jobs/priceFetchJob';

export const jobNames = {
  PRICE_FETCH_JOB: 'price-fetch'
};

class JobClient {
  private boss: PgBoss;

  constructor() {
    this.boss = new PgBoss({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'whale_db',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    });
  }

  async start() {
    await this.boss.start();
    await this.generateQueues();
    await this.registerHandlers();
    await this.scheduleJobs();
  }

  async stop() {
    await this.boss.stop();
  }

  async generateQueues() {
    for (const jobName of Object.values(jobNames)) {
      await this.boss.createQueue(jobName);
    }
  }

  async scheduleJob(name: string, data: any, options: any = {}) {
    return await this.boss.send(name, data, options);
  }

  private async registerHandlers() {
    await this.boss.work(jobNames.PRICE_FETCH_JOB, priceFetchJobHandler);
  }

  private async scheduleJobs() {
    await this.boss.schedule(jobNames.PRICE_FETCH_JOB, '*/1 * * * *', {}, {
      retryLimit: 1, 
      retryDelay: 20,
      retryBackoff: true
    });
  }

  getBoss() {
    return this.boss;
  }
}

export const jobClient = new JobClient();
