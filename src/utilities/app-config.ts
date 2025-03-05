import dotenv from "dotenv";
dotenv.config();
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  DB_MAX_RETRIES,
  DB_RETRY_INTERVAL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_RETRY,
  REDIS_RETRY_INTERVAL,
} = process.env;
export const appConfig = {
  dbConfig: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: Number(DB_PORT),
    retries: Number(DB_MAX_RETRIES),
    interval: Number(DB_RETRY_INTERVAL),
  },
  redis: {
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    retry: Number(REDIS_RETRY),
    interval: Number(REDIS_RETRY_INTERVAL),
  },
};
