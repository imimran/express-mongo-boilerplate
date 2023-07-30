import { NotFoundError } from "../utils/Errors.js";

const notFound = (req, res, next) => {
  const error = new NotFoundError(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
};

export default notFound;
