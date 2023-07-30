import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import EmailTemplate from "../models/EmailTemplate.js";
import redis from "../libs/redis.js";
import C from "../constants.js";
import { getLoggedUser } from "../middlewares/authCheck.js";
import ROLE from "../utils/Roles.js";

import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/token.js";

import {
  createBulkEmailNotification,
  sendEmergencyEmailNotification,
} from "../utils/EmailNotification.js";

import { createConfirmEmailLink } from "../utils/createConfirmEmailLink.js";

import { createForgotPasswordLink } from "../utils/createForgotPasswordLink.js";

// eslint-disable-next-line consistent-return
export const register = async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  try {
    // check email template
    const registerEmailTemplate = await EmailTemplate.findOne({
      name: "registration_verification",
    });
    if (!registerEmailTemplate) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Registration verification email template not found",
          data: [],
        },
      });
    }
    // check already exists
    const userAlreadyExists = await User.exists({
      $or: [{ email }, { phone }],
    });

    if (userAlreadyExists) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Email or Phone already registered",
          data: [],
        },
      });
    }

    // create user
    let user = await User.create({
      firstName: fullName,
      fullName,
      email,
      password,
      role: ROLE.USER,
      phone,
      image: "https://ui-avatars.com/api/?name=" + fullName + "&size=128",
    });

    const url = await createConfirmEmailLink(
      process.env.FRONTEND_HOST,
      user._id,
      redis,
    );

    // save to notification
    await createBulkEmailNotification([
      {
        user_id: user._id,
        recipient: user.email,
        subject: registerEmailTemplate.subject,
        body: registerEmailTemplate.content,
        data: {
          fullName: user.fullName,
          url,
          linkText: "Confirm Registration",
        },
        schedule: "emergency",
      },
    ]);
    // send email
    sendEmergencyEmailNotification();

    return res.locals.send(
      "A verification mail has been sent to your email address, please verify your email address",
    );
  } catch (err) {
    return next(err);
  }
};

export const confirm = async (req, res, next) => {
  const { id } = req.params;

  try {
    const userId = await redis.get(id);
    if (userId) {
      await User.updateOne({ _id: userId }, { verified: true });
      await redis.del(id);
      return res.json({
        status: 200,
        data: {
          success: true,
          message: "Your registation successfully verified!",
          verified: true,
        },
      });
    }
    return res.json({
      status: 401,
      data: {
        success: false,
        message: "Invalid request!",
        verified: false,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    let isMatched;
    if (user) {
      isMatched = await bcrypt.compare(password, user.password);
    }
    if (!user) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "Wrong email or password",
          data: [],
        },
      });
    }

    if (!isMatched) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "Wrong email or password",
          data: [],
        },
      });
    }
    // check verified email
    if (!user.verified) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "Please verify your email address",
          verified: false,
        },
      });
    }

    // check verified email
    if (!user.active) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "You are Blocked! Contact our support center.",
        },
      });
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      return res.json({
        status: 401,
        data: {
          success: false,
          message: "Wrong email or password",
          data: [],
        },
      });
    }

    sendRefreshToken(res, createRefreshToken(user));

    // update user login time
    await User.findByIdAndUpdate(
      { _id: user._id },
      {
        last_login: activity.createdAt,
      },
      { new: true },
    );

    await redis.del(email);

    return res.locals.send("Successfully logged in", {
      user,
      accessToken: createAccessToken(user),
    });
  } catch (err) {
    return next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  const loginAgainMsg = "Please login again";

  try {
    const token = req.cookies.jid;
    if (!token) {
      throw new Error(
        JSON.stringify({
          status: 400,
          data: {
            success: false,
            message: "No token provided",
          },
        }),
      );
    }

    let payload = null;
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // token is valid and
    // we can send back an access token
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(
        res.json({
          status: 401,
          data: {
            success: false,
            message: loginAgainMsg,
          },
        }),
      );
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return next(
        res.json({
          status: 401,
          data: {
            success: false,
            message: loginAgainMsg,
          },
        }),
      );
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.locals.send("New token", {
      accessToken: createAccessToken(user),
    });
  } catch (err) {
    return next(
      res.json({
        status: 401,
        data: {
          success: false,
          message: loginAgainMsg,
        },
      }),
    );
  }
};

