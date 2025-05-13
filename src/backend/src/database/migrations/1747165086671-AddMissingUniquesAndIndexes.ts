import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingUniquesAndIndexes1747165086671 implements MigrationInterface {
    name = 'AddMissingUniquesAndIndexes1747165086671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4a40dadf87d8be1c12c51a13f1" ON "datasets" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9cd55589b50950d4b4db207472" ON "dataset_tags" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0f5ae82ce4c1f1ca264cf8b5a4" ON "showcases" ("title") `);
        await queryRunner.query(`ALTER TABLE "datasets" ADD CONSTRAINT "CHK_56831bd946a0e1a76950dc7e1b" CHECK ("datasetType" IN ('open', 'controlled'))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_594d768695d65ac809c79a8be8" CHECK ("type" IN ('public_sector', 'sme', 'large_business', 'university', 'citizen_scientist', 'none'))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_594d768695d65ac809c79a8be8"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP CONSTRAINT "CHK_56831bd946a0e1a76950dc7e1b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f5ae82ce4c1f1ca264cf8b5a4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cd55589b50950d4b4db207472"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a40dadf87d8be1c12c51a13f1"`);
    }

}
