import pkg from "jsonwebtoken";
const { sign } = pkg;

const createAccessToken = (user) =>
  sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

const createRefreshToken = (user) =>
  sign(
    { userId: user._id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

const sendRefreshToken = (res, token) => {
  res.cookie("jid", token, {
    httpOnly: true,
    path: "/api/v1/auth/refresh_token",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export { createAccessToken, createRefreshToken, sendRefreshToken };
