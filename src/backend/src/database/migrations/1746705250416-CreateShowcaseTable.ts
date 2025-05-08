import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShowcaseTable1746705250416 implements MigrationInterface {
    name = 'CreateShowcaseTable1746705250416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "showcases" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "youtubeLink" character varying, "approvedAt" TIMESTAMP, "deniedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "datasetId" integer, CONSTRAINT "PK_c43f52b4985c165707c01badb48" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "showcase_slider_images" ("id" SERIAL NOT NULL, "fileName" character varying NOT NULL, "isTeaser" boolean NOT NULL DEFAULT false, "showcaseId" integer, CONSTRAINT "PK_77cf19b2d39552e9c4464736749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "showcase_locations" ("id" SERIAL NOT NULL, "lon" double precision NOT NULL, "lat" double precision NOT NULL, "description" character varying, "imageLink" character varying, "linkTitle" character varying, "linkAddress" character varying, "showcaseId" integer, CONSTRAINT "PK_f8dc3ec39838b9806c4d3859892" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "showcases" ADD CONSTRAINT "FK_4e7752b9fcbdec2ebcb2abdaa31" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcases" ADD CONSTRAINT "FK_0d47231b269a1fdffeb3cd797d7" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" ADD CONSTRAINT "FK_71f598572c8760f6b51252d85d9" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showcase_locations" ADD CONSTRAINT "FK_5cb8796e9640167647614d8babc" FOREIGN KEY ("showcaseId") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "showcase_locations" DROP CONSTRAINT "FK_5cb8796e9640167647614d8babc"`);
        await queryRunner.query(`ALTER TABLE "showcase_slider_images" DROP CONSTRAINT "FK_71f598572c8760f6b51252d85d9"`);
        await queryRunner.query(`ALTER TABLE "showcases" DROP CONSTRAINT "FK_0d47231b269a1fdffeb3cd797d7"`);
        await queryRunner.query(`ALTER TABLE "showcases" DROP CONSTRAINT "FK_4e7752b9fcbdec2ebcb2abdaa31"`);
        await queryRunner.query(`DROP TABLE "showcase_locations"`);
        await queryRunner.query(`DROP TABLE "showcase_slider_images"`);
        await queryRunner.query(`DROP TABLE "showcases"`);
    }

}
