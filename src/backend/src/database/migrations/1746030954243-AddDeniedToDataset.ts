import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeniedToDataset1746030954243 implements MigrationInterface {
    name = 'AddDeniedToDataset1746030954243'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets" ADD "deniedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "datasets" DROP COLUMN "deniedAt"`);
    }

}
