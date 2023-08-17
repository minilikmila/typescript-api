import { Document, Types } from "mongoose";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface GoalSchemaType extends Document {
  user: Types.ObjectId;
  text: string;
}

export interface UserSchemaType extends Document {
  name: string;
  email: string;
  password?: string;
  token?: string;
  _id: Types.ObjectId; // type in interface definition
}

export type ResponseType = {
  // named export
  message: string;
  status?: string;
  success: boolean;
  error?: Error | undefined;
};

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}
