import ErrorLog from "../models/ErrorLog.js";

export const errorLogger = (req, err, statusCode) => {
  const { name, message, stack } = err;

  const errorDoc = new ErrorLog({
    name,
    message,
    statusCode: statusCode || err.statusCode,
    stack,
    api: req.originalUrl,
    frontend: req.headers.referer,
    user_browser: req.headers["user-agent"],
    user_id: req.user?._id,
  });

  errorDoc.save();
};
