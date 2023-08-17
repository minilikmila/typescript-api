import { Schema, model, Document, Types } from "mongoose";
import { UserSchemaType } from "./model_types";

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
    },
    password: {
      type: String,
      required: [true, "Password is required field!"],
    },
  },
  {
    timestamps: true,
  }
);

const User = model<UserSchemaType>("User", userSchema);

export default User;
