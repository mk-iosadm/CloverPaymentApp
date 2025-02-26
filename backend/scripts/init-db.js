import { initializeDatabase } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Initializing database...');
console.log('Using database URL:', process.env.DATABASE_URL);

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
