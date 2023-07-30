import { errorLogger } from "../libs/errorLogger.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  const { message, reason, name, statusCode: errStatusCode, stack } = err;

  switch (name) {
    case "AuthenticationError":
    case "JsonWebTokenError":
      statusCode = errStatusCode || 401;
      break;

    case "AuthorizationError":
      statusCode = errStatusCode || 403;
      break;

    case "BadRequestError":
      statusCode = errStatusCode || 400;
      break;

    case "NotFoundError":
      statusCode = errStatusCode || 404;
      break;

    case "MongoError":
      statusCode = 502;
      break;

    case "TokenExpiredError":
      statusCode = errStatusCode || 401;
      break;

    default:
      break;
  }

  if (statusCode !== 401 && process.env.NODE_ENV !== "development") {
    errorLogger(req, err, statusCode);
  }

  return res.status(statusCode).json({
    message,
    reason,
    stack: process.env.NODE_ENV === "production" ? undefined : stack,
  });
};

export default errorHandler;
