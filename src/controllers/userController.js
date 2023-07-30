import User from "../models/User.js";
import ROLE from "../utils/Roles.js";
import { paginatedResult } from "../utils/pagination.js";
import EmailTemplate from "../models/EmailTemplate.js";

import {
  createBulkEmailNotification,
  sendEmergencyEmailNotification,
} from "../utils/EmailNotification.js";

export const me = async (req, res) => {
  const { user } = req;

  res.locals.send("Logged in user details", user);
};

export const userRoles = (req, res) => {
  const roles = Object.values(ROLE.ROLE);
  res.locals.send("User roles", roles);
};

export const getAll = async (req, res, next) => {
  const { page, limit, searchTerm, role, sort } = req.body;
  // Object value parseInt
  Object.keys(sort).forEach((el) => {
    // eslint-disable-next-line radix
    sort[el] = parseInt(sort[el]);
  });

  try {
    const filter = {};

    if (searchTerm) {
      filter.$or = [
        {
          fullName: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }
    if (role) {
      filter.$or = [
        {
          role: {
            $regex: role,
            $options: "i",
          },
        },
      ];
    }
    const [data] = await paginatedResult({
      model: User,
      filter,
      page,
      limit,
      sort,
    });

    return res.locals.send("All user details", data);
  } catch (err) {
    return next(err);
  }
};

export const whatIsMyIp = async (req, res) =>
  res.locals.send("Your Ip Address", { ip: req.ip });

export const update = async (req, res, next) => {
  const {
    firstName,
    lastName,
    image,
    gender,
    dob,
    occupation,
    organization,
    phone,
    address,
  } = req.body;

  try {
    const { user } = req;

    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (image) {
      user.image = image;
    }
    if (gender) {
      user.gender = gender;
    }
    if (dob) {
      user.dob = dob;
    }
    if (phone) {
      user.phone = phone;
    }
    if (occupation !== undefined) {
      user.occupation = occupation;
    }
    if (organization !== undefined) {
      user.organization = organization;
    }
    if (user.firstName || user.lastName !== undefined) {
      user.fullName = `${user.firstName} ${
        user.lastName ? user.lastName : " "
      }`.trim();
    }

    if (address !== undefined) {
      user.address = address;
    }

    await user.save();

    return res.locals.send("Updated Successfully!", user);
  } catch (err) {
    return next(err);
  }
};

export const createUserByAdmin = async (req, res, next) => {
  const { fullName, email, password, role, phone } = req.body;

  try {
    // check email template
    const registerEmailTemplate = await EmailTemplate.findOne({
      name: "registration_successful",
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
      email,
    });

    if (userAlreadyExists) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Email already registered",
          data: [],
        },
      });
    }

    // create user
    let user = await User.create({
      fullName,
      firstName: fullName,
      email,
      password,
      role,
      phone,
      verified: true,
      image: "https://ui-avatars.com/api/?name=" + fullName + "&size=128",
    });

    // save to notification
    await createBulkEmailNotification([
      {
        user_id: user._id,
        recipient: user.email,
        subject: registerEmailTemplate.subject,
        body: registerEmailTemplate.content,
        data: {
          setPassword: password,
          userName: user.fullName,
          url: `${process.env.FRONTEND_HOST}/login`,
        },
        schedule: "emergency",
      },
    ]);
    // send email
    sendEmergencyEmailNotification();

    return res.locals.send("User account create successfully");
  } catch (err) {
    return next(err);
  }
};

export const updateByAdmin = async (req, res, next) => {
  const {
    user_id,
    fullName,
    image,
    gender,
    dob,
    occupation,
    organization,
    phone,
    role,
  } = req.body;

  try {
    // find user
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not found",
          data: [],
        },
      });
    }
    if (user.verified === false) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not verified yet!",
          data: [],
        },
      });
    }

    if (fullName) {
      user.fullName = fullName;
    }
    if (fullName) {
      user.firstName = fullName;
    }
    if (image) {
      user.image = image;
    }
    if (gender) {
      user.gender = gender;
    }
    if (dob) {
      user.dob = dob;
    }
    if (phone) {
      user.phone = phone;
    }
    if (occupation !== undefined) {
      user.occupation = occupation;
    }
    if (organization !== undefined) {
      user.organization = organization;
    }
    if (role) {
      user.role = role;
    }

    await user.save();
    return res.locals.send("Updated Successfully!", user);
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    // find user
    const user = await User.findOne({ _id: user_id }).select("-password");
    if (!user) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not found",
          data: [],
        },
      });
    }

    return res.locals.send("User Details!", user);
  } catch (err) {
    return next(err);
  }
};

export const verifiedByAdmin = async (req, res, next) => {
  const { user_id } = req.params;

  try {
    // find user
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not found",
          data: [],
        },
      });
    }

    if (user.verified) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "Already verified!",
        },
      });
    }

    await User.findByIdAndUpdate(
      { _id: user._id },
      {
        verified: true,
      },
      { new: true },
    );
    return res.locals.send("Verified Successfully!");
  } catch (err) {
    return next(err);
  }
};

export const activeOrNotByAdmin = async (req, res, next) => {
  const { user_id, status } = req.body;

  try {
    // find user
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      return res.json({
        status: 200,
        data: {
          success: false,
          message: "User not found",
        },
      });
    }
    if (status === "Active") {
      if (user.active) {
        return res.json({
          status: 200,
          data: {
            success: false,
            message: "Already active user!",
          },
        });
      }
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          active: true,
        },
        { new: true },
      );
    }
    if (status === "Inactive") {
      await User.findByIdAndUpdate(
        { _id: user._id },
        {
          active: false,
        },
        { new: true },
      );
    }

    return res.locals.send(`User ${status}d`);
  } catch (err) {
    return next(err);
  }
};
