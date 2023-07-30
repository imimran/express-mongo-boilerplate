import jwt from "jsonwebtoken";

import User from "../models/User.js";

const loginUser = async (token) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).then(
      (data) =>
        // console.log("data", data);
        data,
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const getLoggedUser = async (req) => {
  const { authorization } = req.headers;
  let user = {};
  if (!authorization) {
    return user;
  }
  const token = authorization.split(" ")[1];
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  user = await User.findById(payload.userId);
  return user;
};
export { loginUser, getLoggedUser };
