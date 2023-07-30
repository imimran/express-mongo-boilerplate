import Redis from "ioredis";

import logger from "./logger.js";

const redis =
  process.env.NODE_ENV === "production"
    ? new Redis(process.env.REDIS_URL)
    : new Redis();

redis.on("connect", (err) => {
  if (err) {
    logger.error(err);
  } else {
    logger.info("Redis connected!");
  }
});

redis.on("error", (err) => {
  logger.error(err);
});

if (process.env.NODE_ENV === "development") {
  redis.monitor((err, monitor) => {
    logger.info("Redis entering monitoring mode...");
    // monitor.on("monitor", logger.info);
    monitor.on("monitor", (time, args, source, database) => {
      logger.info("REDIS:", args);
    });
  });
}

export default redis;

// exports.redis =
//   process.env.NODE_ENV === "production"
//     ? new Redis(process.env.REDIS_URL)
//     : new Redis();
