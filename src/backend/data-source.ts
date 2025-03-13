import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'DigitalFrontiersDB',
    entities: ['**/*.entity.ts'],
    synchronize: false, //since we use migrations
    migrations: ['src/database/migrations/*.ts'],
    migrationsTableName: '_migrations',
    //migrationsRun: true,
    //autoLoadEntities: true, 
    logging: true,
});