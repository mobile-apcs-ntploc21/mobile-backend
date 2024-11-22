import { createClient } from "redis";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import config from "../config";

const STORE_PATH = path.join(__dirname, "../../store.json");
const REDIS_URL = `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`;
type RedisClient = ReturnType<typeof createClient>;

class Redis {
  private client: RedisClient;
  private url: string;

  constructor(url: string = REDIS_URL, options: any = {}) {
    this.url = url;
    this.client = createClient({
      url: this.url,
    });

    this.client.on("error", (error) => {
      console.error(error);
    });
    this.client.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  public async start(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to Redis");
    } catch (error) {
      console.error("Cannot connected to Redis:", error);
    }
  }

  /**
   * Read data from Redis
   * @param key Redis key
   */
  async read(key: string): Promise<any> {
    try {
      const getAsync = promisify(this.client.get).bind(this.client);
      const value = await getAsync(key);
      return value;
    } catch (error) {
      console.error("Error reading from Redis:", error);
    }
  }

  /**
   * Write data to Redis
   * @param key Redis key
   * @param value Data to write
   * @param expires Expiry time in seconds
   */
  async write(
    key: string,
    value: any,
    expires: number = 60 * 60 * 24
  ): Promise<void> {
    // Default expiry is 24 hours
    try {
      const setAsync = promisify(this.client.set).bind(this.client);
      await setAsync(key, value, "EX", expires);
    } catch (error) {
      console.error("Error writing to Redis:", error);
    }
  }

  /**
   * Fetch data from Redis or fetch from the server and save to Redis
   * @param key Redis key
   * @param fetcher Function to fetch data from server
   * @param expires Expiry time in seconds
   * @returns Data from Redis or server
   */
  async fetch(
    key: string,
    fetcher: () => Promise<any>,
    expires: number = 60 * 60 * 24
  ): Promise<any | null> {
    try {
      const value = await this.read(key);
      if (value) {
        return JSON.parse(value);
      }

      const data = await fetcher();
      await this.write(key, JSON.stringify(data), expires);
      return data;
    } catch (error) {
      console.error("Error fetching from Redis:", error);
      return null;
    }
  }

  async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    } catch (error) {
      console.error("Error creating data directory:", error);
    }
  }

  async saveStoreToDisk(): Promise<void> {}

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log("Disconnected from Redis");
    } catch (error) {
      console.error("Cannot disconnect from Redis:", error);
    }
  }
}

const redis = new Redis();
redis.start();

export default redis;
