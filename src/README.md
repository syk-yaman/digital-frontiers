npm run typeorm -- migration:generate src/database/migrations/CreateUsersTable -d ./data-source.ts
npm run typeorm -- migration:run -d ./data-source.ts