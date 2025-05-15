import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeaturedDatasetsAndTeaserImage1747347112876 implements MigrationInterface {
    name = 'AddFeaturedDatasetsAndTeaserImage1747347112876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets" ADD "orderInHomepage" integer`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ADD "isTeaser" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" DROP COLUMN "isTeaser"`);
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "orderInHomepage"`);
    }

}
