import { v4 as uuidv4 } from "uuid";

// => https://my-site.com/confirm/<id>
export const createConfirmEmailLink = async (url, userId, redis) => {
  const id = uuidv4();
  await redis.set(id, userId, "ex", 60 * 60 * 24 * 30);
  return `${url}/register-verify/${id}`;
};
