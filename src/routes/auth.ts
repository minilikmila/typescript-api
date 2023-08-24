import express, { Router } from "express";
import { validate } from "../middleware/validation_middleware";
import {
  authorization,
  authPassword,
  emailAddress,
  phoneNumber,
} from "../validator/auth_validator";
import { requiredStringFields } from "../validator/common";

import {
  register,
  login,
  confirmPhoneNumber,
  resendPhoneConfirmationCode,
  phoneForgotPassword,
  resetPassword,
  otpAuthenticationRequest,
  otpAuthentication,
  confirmEmail,
} from "../controllers/auth";
import { validatePConfirmation } from "../middleware/check_p_code";

const router: Router = express.Router();

router
  .post(
    "/register",
    validate([
      requiredStringFields("name", "Name", { min: 2, max: 255 }),
      requiredStringFields("email", "Email", { min: 2, max: 255 }),
      requiredStringFields("password", "Password", { min: 2, max: 255 }),
      requiredStringFields("phone_number", "Phone Number", {
        min: 2,
        max: 255,
      }),
      requiredStringFields("country_code", "Country code", {
        min: 2,
        max: 255,
      }),
      emailAddress(),
      authPassword(),
    ]),
    register
  )
  .post("/login", validate([authorization()]), login)
  .post("/confirm_phone", validatePConfirmation, confirmPhoneNumber)
  .get("/resend_phone_code", validatePConfirmation, resendPhoneConfirmationCode)
  .post("/forgot_password", validate([phoneNumber()]), phoneForgotPassword)
  .post("/reset_password", validate([phoneNumber()]), resetPassword)
  .post("/request_otp_authentication_code", otpAuthenticationRequest)
  .post("/otp_authentication", otpAuthentication)
  .post(
    "/confirm_email",
    validate([phoneNumber()]),
    [emailAddress()],
    confirmEmail
  );
//   refresh token

export default router;
