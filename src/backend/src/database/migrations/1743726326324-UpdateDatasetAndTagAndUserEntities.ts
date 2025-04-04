import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDatasetAndTagAndUserEntities1743726326324 implements MigrationInterface {
    name = 'UpdateDatasetAndTagAndUserEntities1743726326324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "dataOwnerPhoto"`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "mqttAddress" character varying`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "mqttPort" integer`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "mqttTopic" character varying`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "mqttUsername" character varying`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "mqttPassword" character varying`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "approvedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" ADD "orderInNavbar" integer`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" ADD "approvedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isActivated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP CONSTRAINT "FK_b8c922f11b23d23aa64745a503b"`);
        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "dataExample" DROP NOT NULL`);

        // Assign datasets with NULL userId to the admin user, only happens during development
        await queryRunner.query(`
            UPDATE "datasets"
            SET "userId" = (
                SELECT "id"
                FROM "users"
                WHERE "isAdmin" = true
                LIMIT 1
            )
            WHERE "userId" IS NULL
        `);

        // Set approvedAt to NOW() for old datasets
        await queryRunner.query(`
            UPDATE "datasets"
            SET "approvedAt" = NOW()
            WHERE "approvedAt" IS NULL
        `);

        // Set approvedAt to NOW() for old tags
        await queryRunner.query(`
            UPDATE "dataset_tags"
            SET "approvedAt" = NOW()
            WHERE "approvedAt" IS NULL
        `);

        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD CONSTRAINT "FK_b8c922f11b23d23aa64745a503b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets" DROP CONSTRAINT "FK_b8c922f11b23d23aa64745a503b"`);
        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "dataExample" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "datasets" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD CONSTRAINT "FK_b8c922f11b23d23aa64745a503b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActivated"`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" DROP COLUMN "approvedAt"`);
        await queryRunner.query(`ALTER TABLE "dataset_tags" DROP COLUMN "orderInNavbar"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "approvedAt"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "mqttPassword"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "mqttUsername"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "mqttTopic"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "mqttPort"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "mqttAddress"`);
        await queryRunner.query(`ALTER TABLE "datasets" ADD "dataOwnerPhoto" character varying NOT NULL`);
    }

}
