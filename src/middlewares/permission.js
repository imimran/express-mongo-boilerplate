import jwt from "jsonwebtoken";
import User from "../models/User.js";

const permission = (roleArray) => async (req, res, next) => {
  try {
    let { user } = req;

    if (!user) {
      const { authorization } = req.headers;

      if (!authorization) {
        return res.status(401).json({
          status: 401,
          data: {
            success: false,
            message: "not authenticated",
          },
        });
        // throw new AuthenticationError("not authenticated");
      }

      const token = authorization.split(" ")[1];
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      user = await User.findById(payload.userId);
      req.user = user;
    }

    if (!roleArray.includes(user.role)) {
      return res.status(401).json({
        status: 401,
        data: {
          success: false,
          message: "You don't have enough permission to perform this action",
        },
      });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default permission;
