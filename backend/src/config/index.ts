import dotenv from 'dotenv';

dotenv.config();

export const {
  PORT = 3000,
  NODE_ENV = 'development',
} = process.env;

export const CORS_ORIGIN = NODE_ENV === 'production' 
  ? 'https://your-production-domain.com'
  : 'http://localhost:3000'; 