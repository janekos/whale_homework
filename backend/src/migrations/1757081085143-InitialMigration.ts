import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1757081085143 implements MigrationInterface {
    name = 'InitialMigration1757081085143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "currency_prices" (
                "id" SERIAL NOT NULL,
                "symbol" character varying(10) NOT NULL,
                "price_usd" numeric(18,8) NOT NULL,
                "timestamp" TIMESTAMP NOT NULL,
                "source" character varying(50) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_currency_prices_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_currency_prices_timestamp" ON "currency_prices" ("timestamp")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_currency_prices_symbol_timestamp" ON "currency_prices" ("symbol", "timestamp")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_currency_prices_symbol_timestamp"`);
        await queryRunner.query(`DROP INDEX "IDX_currency_prices_timestamp"`);
        await queryRunner.query(`DROP TABLE "currency_prices"`);
    }

}
