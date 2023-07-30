import { model, Schema } from "mongoose";
import emailRegex from "../utils/regex.js";

const notificationSchema = new Schema(
  {
    user_id: {
      // user_id with -1 will refer to guests only
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a userId"],
      ref: "User",
    },
    recipient: {
      type: String,
      trim: true,
      validate: {
        validator: (email) => emailRegex.test(email),
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
    },
    content: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => {
          if (value === "") return false;
          return true;
        },
        message: (_) => "content cannot be empty",
      },
    },
    process_date: Date,
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      required: true,
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["email", "sms", "firebase"],
      required: true,
    },
    schedule: {
      type: String,
      enum: ["regular", "emergency", "scheduled"],
      required: true,
    },
    notes: [
      {
        status: String,
        process_time: Date,
        message: String,
      },
    ],
  },
  { timestamps: true },
);

const Notification = model("Notification", notificationSchema);

export default Notification;
