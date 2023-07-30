import { model, Schema } from "mongoose";

const emailTemplateSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Name must not be empty"],
    },
    subject: {
      type: String,
      required: [true, "Subject must not be empty"],
    },
    content: {
      type: String,
      required: [true, "Content must not be empty"],
    },
    variables: [
      {
        type: String,
        required: [true, "Variables can not be empty"],
      },
    ],
    status: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const EmailTemplate = model("EmailTemplate", emailTemplateSchema);

export default EmailTemplate;
