// backend/src/db/postgres.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RoomEntity } from '../room/room.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Service } from '../booking/entities/service.entity'; // Import your entities here
import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

// Load environment variables from .env file (if running outside Docker)
dotenv.config();

// The options object defines how NestJS/TypeORM connects to PostgreSQL
const postgresConfig: TypeOrmModuleOptions = {
  // Database type
  type: 'postgres', 
  
  // Connection details from environment variables
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'admin',
  
  // List of entities/models to load
  entities: [
    RoomEntity,
    Booking,
    Service 
  ],
  
  // Synchronization (for development only! DO NOT use in production)
  // This automatically creates database tables from your entities.
  synchronize: false, 
  
  // Logging for debugging queries (useful during development)
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : false,

  // Optional: Run migrations automatically (better for controlled environment)
  // migrations: ['dist/db/migrations/*.js'],
  // migrationsRun: true,
};

// Exporting as DataSourceOptions is sometimes necessary for NestJS configuration
export const typeOrmConfig: DataSourceOptions = postgresConfig as DataSourceOptions;