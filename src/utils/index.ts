import jwt, { JwtPayload } from "jsonwebtoken";
import { jwt_secret_key, JWT_PUBLIC_KEY, JWT_PRIVATE_KEY } from "../config";
import { UserSchemaType } from "../model/model_types";
import HttpError from "./httpError";
import OtpM from "../model/otp";
import { IOtp } from "../interfaces/otpInterface";

const validateToken = (token: string): Object | JwtPayload => {
  try {
    const decoded = jwt.verify(token, jwt_secret_key);

    return decoded;
  } catch (e) {
    throw new HttpError({
      title: "invalid_token",
      code: 400,
      detail: "invalid_token",
    });
  }
};

const generateJWTToken = (
  payload: Object = {},
  options: Object = {}
): string => {
  try {
    //   const privateKey: <any> = JWT_PUBLIC_KEY;
    const defaultOption: Object = {
      expiresIn: "1h",
    };
    return jwt.sign(
      payload,
      jwt_secret_key,
      Object.assign(defaultOption, options)
    );
  } catch (error: any) {
    throw new HttpError({
      title: "jwt_token_generation_error",
      code: 500,
      detail: error,
    });
  }
};

const extractToken = (token: string): string | null => {
  if (token.startsWith("Bearer")) {
    // IF the token is bearer token...
    return token.split(" ")[1];
  }
  return null;
};

const randomPhoneCodeGenerator = (): string => {
  const uuid = "xxxxxx".replace(/x/g, () =>
    Math.floor(Math.random() * 10).toString(16)
  );
  return uuid.substring(0, 6);
};

const generateOTP = (len: number): string => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < len; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const verifyOTP = async (
  userId: string,
  otp: string,
  type: string
): Promise<any> => {
  let otpExists = await OtpM.findOne({
    userId,
    otp,
    type,
  });
  const now = new Date();
  if (!otpExists) {
    throw new HttpError({
      title: "invalid_otp",
      code: 401,
      detail: "invalid_otp_code",
    });
  } else if (otpExists.otp_expired_at && otpExists.otp_expired_at < now) {
    throw new HttpError({
      title: "expired_otp",
      code: 401,
      detail: "your otp code is expired.",
    });
  }
  return otpExists._id;
};

const setOtp = async ({
  userId,
  otp,
  type,
  otp_expired_at,
}: IOtp): Promise<any> => {
  try {
    const opt_value = await OtpM.create({
      userId,
      otp,
      type,
      otp_expired_at,
    });
    return opt_value._id;
  } catch (error: any) {
    throw new HttpError({
      title: "otp_creation_error",
      code: 400,
      detail: error,
    });
  }
};

const removeOtp = async (id: string) => {
  try {
    await OtpM.deleteOne({ _id: id });
  } catch (error: any) {
    throw new HttpError({
      title: "something_went_wrong",
      code: 500,
      detail: error,
    });
  }
};

export {
  generateJWTToken,
  validateToken,
  extractToken,
  generateOTP,
  verifyOTP,
  setOtp,
  removeOtp,
};
