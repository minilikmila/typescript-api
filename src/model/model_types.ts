import { Document, Types } from "mongoose";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "../utils/enum/index";

export interface GoalSchemaType extends Document {
  user: Types.ObjectId;
  text: string;
}

export interface UserSchemaType extends Document {
  name: string;
  email: string;
  country_code?: string;
  phone_number?: string;
  password?: string;
  is_phone_confirmed?: boolean;
  is_email_confirmed?: boolean;
  email_confirmed_at?: Date;
  phone_confirmed_at?: Date;
  email_confirmation_token?: string;
  phone_confirmation_code?: string;
  token?: string;
  _id: Types.ObjectId; // type in interface definition
  token_type: TokenType;
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

export interface SMSMessage {
  body: string;
  to: string;
  from?: string;
}

export type BodyType = {
  name: string;
  password: string | Buffer;
  email: string;
  code: string;
  phone_number?: string;
};

// export interface IOtpSchemaType {
//   userId: string;
//   otp: string;
//   type: IOType;
//   otp_expired_at: Date;
// }
