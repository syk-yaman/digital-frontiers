import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTable1746709055234 implements MigrationInterface {
    name = 'CreateSettingsTable1746709055234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."settings_datatype_enum" AS ENUM('string', 'number', 'boolean', 'json', 'html')`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "value" text, "dataType" "public"."settings_datatype_enum" NOT NULL DEFAULT 'string', "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE ("key"), CONSTRAINT "CHK_69af6ebb33fc2dfa91fb6977d5" CHECK ("dataType" IN ('string', 'number', 'boolean', 'json', 'html')), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c8639b7626fa94ba8265628f21" ON "settings" ("key") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c8639b7626fa94ba8265628f21"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TYPE "public"."settings_datatype_enum"`);
    }

}
