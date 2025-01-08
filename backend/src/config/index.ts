import dotenv from 'dotenv';

dotenv.config();

export const {
  PORT = 3000,
  MONGODB_URI = 'mongodb://localhost:27017/paysub',
  JWT_SECRET = 'your-secret-key',
  NODE_ENV = 'development',
} = process.env;

export const CORS_ORIGIN = NODE_ENV === 'production' 
  ? 'https://your-production-domain.com'
  : 'http://localhost:3000'; 