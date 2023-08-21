import { Request, Response, NextFunction } from "express";
import { BodyType, ResponseType } from "../model/interface_types";

export const validatePConfirmation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { code, phone_number } = <BodyType>req.body;

  if (req.originalUrl == "/api/auth/resend_phone_code") {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).send(<ResponseType>{
        message: "Phone number is required.",
        success: false,
      });
    }
  } else if (req.originalUrl == "/api/auth/confirm_phone" && !phone_number) {
    return res.status(400).send(<ResponseType>{
      message: "You have to provide phone number.",
      success: false,
    });
  } else if (!code) {
    return res.status(400).send(<ResponseType>{
      message: "Confirmation code is required.",
      success: false,
    });
  }
  next();
};