export const sendForgotPasswordEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    // check email template
    const forgotPasswordEmailTemplate = await EmailTemplate.findOne({
      name: "forgot_password",
    });
    if (!forgotPasswordEmailTemplate) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Forgot password email template not found",
        },
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not found!",
        },
      });
    }

    const url = await createForgotPasswordLink(
      process.env.FRONTEND_HOST,
      user._id,
      redis,
    );
    // save to notification
    await createBulkEmailNotification([
      {
        user_id: user._id,
        recipient: user.email,
        subject: forgotPasswordEmailTemplate.subject,
        body: forgotPasswordEmailTemplate.content,
        data: {
          fullName: user.fullName,
          url,
          linkText: "Reset Password",
        },
        schedule: "emergency",
      },
    ]);
    // send email
    sendEmergencyEmailNotification();

    return res.locals.send(
      "An Email has been sent to your email address, please check your email address",
    );
  } catch (err) {
    return next(err);
  }
};

export const forgotPasswordChange = async (req, res, next) => {
  const { newPassword, key } = req.body;

  try {
    const redisKey = `${C.forgotPasswordPrefix}${key}`;

    const userId = await redis.get(redisKey);
    if (!userId) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Key has expired",
          data: [],
        },
      });
    }

    const user = await User.findById(userId).select("password");
    user.password = newPassword;

    const updatePromise = user.save();

    const deleteKeyPromise = redis.del(redisKey);

    await Promise.all([updatePromise, deleteKeyPromise]);

    return res.locals.send("Password successfully changed");
  } catch (err) {
    return next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const { user } = req;

    if (oldPassword === newPassword) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Old password can't change as new password",
          data: [],
        },
      });
    }

    const valid = await user.validatePassword(oldPassword);

    if (!valid) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Wrong old password",
          data: [],
        },
      });
    }

    user.password = newPassword;
    await user.save();
    return res.locals.send("Password successfully changed");
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res) => {
  try {
    const user = await getLoggedUser(req);
    if (user) {
      await createActivityLog(
        user._id,
        "logout",
        "You have logged out",
        user._id,
      );
    }
    sendRefreshToken(res, "");
    return res.locals.send("Successfully logged out");
  } catch (error) {
    sendRefreshToken(res, "");
    return res.locals.send("Successfully logged out");
  }
};

export const reverifyAccount = async (req, res, next) => {
  const { email } = req.body;

  try {
    // check email template
    const registerEmailTemplate = await EmailTemplate.findOne({
      name: "re_verification",
    });
    if (!registerEmailTemplate) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Registration verification email template not found",
          data: [],
        },
      });
    }
    // check user
    const findUser = await User.findOne({
      email,
    });

    if (!findUser) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Account not create yet.",
        },
      });
    }

    if (findUser.verified === true) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Account already verified.",
        },
      });
    }
    const url = await createConfirmEmailLink(
      process.env.BACKEND_HOST,
      findUser._id,
      redis,
    );

    // send email
    sendEmergencyEmailNotification();
    // save to notification
    await createBulkEmailNotification([
      {
        user_id: findUser._id,
        recipient: findUser.email,
        subject: registerEmailTemplate.subject,
        body: registerEmailTemplate.content,
        data: {
          url,
          linkText: "Verify Registration",
          fullName: findUser.fullName,
        },
        schedule: "emergency",
      },
    ]);
    // send email
    sendEmergencyEmailNotification();

    return res.locals.send(
      "A verification mail has been sent to your email address, please verify your email address",
    );
  } catch (err) {
    return next(err);
  }
};

export const checkVeifiedUser = async (req, res, next) => {
  const { token } = req.params;

  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (error, verifiedJwt) => {
        if (error) {
          return res.json({
            status: 401,
            data: {
              success: false,
              message: "Invalid token!",
              verified: false,
            },
          });
        }
        if (verifiedJwt) {
          const user = await User.findById(verifiedJwt.userId);
          if (user.verified === true) {
            return res.json({
              status: 200,
              data: {
                success: true,
                message: "Verified!",
                verified: true,
              },
            });
          } else {
            return res.json({
              status: 401,
              data: {
                success: false,
                message: "Not verified yet!",
                verified: false,
              },
            });
          }
        }
      },
    );
  } catch (err) {
    return next(err);
  }
};
