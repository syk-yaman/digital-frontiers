import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateDefaultAdmin1746709055235 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await queryRunner.query(`
            INSERT INTO "users" ("id", "email", "firstName", "lastName", "company", "password", "type", "isAdmin", "isActivated", "createdAt")
            VALUES (
                uuid_generate_v4(),
                'admin@example.com',
                'Admin',
                'Admin',
                'Admin Company',
                '${hashedPassword}',
                'none',
                true,
                true,
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "users" WHERE "email" = 'admin@example.com'
        `);
    }
}
