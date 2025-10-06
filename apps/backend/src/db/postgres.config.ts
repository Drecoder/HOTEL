import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RoomEntity } from '../../../../apps/backend/src/room/room.entity';
import { Booking } from '../../../../apps/backend/src/booking/entities/booking.entity';
import { Service } from '../../../../apps/backend/src/booking/entities/service.entity';
import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

// Load environment variables from .env file (if running outside Docker)
// NOTE: NestJS ConfigModule handles this generally, but calling it here
// ensures variables are available for this specific file execution.
dotenv.config();

// 1. Resolve and Log Connection Details
const DB_HOST = process.env['DB_HOST'] || 'localhost';
const DB_PORT_STRING = process.env['DB_PORT'] ?? '5432';
const DB_PORT = parseInt(DB_PORT_STRING, 10);
const DB_USER = process.env['DB_USER'] || 'admin';
const DB_PASSWORD = process.env['DB_PASSWORD'] || '123password';
const DB_NAME = process.env['DB_NAME'] || 'admin';

// Explicitly log the resolved connection parameters to the console
console.log(`
======================================================
[DB CONFIG DEBUG] TypeORM Connection Parameters:
------------------------------------------------------
HOST:     ${DB_HOST}
PORT:     ${DB_PORT} (Resolved from ENV: ${DB_PORT_STRING})
USER:     ${DB_USER}
PASSWORD: ${DB_PASSWORD ? '********' : 'N/A'} 
DB NAME:  ${DB_NAME}
------------------------------------------------------
If the database connection fails (ECONNREFUSED), one of the above
values, specifically HOST or PORT, is likely incorrect or the
PostgreSQL service is not running or accessible.
======================================================
`);

// The options object defines how NestJS/TypeORM connects to PostgreSQL
const postgresConfig: TypeOrmModuleOptions = {
  // Database type
  type: 'postgres',

  // Connection details using resolved variables
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,

  // List of entities/models to load
  entities: [RoomEntity, Booking, Service],

  // Synchronization (for development only! DO NOT use in production)
  synchronize: false,
  // Logging for debugging queries and connection attempts (TypeORM internal logs)
  // We add 'log' to get more verbose information during startup.
  logging:
    process.env['NODE_ENV'] === 'development'
      ? ['query', 'error', 'log', 'schema']
      : false,

  // Optional: Run migrations automatically (better for controlled environment)
  // migrations: ['dist/db/migrations/*.js'],
  // migrationsRun: true,
};

// Exporting as DataSourceOptions is sometimes necessary for NestJS configuration
export const typeOrmConfig: DataSourceOptions =
  postgresConfig as DataSourceOptions;
