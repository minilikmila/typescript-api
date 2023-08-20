import { Secret } from "jsonwebtoken";

export const jwt_secret_key: Secret = <Secret>process.env.JWT_SECRET_KEY;
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
export const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY;
