import { MigrationInterface, QueryRunner } from "typeorm";

export class MinorChangeToAccessRequests1747374582767 implements MigrationInterface {
    name = 'MinorChangeToAccessRequests1747374582767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_requests" ALTER COLUMN "department" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_requests" ALTER COLUMN "department" SET NOT NULL`);
    }

}
