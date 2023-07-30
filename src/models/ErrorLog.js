import { model, Schema } from "mongoose";

const errorLogSchema = new Schema(
  {
    name: String,
    message: String,
    statusCode: String,
    stack: String,
    api: String,
    frontend: String,
    user_browser: String,
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    level: String,
    meta: String,
  },
  { timestamps: { createdAt: "timestamps" } },
);

const ErrorLog = model("ErrorLog", errorLogSchema);

export default ErrorLog;
