import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";

import emailRegex from "../utils/regex.js";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: String,
    image: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dob: String,
    occupation: String,
    organization: String,
    email: {
      type: String,
      unique: true,
      required: [true, "Email must not be empty"],
      validate: {
        validator: (email) => emailRegex.test(email),
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      required: [true, "Password must not be empty"],
      validate: {
        validator: (password) => password.length >= 6,
        message: () => "Password must be at least 6 character long",
      },
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      sparse: true,
      validate(value) {
        let reg = new RegExp("^[0-9]+$");

        if (!reg.test(value)) {
          throw new Error(
            "Your mobile number cannot contain any Alphabet or Character",
          );
        }

        if (value === " " || value.length === 0) {
          throw new Error("Mobile cannot be empty");
        }
        if (value.length <= 10 || value.length >= 12) {
          throw new Error("Mobile can be of 11 digits, Not more or less");
        }
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: [true, "Role must not be empty"],
      enum: ["user", "admin", "agent"],
    },
    tokenVersion: {
      type: Number,
      required: [true, "TokenVersion must not be empty"],
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    last_login: Date,
    address: String,
  },
  { timestamps: true },
);

userSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.validatePassword = function (data) {
  return bcrypt.compare(data, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = model("User", userSchema);

export default User;
