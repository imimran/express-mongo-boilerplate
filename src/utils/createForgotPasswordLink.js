import { v4 as uuidv4 } from "uuid";
import C from "../constants.js";

export const createForgotPasswordLink = async (url, userId, redis) => {
  const id = uuidv4();
  await redis.set(`${C.forgotPasswordPrefix}${id}`, userId, "ex", 60 * 60 * 24);
  return `${url}/change-password/${id}`;
};
