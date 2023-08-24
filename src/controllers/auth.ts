import { Request, Response } from "express";
import {
  ResponseType,
  UserSchemaType,
  SMSMessage,
  BodyType,
} from "../model/interface_types";
import User from "../model/user";
import bcrypt from "bcrypt";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { jwt_secret_key, TWILIO_WHATSAPP_NUMBER } from "../config";
import { sendPhoneSMS } from "../services/phone_sms_sender";
import {
  generateOTP,
  verifyOTP,
  setOtp,
  removeOtp,
  generateJWTToken,
  validateToken,
} from "../utils/index";
import Otp from "../model/otp";
import { IOtp } from "../interfaces/otpInterface";
import { OtpTypes, TokenType } from "../utils/enum";
import HttpError from "../utils/httpError";
import VerifyEmailTemplate from "../templates/verifyEmailTemplate";
import Mailer, { sendEmail } from "../services/mail_service";
import Logging from "../library/logging";

export const register = async (req: Request, res: Response) => {
  const body: UserSchemaType = req.body;

  try {
    // if (
    //   !body.email ||
    //   !body.name ||
    //   !body.password ||
    //   !body.phone_number ||
    //   !body.country_code
    // ) {
    //   console.log("HEre!!");
    //   return res.status(400).json(<ResponseType>{
    //     message: `Something went wrong 🔥.`,
    //     success: false,
    //     status: "Internal Server Error",
    //   });
    // }
    const user_exists = await User.findOne({ email: body.email });

    if (user_exists) {
      throw new HttpError({
        title: "duplicate_account",
        code: 400,
        detail: "User already available",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // we can also use as const: Promise<UserSchemaType> = User.create({name, email, password})
    const user: UserSchemaType = await User.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone_number: body.phone_number,
      country_code: body.country_code,
    });
    if (!user) {
      throw new HttpError({
        title: "error_on_account_signup",
        code: 500,
        detail: "Error encountered when signup.",
      });
    }
    user.token_type = TokenType.EMAIL_VERIFICATION;

    const confirmationToken: string = await tokenBuilder(user);

    const emailTemplate = VerifyEmailTemplate(confirmationToken);

    const mailService = new Mailer();
    Logging.info(`Transporter status: ${await mailService.verifyConnection()}`);
    await mailService.sendEmail({
      to: body.email,
      subject: "Verification",
      html: emailTemplate.html,
    });

    return res.status(200).json(<ResponseType>{
      message:
        "Signed up successfully. Confirmation sent via your email, Please confirm your account.",
      success: true,
    });
  } catch (error: any) {
    Logging.error(`Error: ${req.originalUrl}: encountered error - ${error}`);
    let err_code = error?.opts?.code || 500;

    return res.status(err_code).send(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      error: error,
      success: false,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const body: BodyType = req.body;
  try {
    if (!body.phone_number || !body.password) {
      throw new HttpError({
        title: "missed_required_field",
        detail: "You have to provide required fields.",
        code: 400,
      });
    }
    // request user data

    const foundUser = await User.findOne<UserSchemaType>({
      phone_number: body.phone_number,
    });
    if (
      (foundUser && !foundUser.is_phone_confirmed) ||
      !foundUser?.is_email_confirmed
    ) {
      throw new HttpError({
        title: "inactive_account",
        detail:
          "Please confirm your account. check your mobile sms message or email.",
        code: 400,
      });
    }
    if (!foundUser || !foundUser.password) {
      throw new HttpError({
        title: "account_not_found",
        detail: "account not found.",
        code: 404,
      });
    }

    const isMatched = await bcrypt.compare(body.password, foundUser?.password);
    if (!isMatched) {
      throw new HttpError({
        title: "incorrect_credentials.",
        detail: "invalid username or password.",
        code: 400,
      });
    }
    const accessToken = await tokenBuilder(foundUser);
    return res.status(200).json(<UserSchemaType>{
      _id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      phone_number: body.phone_number,
      token: accessToken,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong",
      success: false,
      error: error,
    });
  }
};
const tokenBuilder = async (user: UserSchemaType): Promise<string> => {
  const token = generateJWTToken(
    <UserSchemaType>{
      id: user.id,
      email: user.email,
      token: user.token_type || TokenType.ACCESS,
    },
    <JwtPayload>{
      issuer:
        user.token_type === TokenType.EMAIL_VERIFICATION
          ? user.email
          : user.phone_number,
      subject: user.id,
      audience: "root",
    }
  );
  return token;
};
// email confirmation or verification
export const confirmEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { token, email } = req.body;
  try {
    if (!email || !token) {
      throw new HttpError({
        title: "required_field_missed",
        code: 400,
        detail: "Phone number and verification token is required fields.",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpError({
        title: "account_not_found",
        detail: "Account not found with this email",
        code: 404,
      });
    }
    if (user.is_email_confirmed) {
      throw new HttpError({
        title: "already_confirmed",
        detail: "The account is already confirmed.",
        code: 404,
      });
    }
    const decoded: JwtPayload = await validateToken(token);

    if (decoded.email != user.email) {
      throw new HttpError({
        title: "invalid_request",
        code: 400,
        detail: "User metadata mismatch.",
      });
    }

    user.is_email_confirmed = true;
    user.email_confirmed_at = new Date();

    await user.save();

    let otpExpiration: any = new Date();
    otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    const p_code = generateOTP(6);
    const to = `${user.country_code}${user.phone_number}`;

    await setOtp(<IOtp>{
      userId: user.id,
      otp: p_code,
      type: OtpTypes.VERIFICATION,
      otp_expired_at: new Date(otpExpiration),
    });

    // send confirmation SMS
    sendPhoneSMS(<SMSMessage>{
      body: `${p_code} - Is your verification code and valid for only 10 minutes, please confirm to activate your account. and then you can login to your account.`,
      to,
      // from: TWILIO_WHATSAPP_NUMBER,
    });

    return res.status(200).json(<ResponseType>{
      message:
        "Your email is confirmed. Now we sent OTP code to your mobile number, Please confirm your phone. and then you have authenticated access to your account.",
    });
  } catch (error: any) {
    Logging.error(`Error: ${req.originalUrl}: encountered error - ${error}`);
    let err_code = error?.opts?.code || 500;

    return res.status(err_code).send(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      error: error,
      success: false,
    });
  }
};
// Phone confirmation....
export const confirmPhoneNumber = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { code, phone_number } = <BodyType>req.body;

    const user = await User.findOne({ phone_number });
    if (!user || user?.is_phone_confirmed) {
      throw new HttpError({
        title: "account_not_found",
        detail: "Account not found or it's already confirmed!.",
        code: 404,
      });
    }

    const validOtp = await verifyOTP(user.id, code, OtpTypes.VERIFICATION);
    console.log("OPT id", validOtp);

    await user.updateOne(<UserSchemaType>{
      is_phone_confirmed: true,
      phone_confirmed_at: new Date(),
    });

    await removeOtp(validOtp);

    return res.status(200).json(<ResponseType>{
      message: "Confirmed. check your email to finish your activation process.",
      success: true,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};
// Resend phone confirmation code ...
export const resendPhoneConfirmationCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phone_number } = req.body;

  try {
    const user = await User.findOne({ phone_number });
    if (!user || user.is_phone_confirmed) {
      throw new HttpError({
        title: "account_not_found",
        code: 404,
        detail: "Account with this phone number is not found.",
      });
    }

    if (!user.country_code) {
      throw new HttpError({
        title: "can_not_send_to_your_number",
        code: 500,
        detail:
          "We can't send the confirmation code to your phone. Please, contact the center.",
      });
    }
    const code = generateOTP(6);
    const to = `${user?.country_code}${user?.phone_number}`;

    let otpExpiration: any = new Date();
    otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    await setOtp(<IOtp>{
      userId: user.id,
      otp: code,
      type: OtpTypes.VERIFICATION,
      otp_expired_at: new Date(otpExpiration),
    });
    // send confirmation SMS
    sendPhoneSMS(<SMSMessage>{
      body: `${code} - Is your confirmation code and valid for only 10 minutes, please confirm to activate your account.`,
      to,
      // from: TWILIO_WHATSAPP_NUMBER,
    });

    return res.status(200).json(<UserSchemaType & ResponseType>{
      message: "Confirmation sent successfully. Check your mobile phone.",
      id: user?.id,
      success: true,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};
// forgot password
export const phoneForgotPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      throw new HttpError({
        title: "required_field_missed",
        code: 400,
        detail: "Phone number is required field.",
      });
    }
    const user = await User.findOne({ phone_number });
    if (!user) {
      throw new HttpError({
        title: "account_not_found",
        code: 404,
        detail: "Account not found by this phone number.",
      });
    }
    if (!user.country_code) {
      throw new HttpError({
        title: "can_not_send_to_your_number",
        code: 500,
        detail:
          "We could't sent OTP code to your phone. Please, contact the center.",
      });
    }
    const to = `${user.country_code}${user.phone_number}`;
    const code = generateOTP(6);
    let otpExpiration: any = new Date();
    otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);
    await setOtp(<IOtp>{
      userId: user.id,
      otp: code,
      type: OtpTypes.FORGET,
      otp_expired_at: new Date(otpExpiration),
    });

    await sendPhoneSMS(<SMSMessage>{
      body: `${code} - Is your OTP code and valid for only 10 minutes, please reset your password before within 10 minutes.`,
      to,
    });

    return res.status(200).json(<ResponseType>{
      message:
        "Successfully sent. Check your mobile phone. It's valid for only 10 minutes",
      success: true,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phone_number, code, password } = req.body;
  try {
    if (!phone_number || !code || !password) {
      throw new HttpError({
        title: "required_field_missed",
        code: 400,
        detail:
          "Phone number, confirmation code, and your new password is required fields.",
      });
    }
    const user = await User.findOne({ phone_number });
    if (!user) {
      throw new HttpError({
        title: "account_not_found",
        code: 404,
        detail: "Account not found with this number.",
      });
    }

    const validOtp = await verifyOTP(user.id, code, OtpTypes.FORGET);

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    await user.save();

    await removeOtp(validOtp);

    return res.status(200).json(<ResponseType>{
      message: "Successful.",
      success: true,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};

export const otpAuthentication = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phone_number, code } = req.body;
  try {
    if (!phone_number || !code) {
      throw new HttpError({
        title: "required_field_missed",
        code: 400,
        detail:
          "Your phone number, and authentication code is required fields.",
      });
    }

    const user = await User.findOne({ phone_number });
    if (!user) {
      throw new HttpError({
        title: "account_not_found",
        code: 404,
        detail: "Account not found with this number.",
      });
    }

    const validOtp = await verifyOTP(user.id, code, OtpTypes.AUTHENTICATION);
    await removeOtp(validOtp);

    const accessToken = await tokenBuilder(user);

    return res.status(200).json(<UserSchemaType>{
      _id: user.id,
      name: user.name,
      email: user.email,
      phone_number,
      token: accessToken,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};

export const otpAuthenticationRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { phone_number } = req.body;
  try {
    if (!phone_number) {
      throw new HttpError({
        title: "required_field_missed",
        code: 400,
        detail: "Phone number is required field.",
      });
    }
    const user = await User.findOne({ phone_number });
    if (!user) {
      throw new HttpError({
        title: "account_not_found",
        code: 404,
        detail: "Account not found with this number.",
      });
    }

    const to = `${user.country_code}${user.phone_number}`;
    const code = generateOTP(6);

    let otpExpiration: any = new Date();
    otpExpiration = otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    await setOtp(<IOtp>{
      userId: user.id,
      otp: code,
      type: OtpTypes.AUTHENTICATION,
      otp_expired_at: new Date(otpExpiration),
    });

    await sendPhoneSMS(<SMSMessage>{
      body: `${code} - Is your Authentication OTP code and it's valid for only 10 minutes, you can authenticate using it within 10 minutes and only once.`,
      to,
    });

    return res.status(200).json(<ResponseType>{
      message:
        "Your authentication OTP code is sent via your phone, Please check your phone. It's valid for 10 minutes only.",
      success: true,
    });
  } catch (error: any) {
    let err_code = error?.opts?.code || 500;
    return res.status(err_code).json(<ResponseType>{
      message: error?.opts?.title || "Something went wrong.",
      success: false,
      error: error,
    });
  }
};
