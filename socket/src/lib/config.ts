import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

export const PORT = Number(process.env.PORT) || 3000;
