import jwt from "jsonwebtoken";
import User from "../models/User.js";
// import { AuthenticationError } from "../utils/Errors";

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    if (!authorization) {
      // throw new AuthenticationError("not authenticated");
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "not authenticated",
        },
      });
    }

    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

export default requireAuth;
