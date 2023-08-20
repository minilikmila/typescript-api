import express, { Router } from "express";
import {
  register,
  login,
  confirmPhoneNumber,
  resendPhoneConfirmationCode,
  phoneForgotPassword,
  resetPassword,
} from "../controllers/auth";
import { validatePConfirmation } from "../middleware/check_p_code";

const router: Router = express.Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/confirm_phone", validatePConfirmation, confirmPhoneNumber)
  .get("/resend_phone_code", validatePConfirmation, resendPhoneConfirmationCode)
  .post("/forgot_password", phoneForgotPassword)
  .post("/reset_password", resetPassword);

export default router;
