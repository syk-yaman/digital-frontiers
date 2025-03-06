import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDatasetTable1741226041531 implements MigrationInterface {
    name = 'CreateDatasetTable1741226041531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."datasets_datasettype_enum" AS ENUM('open', 'controlled')`);
        await queryRunner.query(`CREATE TYPE "public"."datasets_updatefrequencyunit_enum" AS ENUM('once', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years')`);
        await queryRunner.query(`CREATE TABLE "datasets" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "dataOwnerName" character varying NOT NULL, "dataOwnerEmail" character varying NOT NULL, "dataOwnerPhoto" character varying NOT NULL, "datasetType" "public"."datasets_datasettype_enum" NOT NULL, "description" text NOT NULL, "updateFrequency" double precision NOT NULL, "updateFrequencyUnit" "public"."datasets_updatefrequencyunit_enum" NOT NULL, "dataExample" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "PK_1bf831e43c559a240303e23d038" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dataset_links" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "url" character varying NOT NULL, "datasetId" integer, CONSTRAINT "PK_774ffc788a562637ba7bcb4d917" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dataset_locations" ("id" SERIAL NOT NULL, "lon" double precision NOT NULL, "lat" double precision NOT NULL, "datasetId" integer, CONSTRAINT "PK_c280cc24cafec4de56c0292516f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dataset_slider_images" ("id" SERIAL NOT NULL, "fileName" character varying NOT NULL, "datasetId" integer, CONSTRAINT "PK_459725491d592fd50cde1a07d2a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dataset_tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "colour" character varying NOT NULL, "icon" character varying NOT NULL, CONSTRAINT "PK_3cb6e1c82fc9fa36971da6f5d72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "datasets_tags_dataset_tags" ("datasetsId" integer NOT NULL, "datasetTagsId" integer NOT NULL, CONSTRAINT "PK_dd03be7a088d6ce3b9314498d31" PRIMARY KEY ("datasetsId", "datasetTagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_471f7d7c95e3402287050f11a7" ON "datasets_tags_dataset_tags" ("datasetsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc21c593fc282ec7f8312f337b" ON "datasets_tags_dataset_tags" ("datasetTagsId") `);
        await queryRunner.query(`ALTER TABLE "datasets" ADD CONSTRAINT "FK_b8c922f11b23d23aa64745a503b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_links" ADD CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" ADD CONSTRAINT "FK_cedba2b47e511f869de78403b11" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ADD CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "datasets_tags_dataset_tags" ADD CONSTRAINT "FK_471f7d7c95e3402287050f11a7e" FOREIGN KEY ("datasetsId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "datasets_tags_dataset_tags" ADD CONSTRAINT "FK_dc21c593fc282ec7f8312f337b5" FOREIGN KEY ("datasetTagsId") REFERENCES "dataset_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets_tags_dataset_tags" DROP CONSTRAINT "FK_dc21c593fc282ec7f8312f337b5"`);
        await queryRunner.query(`ALTER TABLE "datasets_tags_dataset_tags" DROP CONSTRAINT "FK_471f7d7c95e3402287050f11a7e"`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" DROP CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1"`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" DROP CONSTRAINT "FK_cedba2b47e511f869de78403b11"`);
        await queryRunner.query(`ALTER TABLE "dataset_links" DROP CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP CONSTRAINT "FK_b8c922f11b23d23aa64745a503b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc21c593fc282ec7f8312f337b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_471f7d7c95e3402287050f11a7"`);
        await queryRunner.query(`DROP TABLE "datasets_tags_dataset_tags"`);
        await queryRunner.query(`DROP TABLE "dataset_tags"`);
        await queryRunner.query(`DROP TABLE "dataset_slider_images"`);
        await queryRunner.query(`DROP TABLE "dataset_locations"`);
        await queryRunner.query(`DROP TABLE "dataset_links"`);
        await queryRunner.query(`DROP TABLE "datasets"`);
        await queryRunner.query(`DROP TYPE "public"."datasets_updatefrequencyunit_enum"`);
        await queryRunner.query(`DROP TYPE "public"."datasets_datasettype_enum"`);
    }

}
