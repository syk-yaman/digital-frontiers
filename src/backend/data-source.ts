import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['**/*.entity.ts'],
    synchronize: false, //since we use migrations
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: '_migrations',
    logging: true,
});