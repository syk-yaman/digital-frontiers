import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTypes1743514908768 implements MigrationInterface {
    name = 'UpdateUserTypes1743514908768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename the old enum type
        await queryRunner.query(`ALTER TYPE "public"."users_type_enum" RENAME TO "users_type_enum_old"`);

        // Temporarily change the column type to TEXT
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT`);

        // Create the new enum type
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('public_sector', 'sme', 'large_business', 'university', 'citizen_scientist', 'none')`);

        // Update all existing user types to 'none'
        await queryRunner.query(`UPDATE "users" SET "type" = 'none'`);

        // Change the column type to the new enum type
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "type" TYPE "public"."users_type_enum" USING "type"::TEXT::"public"."users_type_enum"`);

        // Drop the old enum type
        await queryRunner.query(`DROP TYPE "public"."users_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the old enum type
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum_old" AS ENUM('academic', 'business_owner', 'corporate', 'enthusiast')`);

        // Temporarily change the column type to TEXT
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT`);

        // Update rows with 'none' to a valid value from the old enum
        await queryRunner.query(`UPDATE "users" SET "type" = 'academic' WHERE "type" = 'none'`);

        // Change the column type to the old enum type
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "type" TYPE "public"."users_type_enum_old" USING "type"::TEXT::"public"."users_type_enum_old"`);

        // Drop the new enum type
        await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);

        // Rename the old enum type back to its original name
        await queryRunner.query(`ALTER TYPE "public"."users_type_enum_old" RENAME TO "users_type_enum"`);
    }
}
