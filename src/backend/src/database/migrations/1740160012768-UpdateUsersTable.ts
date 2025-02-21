import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersTable1740160012768 implements MigrationInterface {
    name = 'UpdateUsersTable1740160012768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('academic', 'business_owner', 'corporate', 'enthusiast')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "company" character varying NOT NULL, "password" character varying NOT NULL, "type" "public"."users_type_enum" NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "isVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    }

}
