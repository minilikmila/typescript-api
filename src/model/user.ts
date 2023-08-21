import { Schema, model, Document, Types } from "mongoose";
import { UserSchemaType } from "./interface_types";

// Use Generic type to the schema type
const userSchema = new Schema<UserSchemaType>(
  {
    name: {
      type: String,
      required: [true, "User name is required!"],
    },
    email: {
      type: String,
      required: [true, "Email is required field!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required field!"],
    },
    is_email_confirmed: {
      type: Boolean,
      default: false,
    },
    is_phone_confirmed: {
      type: Boolean,
      default: false,
    },
    phone_confirmation_code: {
      type: String,
      required: false,
    },
    email_confirmation_token: {
      type: String,
      required: false,
    },
    email_confirmed_at: {
      type: Date,
    },
    phone_confirmed_at: {
      type: Date,
    },
    phone_number: {
      type: String,
      required: [true, "Phone number is required field."],
    },
    country_code: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = model<UserSchemaType>("User", userSchema);

export default User;
