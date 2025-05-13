import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingCascadesAndNonNullableRelations1747164392790 implements MigrationInterface {
    name = 'AddMissingCascadesAndNonNullableRelations1747164392790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dataset_links" DROP CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7"`);
        await queryRunner.query(`ALTER TABLE "dataset_links" ALTER COLUMN "datasetId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" DROP CONSTRAINT "FK_cedba2b47e511f869de78403b11"`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" ALTER COLUMN "datasetId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" DROP CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1"`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ALTER COLUMN "datasetId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" DROP CONSTRAINT "FK_71f598572c8760f6b51252d85d9"`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" ALTER COLUMN "showcaseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" DROP CONSTRAINT "FK_5cb8796e9640167647614d8babc"`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" ALTER COLUMN "showcaseId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_links" ADD CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" ADD CONSTRAINT "FK_cedba2b47e511f869de78403b11" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ADD CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" ADD CONSTRAINT "FK_71f598572c8760f6b51252d85d9" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" ADD CONSTRAINT "FK_5cb8796e9640167647614d8babc" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "showcase_locations" DROP CONSTRAINT "FK_5cb8796e9640167647614d8babc"`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" DROP CONSTRAINT "FK_71f598572c8760f6b51252d85d9"`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" DROP CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1"`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" DROP CONSTRAINT "FK_cedba2b47e511f869de78403b11"`);
        await queryRunner.query(`ALTER TABLE "dataset_links" DROP CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7"`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" ALTER COLUMN "showcaseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" ADD CONSTRAINT "FK_5cb8796e9640167647614d8babc" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" ALTER COLUMN "showcaseId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" ADD CONSTRAINT "FK_71f598572c8760f6b51252d85d9" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ALTER COLUMN "datasetId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_slider_images" ADD CONSTRAINT "FK_b520b2296a07f0427ac7b1e5ac1" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" ALTER COLUMN "datasetId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_locations" ADD CONSTRAINT "FK_cedba2b47e511f869de78403b11" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dataset_links" ALTER COLUMN "datasetId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "dataset_links" ADD CONSTRAINT "FK_e6100f0428ccb899d4019d2eef7" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
