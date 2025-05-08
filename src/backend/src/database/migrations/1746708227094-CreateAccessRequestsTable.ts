import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccessRequestsTable1746708227094 implements MigrationInterface {
    name = 'CreateAccessRequestsTable1746708227094'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "access_requests" ("id" SERIAL NOT NULL, "jobTitle" character varying NOT NULL, "company" character varying NOT NULL, "contactEmail" character varying NOT NULL, "department" character varying NOT NULL, "projectDescription" text NOT NULL, "usageDetails" text NOT NULL, "endTime" TIMESTAMP, "approvedAt" TIMESTAMP, "deniedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "datasetId" integer NOT NULL, CONSTRAINT "PK_f89e51c15e3dbea13aa248fe128" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "access_requests" ADD CONSTRAINT "FK_7b409335b4848b218c30ea25f04" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_requests" ADD CONSTRAINT "FK_dccdcd72d2954809482e1ce6eca" FOREIGN KEY ("datasetId") REFERENCES "datasets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_requests" DROP CONSTRAINT "FK_dccdcd72d2954809482e1ce6eca"`);
        await queryRunner.query(`ALTER TABLE "access_requests" DROP CONSTRAINT "FK_7b409335b4848b218c30ea25f04"`);
        await queryRunner.query(`DROP TABLE "access_requests"`);
    }

}
