import Redis from "redis";

const redis = await Redis.createClient({ url: process.env.REDIS_URL }).connect();

export default redis;