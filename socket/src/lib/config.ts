import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

export const PORT = Number(process.env.PORT) || 3000;
export const THRESHOLD_HEARTBEAT =
  Number(process.env.THRESHOLD_HEARTBEAT) || 30000;
