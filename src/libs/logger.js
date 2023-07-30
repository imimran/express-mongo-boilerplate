import winston from "winston";

const { combine, splat, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (metadata) {
    const metadataStr = JSON.stringify(metadata);
    if (metadataStr !== "{}") msg += metadataStr;
  }
  return msg;
});

const transports = [
  new winston.transports.Console({
    level: "debug",
  }),
];

const logger = winston.createLogger({
  level: "error",
  format: combine(
    winston.format.colorize(),
    splat(),
    timestamp({
      format: "MMM-DD-YYYY HH:mm:ss",
    }),
    myFormat,
  ),
  transports,
});
export default logger;
