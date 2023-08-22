"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middleware/validation_middleware");
const auth_validator_1 = require("../validator/auth_validator");
const auth_1 = require("../controllers/auth");
const check_p_code_1 = require("../middleware/check_p_code");
const router = express_1.default.Router();
router
    .post("/register", (0, validation_middleware_1.validate)([(0, auth_validator_1.emailAddress)(), (0, auth_validator_1.authPassword)()]), auth_1.register)
    .post("/login", (0, validation_middleware_1.validate)([(0, auth_validator_1.authorization)()]), auth_1.login)
    .post("/confirm_phone", check_p_code_1.validatePConfirmation, auth_1.confirmPhoneNumber)
    .get("/resend_phone_code", check_p_code_1.validatePConfirmation, auth_1.resendPhoneConfirmationCode)
    .post("/forgot_password", (0, validation_middleware_1.validate)([(0, auth_validator_1.phoneNumber)()]), auth_1.phoneForgotPassword)
    .post("/reset_password", (0, validation_middleware_1.validate)([(0, auth_validator_1.phoneNumber)()]), auth_1.resetPassword)
    .post("/request_otp_authentication_code", auth_1.otpAuthenticationRequest)
    .post("/otp_authentication", auth_1.otpAuthentication)
    .post("/confirm_email", (0, validation_middleware_1.validate)([(0, auth_validator_1.phoneNumber)()]), [(0, auth_validator_1.emailAddress)()], auth_1.confirmEmail);
exports.default = router;
