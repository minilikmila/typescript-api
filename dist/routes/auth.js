"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const check_p_code_1 = require("../middleware/check_p_code");
const router = express_1.default.Router();
router
    .post("/register", auth_1.register)
    .post("/login", auth_1.login)
    .post("/confirm_phone", check_p_code_1.validatePConfirmation, auth_1.confirmPhoneNumber)
    .get("/resend_phone_code", check_p_code_1.validatePConfirmation, auth_1.resendPhoneConfirmationCode)
    .post("/forgot_password", auth_1.phoneForgotPassword)
    .post("/reset_password", auth_1.resetPassword);
exports.default = router;
