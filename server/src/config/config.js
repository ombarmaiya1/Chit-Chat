import dotenv from 'dotenv';
const envResult = dotenv.config();
if (envResult.error) {
  throw new Error('Failed to load .env file: ' + envResult.error.message);
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Project';
export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;