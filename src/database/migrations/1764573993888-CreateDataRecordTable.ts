import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDataRecordTable1764573993888 implements MigrationInterface {
    name = 'CreateDataRecordTable1764573993888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "data_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source" character varying NOT NULL, "value" double precision NOT NULL, "payload" json, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b99a7c5b3594de765c089e82f89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_data_record_status" ON "data_records" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_2888f9191b88cbd8b8045b6911" ON "data_records" ("source", "createdAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2888f9191b88cbd8b8045b6911"`);
        await queryRunner.query(`DROP INDEX "public"."idx_data_record_status"`);
        await queryRunner.query(`DROP TABLE "data_records"`);
    }

}
