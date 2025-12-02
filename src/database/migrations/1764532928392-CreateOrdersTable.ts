import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrdersTable1764532928392 implements MigrationInterface {
    name = 'CreateOrdersTable1764532928392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "productName" character varying NOT NULL, "description" text NOT NULL, "totalAmount" numeric(10,2) NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
        await queryRunner.query(`CREATE INDEX "idx_search" ON "orders" ("productName") WHERE "productName" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "idx_total_amount" ON "orders" ("totalAmount") `);
        await queryRunner.query(`CREATE INDEX "idx_created_at" ON "orders" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_status" ON "orders" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_user_id" ON "orders" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_total_amount"`);
        await queryRunner.query(`DROP INDEX "public"."idx_search"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_151b79a83ba240b0cb31b2302d"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
